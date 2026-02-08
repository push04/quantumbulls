/**
 * Live Session Analytics
 * Track attendance, engagement, and generate reports
 */

import { createClient } from "@/lib/supabase/client";

export interface SessionReport {
    sessionId: string;
    title: string;
    totalRegistrations: number;
    totalAttendees: number;
    attendanceRate: number;
    peakViewers: number;
    averageWatchTime: number;
    totalMessages: number;
    totalQuestions: number;
    topParticipants: {
        userId: string;
        name: string;
        messageCount: number;
        watchDuration: number;
    }[];
}

export interface UserSessionStats {
    totalSessionsAttended: number;
    totalWatchTime: number;
    averageWatchTime: number;
    questionsAsked: number;
    pollsParticipated: number;
    isFrequentAttendee: boolean;
}

/**
 * Get session report for admin
 */
export async function getSessionReport(sessionId: string): Promise<SessionReport> {
    const supabase = createClient();

    // Get session info
    const { data: session } = await supabase
        .from("live_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

    // Get registration stats
    const { data: registrations, count } = await supabase
        .from("session_registrations")
        .select("*, profiles(full_name)", { count: "exact" })
        .eq("session_id", sessionId);

    // Get chat stats
    const { data: messages } = await supabase
        .from("session_chat")
        .select("user_id, is_question")
        .eq("session_id", sessionId)
        .eq("is_deleted", false);

    const attendees = registrations?.filter(r => r.attended) || [];
    const totalMessages = messages?.length || 0;
    const totalQuestions = messages?.filter(m => m.is_question).length || 0;

    // Calculate average watch time
    const totalWatchTime = attendees.reduce(
        (sum, r) => sum + (r.watch_duration_seconds || 0),
        0
    );
    const avgWatchTime = attendees.length > 0
        ? Math.round(totalWatchTime / attendees.length)
        : 0;

    // Get top participants by message count
    const messageCounts: Record<string, number> = {};
    messages?.forEach(m => {
        messageCounts[m.user_id] = (messageCounts[m.user_id] || 0) + 1;
    });

    const topParticipants = attendees
        .map(r => ({
            userId: r.user_id,
            name: (r.profiles as { full_name?: string })?.full_name || "Anonymous",
            messageCount: messageCounts[r.user_id] || 0,
            watchDuration: r.watch_duration_seconds || 0,
        }))
        .sort((a, b) => b.messageCount - a.messageCount)
        .slice(0, 10);

    return {
        sessionId,
        title: session?.title || "",
        totalRegistrations: count || 0,
        totalAttendees: attendees.length,
        attendanceRate: count ? Math.round((attendees.length / count) * 100) : 0,
        peakViewers: session?.peak_viewers || 0,
        averageWatchTime: avgWatchTime,
        totalMessages,
        totalQuestions,
        topParticipants,
    };
}

/**
 * Get user's session statistics
 */
export async function getUserSessionStats(userId: string): Promise<UserSessionStats> {
    const supabase = createClient();

    // Get attendance records
    const { data: registrations } = await supabase
        .from("session_registrations")
        .select("attended, watch_duration_seconds")
        .eq("user_id", userId);

    // Get questions asked
    const { count: questionCount } = await supabase
        .from("session_chat")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_question", true);

    // Get polls participated
    const { count: pollCount } = await supabase
        .from("poll_votes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

    const attended = registrations?.filter(r => r.attended) || [];
    const totalWatchTime = attended.reduce(
        (sum, r) => sum + (r.watch_duration_seconds || 0),
        0
    );

    return {
        totalSessionsAttended: attended.length,
        totalWatchTime,
        averageWatchTime: attended.length > 0
            ? Math.round(totalWatchTime / attended.length)
            : 0,
        questionsAsked: questionCount || 0,
        pollsParticipated: pollCount || 0,
        isFrequentAttendee: attended.length >= 5, // Attended 5+ sessions
    };
}

/**
 * Update peak viewer count
 */
export async function updatePeakViewers(
    sessionId: string,
    currentViewers: number
): Promise<void> {
    const supabase = createClient();

    // Get current peak
    const { data: session } = await supabase
        .from("live_sessions")
        .select("peak_viewers")
        .eq("id", sessionId)
        .single();

    if (currentViewers > (session?.peak_viewers || 0)) {
        await supabase
            .from("live_sessions")
            .update({ peak_viewers: currentViewers })
            .eq("id", sessionId);
    }
}

/**
 * Get power users (frequent attendees)
 */
export async function getPowerUsers(minSessions: number = 5): Promise<{
    userId: string;
    name: string;
    sessionsAttended: number;
    totalWatchTime: number;
}[]> {
    const supabase = createClient();

    const { data } = await supabase
        .from("session_registrations")
        .select("user_id, watch_duration_seconds, profiles(full_name)")
        .eq("attended", true);

    if (!data) return [];

    // Group by user
    const userStats: Record<string, {
        name: string;
        sessions: number;
        totalTime: number;
    }> = {};

    data.forEach(r => {
        if (!userStats[r.user_id]) {
            userStats[r.user_id] = {
                name: (r.profiles as { full_name?: string })?.full_name || "Anonymous",
                sessions: 0,
                totalTime: 0,
            };
        }
        userStats[r.user_id].sessions++;
        userStats[r.user_id].totalTime += r.watch_duration_seconds || 0;
    });

    return Object.entries(userStats)
        .filter(([, stats]) => stats.sessions >= minSessions)
        .map(([userId, stats]) => ({
            userId,
            name: stats.name,
            sessionsAttended: stats.sessions,
            totalWatchTime: stats.totalTime,
        }))
        .sort((a, b) => b.sessionsAttended - a.sessionsAttended);
}

/**
 * Calculate engagement score for a user in a session
 */
export function calculateEngagementScore(
    watchDuration: number,
    sessionDuration: number,
    messagesSent: number,
    questionsAsked: number,
    pollsAnswered: number
): number {
    const watchPercent = Math.min(watchDuration / (sessionDuration * 60), 1);
    const watchScore = watchPercent * 50; // 50% weight for watching
    const chatScore = Math.min(messagesSent * 5, 20); // Max 20 points for chat
    const questionScore = questionsAsked * 10; // 10 points per question
    const pollScore = pollsAnswered * 5; // 5 points per poll

    return Math.round(watchScore + chatScore + questionScore + pollScore);
}

/**
 * Award "Engaged Participant" badge
 */
export async function checkAndAwardEngagementBadge(
    userId: string,
    sessionId: string
): Promise<boolean> {
    const supabase = createClient();

    // Get session details
    const { data: session } = await supabase
        .from("live_sessions")
        .select("duration_minutes")
        .eq("id", sessionId)
        .single();

    // Get user's participation
    const { data: reg } = await supabase
        .from("session_registrations")
        .select("watch_duration_seconds")
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .single();

    const { count: messageCount } = await supabase
        .from("session_chat")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .eq("user_id", userId);

    const watchPercent = (reg?.watch_duration_seconds || 0) /
        ((session?.duration_minutes || 60) * 60);

    // Award badge if watched 80%+ and sent at least 1 message
    if (watchPercent >= 0.8 && (messageCount || 0) >= 1) {
        // TODO: Integrate with gamification badge system
        console.log(`User ${userId} earned Engaged Participant badge for session ${sessionId}`);
        return true;
    }

    return false;
}
