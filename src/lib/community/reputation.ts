/**
 * Reputation & Social Utilities
 * Reputation scoring, badges, follows, and messaging
 */

import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
    id: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
    reputation_score: number;
    forum_post_count: number;
    is_trusted_member: boolean;
    courses_completed?: number;
    follower_count?: number;
    following_count?: number;
}

export interface ReputationBadge {
    name: string;
    icon: string;
    minScore: number;
    color: string;
}

export const REPUTATION_BADGES: ReputationBadge[] = [
    { name: "Novice", icon: "🌱", minScore: 0, color: "text-gray-600" },
    { name: "Contributor", icon: "⭐", minScore: 50, color: "text-blue-600" },
    { name: "Expert", icon: "🔥", minScore: 200, color: "text-purple-600" },
    { name: "Guru", icon: "👑", minScore: 500, color: "text-amber-600" },
];

/**
 * Get user's reputation badge
 */
export function getReputationBadge(score: number): ReputationBadge {
    return [...REPUTATION_BADGES].reverse().find(b => score >= b.minScore) || REPUTATION_BADGES[0];
}

/**
 * Award reputation points
 */
export async function awardReputation(
    userId: string,
    points: number,
    reason: "helpful_reply" | "upvote_received" | "course_completed" | "solution_marked"
): Promise<void> {
    const supabase = createClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("reputation_score")
        .eq("id", userId)
        .single();

    const newScore = (profile?.reputation_score || 0) + points;

    await supabase
        .from("profiles")
        .update({
            reputation_score: newScore,
            is_trusted_member: newScore >= 50, // Trusted at 50+ rep
        })
        .eq("id", userId);
}

/**
 * Get public user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = createClient();

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) return null;

    // Get follower/following counts
    const [{ count: followers }, { count: following }] = await Promise.all([
        supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
        supabase.from("user_follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
    ]);

    return {
        ...profile,
        follower_count: followers || 0,
        following_count: following || 0,
    };
}

/**
 * Follow a user
 */
export async function followUser(userId: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");
    if (user.id === userId) throw new Error("Cannot follow yourself");

    await supabase.from("user_follows").insert({
        follower_id: user.id,
        following_id: userId,
    });

    // Notify the followed user
    const { data: follower } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

    await supabase.from("user_notifications").insert({
        user_id: userId,
        type: "follow",
        title: "New follower",
        content: `${follower?.full_name || "Someone"} started following you`,
        actor_id: user.id,
    });
}

/**
 * Unfollow a user
 */
export async function unfollowUser(userId: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userId);
}

/**
 * Check if following a user
 */
export async function isFollowing(userId: string): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .single();

    return !!data;
}

/**
 * Send a private message
 */
export async function sendMessage(recipientId: string, content: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Check if blocked
    const { data: blocked } = await supabase
        .from("user_blocks")
        .select("id")
        .eq("blocker_id", recipientId)
        .eq("blocked_id", user.id)
        .single();

    if (blocked) throw new Error("Cannot send message to this user");

    await supabase.from("user_messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content,
    });

    // Notify recipient
    const { data: sender } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

    await supabase.from("user_notifications").insert({
        user_id: recipientId,
        type: "message",
        title: "New message",
        content: `${sender?.full_name || "Someone"} sent you a message`,
        link: "/messages",
        actor_id: user.id,
    });
}

/**
 * Get user's messages
 */
export async function getMessages(page: number = 1, limit: number = 20): Promise<unknown[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const offset = (page - 1) * limit;

    const { data, error } = await supabase
        .from("user_messages")
        .select("*, sender:profiles!sender_id(full_name, avatar_url), recipient:profiles!recipient_id(full_name, avatar_url)")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`and(sender_id.eq.${user.id},is_deleted_sender.eq.false),and(recipient_id.eq.${user.id},is_deleted_recipient.eq.false)`)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
}

/**
 * Block a user
 */
export async function blockUser(userId: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    await supabase.from("user_blocks").insert({
        blocker_id: user.id,
        blocked_id: userId,
    });

    // Also unfollow
    await unfollowUser(userId);
}

/**
 * Get notifications
 */
export async function getNotifications(limit: number = 20): Promise<unknown[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("user_notifications")
        .select("*, actor:profiles!actor_id(full_name, avatar_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
    const supabase = createClient();

    await supabase
        .from("user_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return 0;

    const { count } = await supabase
        .from("user_notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null);

    return count || 0;
}
