/**
 * Forum Utilities
 * CRUD operations for threads, replies, and voting
 */

import { createClient } from "@/lib/supabase/client";

export interface ForumCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    display_order: number;
}

export interface ForumThread {
    id: string;
    category_id: string;
    author_id: string;
    title: string;
    content: string;
    image_url?: string;
    is_pinned: boolean;
    is_locked: boolean;
    view_count: number;
    reply_count: number;
    vote_score: number;
    last_activity_at: string;
    created_at: string;
    author?: { full_name?: string; avatar_url?: string; reputation_score?: number };
    category?: ForumCategory;
}

export interface ForumReply {
    id: string;
    thread_id: string;
    parent_reply_id?: string;
    author_id: string;
    content: string;
    is_solution: boolean;
    vote_score: number;
    created_at: string;
    author?: { full_name?: string; avatar_url?: string; reputation_score?: number };
    replies?: ForumReply[];
}

/**
 * Get all forum categories
 */
export async function getCategories(): Promise<ForumCategory[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

    if (error) throw error;
    return data || [];
}

/**
 * Get threads in a category
 */
export async function getThreads(
    categoryId: string,
    page: number = 1,
    limit: number = 20,
    sortBy: "latest" | "popular" | "unanswered" = "latest"
): Promise<{ threads: ForumThread[]; total: number }> {
    const supabase = createClient();
    const offset = (page - 1) * limit;

    let query = supabase
        .from("forum_threads")
        .select("*, author:profiles(full_name, avatar_url, reputation_score), category:forum_categories(name, slug)", { count: "exact" })
        .eq("category_id", categoryId)
        .eq("is_deleted", false);

    // Sorting
    if (sortBy === "latest") {
        query = query.order("is_pinned", { ascending: false }).order("last_activity_at", { ascending: false });
    } else if (sortBy === "popular") {
        query = query.order("vote_score", { ascending: false });
    } else {
        query = query.eq("reply_count", 0).order("created_at", { ascending: false });
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;
    return { threads: data || [], total: count || 0 };
}

/**
 * Get single thread with replies
 */
export async function getThread(threadId: string): Promise<ForumThread | null> {
    const supabase = createClient();

    // Increment view count (fire and forget)
    try {
        await supabase.from("forum_threads").update({ view_count: 1 }).eq("id", threadId);
    } catch { /* ignore */ }

    const { data, error } = await supabase
        .from("forum_threads")
        .select("*, author:profiles(full_name, avatar_url, reputation_score), category:forum_categories(name, slug)")
        .eq("id", threadId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get replies for a thread
 */
export async function getReplies(threadId: string): Promise<ForumReply[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("forum_replies")
        .select("*, author:profiles(full_name, avatar_url, reputation_score)")
        .eq("thread_id", threadId)
        .eq("is_deleted", false)
        .order("is_solution", { ascending: false })
        .order("vote_score", { ascending: false })
        .order("created_at");

    if (error) throw error;

    // Build threaded structure
    const replies = data || [];
    const rootReplies = replies.filter(r => !r.parent_reply_id);

    function attachChildren(reply: ForumReply): ForumReply {
        const children = replies.filter(r => r.parent_reply_id === reply.id);
        return {
            ...reply,
            replies: children.map(attachChildren),
        };
    }

    return rootReplies.map(attachChildren);
}

/**
 * Create a new thread
 */
export async function createThread(
    categoryId: string,
    title: string,
    content: string,
    imageUrl?: string
): Promise<ForumThread> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("forum_threads")
        .insert({
            category_id: categoryId,
            author_id: user.id,
            title,
            content,
            image_url: imageUrl,
        })
        .select()
        .single();

    if (error) throw error;

    // Update user's post count (fire and forget)
    try {
        const { data: profile } = await supabase.from("profiles").select("forum_post_count").eq("id", user.id).single();
        await supabase.from("profiles").update({ forum_post_count: (profile?.forum_post_count || 0) + 1 }).eq("id", user.id);
    } catch { /* ignore */ }

    return data;
}

/**
 * Create a reply
 */
export async function createReply(
    threadId: string,
    content: string,
    parentReplyId?: string
): Promise<ForumReply> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("forum_replies")
        .insert({
            thread_id: threadId,
            author_id: user.id,
            content,
            parent_reply_id: parentReplyId,
        })
        .select()
        .single();

    if (error) throw error;

    // Update thread reply count and activity
    try {
        const { data: thread } = await supabase.from("forum_threads").select("reply_count").eq("id", threadId).single();
        await supabase.from("forum_threads").update({
            reply_count: (thread?.reply_count || 0) + 1,
            last_activity_at: new Date().toISOString(),
        }).eq("id", threadId);
    } catch { /* ignore */ }

    return data;
}

/**
 * Vote on thread or reply
 */
export async function vote(
    targetType: "thread" | "reply",
    targetId: string,
    voteValue: 1 | -1
): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Check existing vote
    const { data: existing } = await supabase
        .from("forum_votes")
        .select("id, vote_value")
        .eq("user_id", user.id)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .single();

    const table = targetType === "thread" ? "forum_threads" : "forum_replies";

    // Get current score
    const { data: target } = await supabase.from(table).select("vote_score").eq("id", targetId).single();
    const currentScore = target?.vote_score || 0;

    if (existing) {
        if (existing.vote_value === voteValue) {
            // Remove vote
            await supabase.from("forum_votes").delete().eq("id", existing.id);
            await supabase.from(table).update({
                vote_score: currentScore - voteValue,
            }).eq("id", targetId);
        } else {
            // Change vote
            await supabase.from("forum_votes").update({ vote_value: voteValue }).eq("id", existing.id);
            await supabase.from(table).update({
                vote_score: currentScore + (voteValue * 2),
            }).eq("id", targetId);
        }
    } else {
        // New vote
        await supabase.from("forum_votes").insert({
            user_id: user.id,
            target_type: targetType,
            target_id: targetId,
            vote_value: voteValue,
        });
        await supabase.from(table).update({
            vote_score: currentScore + voteValue,
        }).eq("id", targetId);
    }
}

/**
 * Mark reply as solution
 */
export async function markAsSolution(replyId: string, threadId: string): Promise<void> {
    const supabase = createClient();

    // Unmark any existing solutions
    await supabase
        .from("forum_replies")
        .update({ is_solution: false })
        .eq("thread_id", threadId);

    // Mark new solution
    await supabase
        .from("forum_replies")
        .update({ is_solution: true })
        .eq("id", replyId);
}

/**
 * Search forum
 */
export async function searchForum(
    query: string,
    limit: number = 20
): Promise<ForumThread[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("forum_threads")
        .select("*, author:profiles(full_name), category:forum_categories(name, slug)")
        .eq("is_deleted", false)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order("vote_score", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

/**
 * Get user's vote on a target
 */
export async function getUserVote(
    targetType: "thread" | "reply",
    targetId: string
): Promise<number> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 0;

    const { data } = await supabase
        .from("forum_votes")
        .select("vote_value")
        .eq("user_id", user.id)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .single();

    return data?.vote_value || 0;
}
