/**
 * Session Manager
 * Core session management utilities for multi-device handling
 */

import { createClient } from '@/lib/supabase/client';
import { parseUserAgent, type DeviceInfo } from './deviceDetection';
import { getGeoLocation, type GeoLocation } from './geoLocation';

export interface Session {
    id: string;
    session_token: string;
    device_name: string;
    device_type: string;
    browser: string;
    os: string;
    ip_address: string | null;
    location_country: string | null;
    location_city: string | null;
    is_current: boolean;
    last_active: string;
    created_at: string;
}

export interface CreateSessionParams {
    userId: string;
    userAgent: string;
    ipAddress?: string;
}

const SESSION_TOKEN_KEY = 'qb_session_token';

/**
 * Create a new session for the user
 */
export async function createSession(params: CreateSessionParams): Promise<Session | null> {
    const supabase = createClient();
    const deviceInfo = parseUserAgent(params.userAgent);
    const geoLocation = params.ipAddress
        ? await getGeoLocation(params.ipAddress)
        : null;

    // Mark all other sessions as not current
    await supabase
        .from('user_sessions')
        .update({ is_current: false })
        .eq('user_id', params.userId);

    // Create new session
    const { data, error } = await supabase
        .from('user_sessions')
        .insert({
            user_id: params.userId,
            device_name: deviceInfo.deviceName,
            device_type: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            ip_address: params.ipAddress || null,
            location_country: geoLocation?.country || null,
            location_city: geoLocation?.city || null,
            is_current: true,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating session:', error);
        return null;
    }

    // Store session token in localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_TOKEN_KEY, data.session_token);
    }

    return data as Session;
}

/**
 * Get the current session token from localStorage
 */
export function getCurrentSessionToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(SESSION_TOKEN_KEY);
}

/**
 * Validate that the current session is still active
 */
export async function validateSession(userId: string): Promise<{ valid: boolean; conflictSession?: Session }> {
    const supabase = createClient();
    const localToken = getCurrentSessionToken();

    if (!localToken) {
        return { valid: false };
    }

    // Get the current active session for this user
    const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_current', true)
        .single();

    if (error || !sessions) {
        return { valid: false };
    }

    // Check if our local token matches the active session
    if (sessions.session_token !== localToken) {
        return {
            valid: false,
            conflictSession: sessions as Session
        };
    }

    // Update last active time
    await touchSession(localToken);

    return { valid: true };
}

/**
 * Update last active timestamp for a session
 */
export async function touchSession(sessionToken: string): Promise<void> {
    const supabase = createClient();

    await supabase
        .from('user_sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('session_token', sessionToken);
}

/**
 * Get all active sessions for a user
 */
export async function getActiveSessions(userId: string): Promise<Session[]> {
    const supabase = createClient();
    const currentToken = getCurrentSessionToken();

    const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_active', { ascending: false });

    if (error) {
        console.error('Error fetching sessions:', error);
        return [];
    }

    // Mark the current session
    return (data || []).map(session => ({
        ...session,
        is_current: session.session_token === currentToken,
    })) as Session[];
}

/**
 * Terminate a specific session
 */
export async function terminateSession(sessionId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);

    if (error) {
        console.error('Error terminating session:', error);
        return false;
    }

    return true;
}

/**
 * Terminate all sessions except the current one
 */
export async function terminateAllOtherSessions(userId: string): Promise<boolean> {
    const supabase = createClient();
    const currentToken = getCurrentSessionToken();

    if (!currentToken) {
        return false;
    }

    const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId)
        .neq('session_token', currentToken);

    if (error) {
        console.error('Error terminating other sessions:', error);
        return false;
    }

    return true;
}

/**
 * Clear local session on logout
 */
export function clearLocalSession(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_TOKEN_KEY);
    }
}

/**
 * Check if user has other active sessions
 */
export async function checkForExistingSessions(userId: string): Promise<Session[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_active', { ascending: false });

    if (error) {
        console.error('Error checking existing sessions:', error);
        return [];
    }

    return (data || []) as Session[];
}

/**
 * Force terminate all sessions for a user (used when logging out everywhere)
 */
export async function forceTerminateAllSessions(userId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId);

    if (error) {
        console.error('Error force terminating sessions:', error);
        return false;
    }

    clearLocalSession();
    return true;
}
