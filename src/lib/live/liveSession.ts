/**
 * Live Session Management
 * CRUD operations and status management for live sessions
 */

import { createClient } from "@/lib/supabase/client";

export interface LiveSession {
    id: string;
    title: string;
    description?: string;
    scheduled_at: string;
    duration_minutes: number;
    stream_url?: string;
    stream_platform: "youtube" | "zoom" | "streamyard";
    status: "scheduled" | "live" | "ended" | "cancelled";
    min_tier: "free" | "basic" | "medium" | "advanced";
    max_attendees?: number;
    recording_url?: string;
    recording_published: boolean;
    thumbnail_url?: string;
    host_name?: string;
    created_at: string;
    started_at?: string;
    ended_at?: string;
    peak_viewers: number;
    total_unique_viewers: number;
}

export interface SessionRegistration {
    id: string;
    session_id: string;
    user_id: string;
    registered_at: string;
    attended: boolean;
    joined_at?: string;
    left_at?: string;
    watch_duration_seconds: number;
}

/**
 * Get upcoming sessions
 */
export async function getUpcomingSessions(limit: number = 5): Promise<LiveSession[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("live_sessions")
        .select("*")
        .in("status", ["scheduled", "live"])
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

/**
 * Get current live session if any
 */
export async function getCurrentLiveSession(): Promise<LiveSession | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("live_sessions")
        .select("*")
        .eq("status", "live")
        .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<LiveSession | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("live_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get past sessions (recordings)
 */
export async function getPastSessions(
    page: number = 1,
    limit: number = 10
): Promise<{ sessions: LiveSession[]; total: number }> {
    const supabase = createClient();
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
        .from("live_sessions")
        .select("*", { count: "exact" })
        .eq("status", "ended")
        .eq("recording_published", true)
        .order("ended_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { sessions: data || [], total: count || 0 };
}

/**
 * Create a new session (admin only)
 */
export async function createSession(session: Partial<LiveSession>): Promise<LiveSession> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("live_sessions")
        .insert(session)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update session
 */
export async function updateSession(
    sessionId: string,
    updates: Partial<LiveSession>
): Promise<LiveSession> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("live_sessions")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", sessionId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Start a live session
 */
export async function startSession(sessionId: string): Promise<LiveSession> {
    return updateSession(sessionId, {
        status: "live",
        started_at: new Date().toISOString(),
    });
}

/**
 * End a live session
 */
export async function endSession(sessionId: string): Promise<LiveSession> {
    return updateSession(sessionId, {
        status: "ended",
        ended_at: new Date().toISOString(),
    });
}

/**
 * Publish recording
 */
export async function publishRecording(
    sessionId: string,
    recordingUrl: string
): Promise<LiveSession> {
    return updateSession(sessionId, {
        recording_url: recordingUrl,
        recording_published: true,
    });
}

/**
 * Register for a session
 */
export async function registerForSession(
    sessionId: string,
    userId: string
): Promise<SessionRegistration> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("session_registrations")
        .insert({ session_id: sessionId, user_id: userId })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Check if user is registered
 */
export async function isUserRegistered(
    sessionId: string,
    userId: string
): Promise<boolean> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("session_registrations")
        .select("id")
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
}

/**
 * Mark user as joined
 */
export async function markUserJoined(
    sessionId: string,
    userId: string
): Promise<void> {
    const supabase = createClient();

    await supabase
        .from("session_registrations")
        .update({
            attended: true,
            joined_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId)
        .eq("user_id", userId);
}

/**
 * Mark user as left
 */
export async function markUserLeft(
    sessionId: string,
    userId: string
): Promise<void> {
    const supabase = createClient();

    // Get joined time to calculate duration
    const { data: reg } = await supabase
        .from("session_registrations")
        .select("joined_at, watch_duration_seconds")
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .single();

    const now = new Date();
    const joinedAt = reg?.joined_at ? new Date(reg.joined_at) : now;
    const additionalSeconds = Math.floor((now.getTime() - joinedAt.getTime()) / 1000);

    await supabase
        .from("session_registrations")
        .update({
            left_at: now.toISOString(),
            watch_duration_seconds: (reg?.watch_duration_seconds || 0) + additionalSeconds,
        })
        .eq("session_id", sessionId)
        .eq("user_id", userId);
}

/**
 * Get registration count for session
 */
export async function getRegistrationCount(sessionId: string): Promise<number> {
    const supabase = createClient();

    const { count, error } = await supabase
        .from("session_registrations")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId);

    if (error) throw error;
    return count || 0;
}

/**
 * Get current viewer count for live session
 */
export async function getViewerCount(sessionId: string): Promise<number> {
    const supabase = createClient();

    const { data, error } = await supabase
        .rpc("get_session_viewer_count", { session_uuid: sessionId });

    if (error) throw error;
    return data || 0;
}

/**
 * Get sessions for calendar view
 */
export async function getSessionsForMonth(
    year: number,
    month: number
): Promise<LiveSession[]> {
    const supabase = createClient();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const { data, error } = await supabase
        .from("live_sessions")
        .select("*")
        .gte("scheduled_at", startDate.toISOString())
        .lte("scheduled_at", endDate.toISOString())
        .neq("status", "cancelled")
        .order("scheduled_at", { ascending: true });

    if (error) throw error;
    return data || [];
}
