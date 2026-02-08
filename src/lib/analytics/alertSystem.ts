/**
 * Admin Alert System
 * Detects anomalies and sends alerts
 */

import { createClient } from '@/lib/supabase/client';

export interface Alert {
    id: string;
    alertType: string;
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    metadata: Record<string, unknown>;
    isRead: boolean;
    isDismissed: boolean;
    createdAt: string;
}

export interface AlertThreshold {
    alertType: string;
    thresholdValue: number;
    timeWindowHours: number;
    isEnabled: boolean;
}

const ALERT_CONFIG = {
    spike_signups: {
        title: 'Signup Spike Detected',
        severity: 'info' as const,
        message: (count: number, threshold: number) =>
            `${count} signups in the last 24 hours (threshold: ${threshold})`,
    },
    spike_cancellations: {
        title: 'Cancellation Spike Alert',
        severity: 'warning' as const,
        message: (count: number, threshold: number) =>
            `${count} cancellations in the last 24 hours (threshold: ${threshold})`,
    },
    payment_failures: {
        title: 'Payment Failures Detected',
        severity: 'critical' as const,
        message: (count: number, threshold: number) =>
            `${count} payment failures in the last hour (threshold: ${threshold})`,
    },
    suspicious_activity: {
        title: 'Suspicious Activity Alert',
        severity: 'critical' as const,
        message: (count: number, threshold: number) =>
            `${count} suspicious logins detected (threshold: ${threshold})`,
    },
    video_processing_failure: {
        title: 'Video Processing Failed',
        severity: 'warning' as const,
        message: () => 'A video failed to process. Check the upload queue.',
    },
};

/**
 * Get unread alerts
 */
export async function getUnreadAlerts(): Promise<Alert[]> {
    const supabase = createClient();

    const { data } = await supabase
        .from('admin_alerts')
        .select('*')
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(50);

    return (data || []).map(a => ({
        id: a.id,
        alertType: a.alert_type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        metadata: a.metadata,
        isRead: a.is_read,
        isDismissed: a.is_dismissed,
        createdAt: a.created_at,
    }));
}

/**
 * Mark alert as read
 */
export async function markAlertRead(alertId: string): Promise<void> {
    const supabase = createClient();
    await supabase.from('admin_alerts').update({ is_read: true }).eq('id', alertId);
}

/**
 * Dismiss alert
 */
export async function dismissAlert(alertId: string): Promise<void> {
    const supabase = createClient();
    await supabase.from('admin_alerts').update({ is_dismissed: true }).eq('id', alertId);
}

/**
 * Create alert
 */
export async function createAlert(
    alertType: keyof typeof ALERT_CONFIG,
    metadata: Record<string, unknown> = {},
    currentValue?: number,
    threshold?: number
): Promise<void> {
    const supabase = createClient();
    const config = ALERT_CONFIG[alertType];

    if (!config) return;

    const message = typeof config.message === 'function' && currentValue !== undefined && threshold !== undefined
        ? config.message(currentValue, threshold)
        : 'Alert triggered';

    await supabase.from('admin_alerts').insert({
        alert_type: alertType,
        severity: config.severity,
        title: config.title,
        message,
        metadata,
    });
}

/**
 * Check thresholds and create alerts
 * This should be run periodically (e.g., every hour)
 */
export async function checkAlertThresholds(): Promise<void> {
    const supabase = createClient();

    // Get thresholds
    const { data: thresholds } = await supabase
        .from('alert_thresholds')
        .select('*')
        .eq('is_enabled', true);

    if (!thresholds) return;

    for (const threshold of thresholds) {
        const windowStart = new Date();
        windowStart.setHours(windowStart.getHours() - threshold.time_window_hours);

        let count = 0;

        switch (threshold.alert_type) {
            case 'spike_signups': {
                const { count: signups } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', windowStart.toISOString());
                count = signups || 0;
                break;
            }
            case 'spike_cancellations': {
                const { count: cancels } = await supabase
                    .from('subscription_events')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_type', 'cancelled')
                    .gte('created_at', windowStart.toISOString());
                count = cancels || 0;
                break;
            }
            case 'payment_failures': {
                const { count: failures } = await supabase
                    .from('analytics_events')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_type', 'payment_failed')
                    .gte('created_at', windowStart.toISOString());
                count = failures || 0;
                break;
            }
            case 'suspicious_activity': {
                const { count: suspicious } = await supabase
                    .from('login_sessions')
                    .select('*', { count: 'exact', head: true })
                    .eq('flagged_suspicious', true)
                    .gte('last_active_at', windowStart.toISOString());
                count = suspicious || 0;
                break;
            }
        }

        if (count >= threshold.threshold_value) {
            // Check if we already alerted for this recently
            const recentAlertWindow = new Date();
            recentAlertWindow.setHours(recentAlertWindow.getHours() - 6);

            const { count: recentAlerts } = await supabase
                .from('admin_alerts')
                .select('*', { count: 'exact', head: true })
                .eq('alert_type', threshold.alert_type)
                .gte('created_at', recentAlertWindow.toISOString());

            if (!recentAlerts || recentAlerts === 0) {
                await createAlert(
                    threshold.alert_type as keyof typeof ALERT_CONFIG,
                    { count, timeWindow: threshold.time_window_hours },
                    count,
                    threshold.threshold_value
                );
            }
        }
    }
}

/**
 * Get alert counts by severity
 */
export async function getAlertCounts(): Promise<{ info: number; warning: number; critical: number }> {
    const supabase = createClient();

    const { data } = await supabase
        .from('admin_alerts')
        .select('severity')
        .eq('is_dismissed', false)
        .eq('is_read', false);

    const counts = { info: 0, warning: 0, critical: 0 };
    data?.forEach(a => {
        if (counts[a.severity as keyof typeof counts] !== undefined) {
            counts[a.severity as keyof typeof counts]++;
        }
    });

    return counts;
}
