/**
 * Moderation Utilities
 * Auto-moderation, reporting, and strike/ban system
 */

import { createClient } from "@/lib/supabase/client";

// Basic profanity list (extend as needed)
const PROFANITY_LIST = [
    "fuck", "shit", "ass", "bitch", "damn", "crap", "bastard",
    "dick", "cock", "pussy", "cunt", "whore", "slut",
];

const SPAM_PATTERNS = [
    /https?:\/\/[^\s]+/gi, // URLs
    /\b(buy now|click here|free money|guaranteed profit)\b/gi,
    /(.)\1{5,}/gi, // Repeated characters
];

/**
 * Check content for profanity
 */
export function containsProfanity(text: string): boolean {
    const lowerText = text.toLowerCase();
    return PROFANITY_LIST.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, "i");
        return regex.test(lowerText);
    });
}

/**
 * Clean profanity from text
 */
export function cleanProfanity(text: string): string {
    let cleaned = text;
    PROFANITY_LIST.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        cleaned = cleaned.replace(regex, "****");
    });
    return cleaned;
}

/**
 * Check for spam patterns
 */
export function containsSpam(text: string): { isSpam: boolean; reason?: string } {
    for (const pattern of SPAM_PATTERNS) {
        if (pattern.test(text)) {
            if (pattern.source.includes("https?")) {
                return { isSpam: true, reason: "Contains external links" };
            }
            return { isSpam: true, reason: "Matches spam pattern" };
        }
    }
    return { isSpam: false };
}

/**
 * Check if user can post (rate limiting for new users)
 */
export async function canUserPost(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const supabase = createClient();

    // Check if user is trusted
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_trusted_member, created_at")
        .eq("id", userId)
        .single();

    if (profile?.is_trusted_member) {
        return { allowed: true };
    }

    // Check posts in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count } = await supabase
        .from("forum_threads")
        .select("*", { count: "exact", head: true })
        .eq("author_id", userId)
        .gte("created_at", yesterday);

    const { count: replyCount } = await supabase
        .from("forum_replies")
        .select("*", { count: "exact", head: true })
        .eq("author_id", userId)
        .gte("created_at", yesterday);

    const totalPosts = (count || 0) + (replyCount || 0);

    if (totalPosts >= 3) {
        return {
            allowed: false,
            reason: "New users are limited to 3 posts per day. Keep participating to earn Trusted Member status!"
        };
    }

    return { allowed: true };
}

/**
 * Check if user is banned
 */
export async function isUserBanned(userId: string): Promise<{ banned: boolean; reason?: string; until?: string }> {
    const supabase = createClient();

    const { data: ban } = await supabase
        .from("user_bans")
        .select("*")
        .eq("user_id", userId)
        .or(`banned_until.gt.${new Date().toISOString()},is_permanent.eq.true`)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (ban) {
        return {
            banned: true,
            reason: ban.reason,
            until: ban.is_permanent ? "permanently" : ban.banned_until,
        };
    }

    return { banned: false };
}

/**
 * Report content
 */
export async function reportContent(
    contentType: "thread" | "reply" | "message" | "user",
    contentId: string,
    reason: string,
    reportedUserId?: string
): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    await supabase.from("user_reports").insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        content_type: contentType,
        content_id: contentId,
        reason,
    });
}

/**
 * Get user's strike count
 */
export async function getUserStrikeCount(userId: string): Promise<number> {
    const supabase = createClient();

    const { count } = await supabase
        .from("user_strikes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    return count || 0;
}

/**
 * Issue a strike to user
 */
export async function issueStrike(
    userId: string,
    reason: string,
    issuedBy: string
): Promise<{ strikeCount: number; action?: string }> {
    const supabase = createClient();

    // Add strike
    await supabase.from("user_strikes").insert({
        user_id: userId,
        reason,
        issued_by: issuedBy,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
    });

    const strikeCount = await getUserStrikeCount(userId);

    // Apply consequences based on strike count
    if (strikeCount === 1) {
        // Warning only
        await createNotification(userId, "warning", "You have received a warning", reason);
        return { strikeCount, action: "warning" };
    } else if (strikeCount === 2) {
        // 7-day ban
        await banUser(userId, reason, 7, issuedBy);
        return { strikeCount, action: "7-day ban" };
    } else if (strikeCount >= 3) {
        // Permanent ban
        await banUser(userId, reason, null, issuedBy, true);
        return { strikeCount, action: "permanent ban" };
    }

    return { strikeCount };
}

/**
 * Ban a user
 */
export async function banUser(
    userId: string,
    reason: string,
    days: number | null,
    issuedBy: string,
    isPermanent: boolean = false
): Promise<void> {
    const supabase = createClient();

    await supabase.from("user_bans").insert({
        user_id: userId,
        reason,
        banned_until: days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : null,
        is_permanent: isPermanent,
        issued_by: issuedBy,
    });
}

/**
 * Create a notification
 */
export async function createNotification(
    userId: string,
    type: string,
    title: string,
    content?: string,
    link?: string,
    actorId?: string
): Promise<void> {
    const supabase = createClient();

    await supabase.from("user_notifications").insert({
        user_id: userId,
        type,
        title,
        content,
        link,
        actor_id: actorId,
    });
}

/**
 * Get pending reports for admin
 */
export async function getPendingReports(): Promise<unknown[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("user_reports")
        .select("*, reporter:profiles!reporter_id(full_name), reported:profiles!reported_user_id(full_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Review a report
 */
export async function reviewReport(
    reportId: string,
    status: "dismissed" | "actioned",
    adminNotes: string,
    reviewedBy: string
): Promise<void> {
    const supabase = createClient();

    await supabase
        .from("user_reports")
        .update({
            status,
            admin_notes: adminNotes,
            reviewed_by: reviewedBy,
            reviewed_at: new Date().toISOString(),
        })
        .eq("id", reportId);
}
