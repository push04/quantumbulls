/**
 * Event Tracker
 * Tracks user events for analytics
 */

import { createClient } from '@/lib/supabase/client';

export type EventType =
    | 'page_view'
    | 'video_start'
    | 'video_progress'
    | 'video_complete'
    | 'signup'
    | 'login'
    | 'upgrade'
    | 'downgrade'
    | 'cancel'
    | 'search'
    | 'course_start'
    | 'course_complete';

export interface EventData {
    page?: string;
    videoId?: string;
    courseId?: string;
    query?: string;
    tier?: string;
    duration?: number;
    [key: string]: unknown;
}

interface DeviceInfo {
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
}

// Session ID for grouping events
let sessionId: string | null = null;

/**
 * Get or create session ID
 */
function getSessionId(): string {
    if (sessionId) return sessionId;

    // Check sessionStorage first
    if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('analytics_session_id');
        if (stored) {
            sessionId = stored;
            return sessionId;
        }

        // Create new session ID
        sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('analytics_session_id', sessionId);
    } else {
        sessionId = `server-${Date.now()}`;
    }

    return sessionId;
}

/**
 * Detect device info
 */
function getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
        return { deviceType: 'desktop', browser: 'unknown', os: 'unknown' };
    }

    const ua = navigator.userAgent;

    // Device type
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
        deviceType = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
        deviceType = 'mobile';
    }

    // Browser
    let browser = 'unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // OS
    let os = 'unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone')) os = 'iOS';

    return { deviceType, browser, os };
}

/**
 * Track an event
 */
export async function trackEvent(
    eventType: EventType,
    eventData: EventData = {},
    userId?: string
): Promise<void> {
    try {
        const supabase = createClient();
        const deviceInfo = getDeviceInfo();

        await supabase.from('analytics_events').insert({
            user_id: userId || null,
            session_id: getSessionId(),
            event_type: eventType,
            event_data: eventData,
            device_type: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            referrer: typeof document !== 'undefined' ? document.referrer : null,
        });
    } catch (error) {
        console.error('Failed to track event:', error);
    }
}

/**
 * Track page view
 */
export async function trackPageView(page: string, userId?: string): Promise<void> {
    await trackEvent('page_view', { page }, userId);
}

/**
 * Track video event
 */
export async function trackVideoEvent(
    type: 'video_start' | 'video_progress' | 'video_complete',
    videoId: string,
    courseId?: string,
    duration?: number,
    userId?: string
): Promise<void> {
    await trackEvent(type, { videoId, courseId, duration }, userId);
}

/**
 * Get event counts for a date range
 */
export async function getEventCounts(
    startDate: Date,
    endDate: Date,
    eventType?: EventType
): Promise<{ date: string; count: number }[]> {
    const supabase = createClient();

    let query = supabase
        .from('analytics_events')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    if (eventType) {
        query = query.eq('event_type', eventType);
    }

    const { data } = await query;
    if (!data) return [];

    // Group by date
    const counts: Record<string, number> = {};
    data.forEach(event => {
        const date = event.created_at.split('T')[0];
        counts[date] = (counts[date] || 0) + 1;
    });

    return Object.entries(counts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get device breakdown
 */
export async function getDeviceBreakdown(
    startDate: Date,
    endDate: Date
): Promise<{ device: string; count: number; percentage: number }[]> {
    const supabase = createClient();

    const { data } = await supabase
        .from('analytics_events')
        .select('device_type')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('device_type', 'is', null);

    if (!data || data.length === 0) return [];

    const counts: Record<string, number> = {};
    data.forEach(event => {
        const device = event.device_type || 'unknown';
        counts[device] = (counts[device] || 0) + 1;
    });

    const total = data.length;
    return Object.entries(counts).map(([device, count]) => ({
        device,
        count,
        percentage: Math.round((count / total) * 100),
    }));
}

/**
 * Get user activity by hour
 */
export async function getActivityByHour(
    startDate: Date,
    endDate: Date
): Promise<{ hour: number; count: number }[]> {
    const supabase = createClient();

    const { data } = await supabase
        .from('analytics_events')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    if (!data) return [];

    const counts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) counts[i] = 0;

    data.forEach(event => {
        const hour = new Date(event.created_at).getHours();
        counts[hour]++;
    });

    return Object.entries(counts).map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
    }));
}
