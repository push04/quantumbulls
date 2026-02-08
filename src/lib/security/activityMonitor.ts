/**
 * Activity Monitor
 * Tracks suspicious user behavior patterns
 */

import { createClient } from '@/lib/supabase/client';

export type ActivityType =
    | 'rapid_requests'
    | 'seek_skip'
    | 'ip_mismatch'
    | 'multi_device_attempt'
    | 'suspicious_location';

export type Severity = 'low' | 'medium' | 'high';

export interface SuspiciousActivity {
    id: string;
    user_id: string;
    activity_type: ActivityType;
    severity: Severity;
    details: Record<string, unknown>;
    reviewed: boolean;
    reviewed_by: string | null;
    reviewed_at: string | null;
    action_taken: string | null;
    created_at: string;
}

// In-memory tracking for current session
const requestTracker = new Map<string, number[]>();
const seekTracker = new Map<string, { startTime: number; seeks: number }>();

// Thresholds
const RAPID_REQUEST_THRESHOLD = 50; // 50 requests per day
const SEEK_SKIP_THRESHOLD = 30; // Complete video in 30 seconds

/**
 * Track video request
 */
export function trackVideoRequest(userId: string, videoId: string): void {
    const key = `${userId}:${videoId}`;
    const now = Date.now();
    const dayStart = new Date().setHours(0, 0, 0, 0);

    // Get or create request list
    let requests = requestTracker.get(key) || [];

    // Filter to today's requests only
    requests = requests.filter(t => t > dayStart);
    requests.push(now);
    requestTracker.set(key, requests);

    // Check threshold
    if (requests.length >= RAPID_REQUEST_THRESHOLD) {
        logSuspiciousActivity(userId, 'rapid_requests', 'medium', {
            videoId,
            requestCount: requests.length,
            timeWindow: '24 hours',
        });
    }
}

/**
 * Track video seek behavior
 */
export function trackVideoSeek(
    userId: string,
    videoId: string,
    currentTime: number,
    duration: number
): void {
    const key = `${userId}:${videoId}`;

    const tracking = seekTracker.get(key);

    if (!tracking) {
        // First seek, start tracking
        seekTracker.set(key, { startTime: Date.now(), seeks: 1 });
        return;
    }

    tracking.seeks++;

    // Check if user "completed" video too fast
    if (currentTime >= duration * 0.9) {
        const elapsedSeconds = (Date.now() - tracking.startTime) / 1000;

        if (elapsedSeconds < SEEK_SKIP_THRESHOLD) {
            logSuspiciousActivity(userId, 'seek_skip', 'low', {
                videoId,
                completedInSeconds: Math.round(elapsedSeconds),
                seekCount: tracking.seeks,
                videoDuration: Math.round(duration),
            });
        }
    }
}

/**
 * Track IP mismatch between video request and key request
 */
export function trackIpMismatch(
    userId: string,
    videoRequestIp: string,
    keyRequestIp: string
): void {
    if (videoRequestIp !== keyRequestIp) {
        logSuspiciousActivity(userId, 'ip_mismatch', 'high', {
            videoRequestIp,
            keyRequestIp,
            message: 'Encryption key requested from different IP than video player',
        });
    }
}

/**
 * Log suspicious activity to database
 */
async function logSuspiciousActivity(
    userId: string,
    activityType: ActivityType,
    severity: Severity,
    details: Record<string, unknown>
): Promise<void> {
    const supabase = createClient();

    // Check for recent duplicate
    const { data: recent } = await supabase
        .from('suspicious_activity')
        .select('id')
        .eq('user_id', userId)
        .eq('activity_type', activityType)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .limit(1);

    if (recent && recent.length > 0) {
        // Already logged recently, skip
        return;
    }

    const { error } = await supabase
        .from('suspicious_activity')
        .insert({
            user_id: userId,
            activity_type: activityType,
            severity,
            details,
        });

    if (error) {
        console.error('Error logging suspicious activity:', error);
    }
}

/**
 * Get flagged activities for admin review
 */
export async function getFlaggedActivities(
    limit = 50,
    includeReviewed = false
): Promise<SuspiciousActivity[]> {
    const supabase = createClient();

    let query = supabase
        .from('suspicious_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (!includeReviewed) {
        query = query.eq('reviewed', false);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching flagged activities:', error);
        return [];
    }

    return (data || []) as SuspiciousActivity[];
}

/**
 * Mark activity as reviewed
 */
export async function reviewActivity(
    activityId: string,
    reviewedBy: string,
    actionTaken: string
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('suspicious_activity')
        .update({
            reviewed: true,
            reviewed_by: reviewedBy,
            reviewed_at: new Date().toISOString(),
            action_taken: actionTaken,
        })
        .eq('id', activityId);

    if (error) {
        console.error('Error reviewing activity:', error);
        return false;
    }

    return true;
}

/**
 * Get severity display info
 */
export function getSeverityInfo(severity: Severity): { color: string; label: string } {
    switch (severity) {
        case 'low':
            return { color: 'bg-yellow-100 text-yellow-700', label: 'Low' };
        case 'medium':
            return { color: 'bg-orange-100 text-orange-700', label: 'Medium' };
        case 'high':
            return { color: 'bg-red-100 text-red-700', label: 'High' };
    }
}

/**
 * Get activity type display info
 */
export function getActivityTypeInfo(type: ActivityType): { icon: string; label: string } {
    switch (type) {
        case 'rapid_requests':
            return { icon: '⚡', label: 'Rapid Requests' };
        case 'seek_skip':
            return { icon: '⏭️', label: 'Seek Skipping' };
        case 'ip_mismatch':
            return { icon: '🌐', label: 'IP Mismatch' };
        case 'multi_device_attempt':
            return { icon: '📱', label: 'Multi-device Attempt' };
        case 'suspicious_location':
            return { icon: '📍', label: 'Suspicious Location' };
    }
}
