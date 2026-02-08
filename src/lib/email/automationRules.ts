/**
 * Email Automation Rules
 * Defines when to send which emails
 */

import { createClient } from '@/lib/supabase/client';
import { type EmailTemplateId } from './emailTemplates';

export interface AutomationRule {
    id: string;
    templateId: EmailTemplateId;
    trigger: 'time_based' | 'event_based' | 'condition_based';
    condition: AutomationCondition;
    delayMinutes?: number;
    maxSendsPerUser?: number;
}

export interface AutomationCondition {
    type: string;
    params: Record<string, unknown>;
}

// Onboarding sequence (5 emails over 2 weeks)
export const ONBOARDING_SEQUENCE: AutomationRule[] = [
    {
        id: 'onboarding_1',
        templateId: 'welcome',
        trigger: 'event_based',
        condition: { type: 'user_signup', params: {} },
        delayMinutes: 0, // Immediate
        maxSendsPerUser: 1,
    },
    {
        id: 'onboarding_2',
        templateId: 'onboarding_tips',
        trigger: 'time_based',
        condition: { type: 'days_since_signup', params: { days: 3 } },
        maxSendsPerUser: 1,
    },
    {
        id: 'onboarding_3',
        templateId: 'onboarding_success_story',
        trigger: 'time_based',
        condition: { type: 'days_since_signup', params: { days: 7 } },
        maxSendsPerUser: 1,
    },
    {
        id: 'onboarding_4',
        templateId: 'onboarding_first_course',
        trigger: 'time_based',
        condition: { type: 'days_since_signup', params: { days: 10 } },
        maxSendsPerUser: 1,
    },
    {
        id: 'onboarding_5',
        templateId: 'onboarding_upgrade',
        trigger: 'condition_based',
        condition: {
            type: 'days_since_signup',
            params: { days: 14, tier: 'free' }
        },
        maxSendsPerUser: 1,
    },
];

// Engagement rules
export const ENGAGEMENT_RULES: AutomationRule[] = [
    {
        id: 'weekly_digest',
        templateId: 'weekly_digest',
        trigger: 'time_based',
        condition: { type: 'weekly', params: { dayOfWeek: 1 } }, // Monday
        maxSendsPerUser: 52, // Once per week
    },
    {
        id: 'monthly_report',
        templateId: 'monthly_report',
        trigger: 'time_based',
        condition: { type: 'monthly', params: { dayOfMonth: 1 } },
        maxSendsPerUser: 12, // Once per month
    },
    {
        id: 're_engagement',
        templateId: 're_engagement',
        trigger: 'condition_based',
        condition: { type: 'inactive_days', params: { days: 14 } },
        maxSendsPerUser: 3, // Max 3 re-engagement emails
    },
    {
        id: 'streak_reminder',
        templateId: 'streak_reminder',
        trigger: 'condition_based',
        condition: { type: 'streak_at_risk', params: { minStreak: 3 } },
        maxSendsPerUser: 10,
    },
];

// Upsell rules
export const UPSELL_RULES: AutomationRule[] = [
    {
        id: 'upsell_after_engagement',
        templateId: 'upsell_features',
        trigger: 'condition_based',
        condition: {
            type: 'lessons_completed',
            params: { count: 10, tier: ['free', 'basic'] }
        },
        maxSendsPerUser: 2,
    },
    {
        id: 'upsell_discount',
        templateId: 'upsell_discount',
        trigger: 'condition_based',
        condition: {
            type: 'days_since_signup',
            params: { days: 30, tier: ['free', 'basic'] }
        },
        maxSendsPerUser: 1,
    },
];

/**
 * Queue an email for sending
 */
export async function queueEmail(
    userId: string,
    templateId: EmailTemplateId,
    templateData: Record<string, unknown>,
    scheduledFor?: Date
): Promise<string | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('email_queue')
        .insert({
            user_id: userId,
            template_id: templateId,
            template_data: templateData,
            scheduled_for: (scheduledFor || new Date()).toISOString(),
            status: 'pending',
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error queueing email:', error);
        return null;
    }

    return data?.id || null;
}

/**
 * Check if user should receive onboarding email
 */
export async function checkOnboardingEmails(userId: string): Promise<EmailTemplateId | null> {
    const supabase = createClient();

    // Get user data
    const { data: engagement } = await supabase
        .from('user_engagement')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!engagement || engagement.onboarding_completed) {
        return null;
    }

    // Get user signup date
    const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', userId)
        .single();

    if (!profile) return null;

    const daysSinceSignup = Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine which onboarding email to send
    const step = engagement.onboarding_step;

    if (step === 1 && daysSinceSignup >= 3) return 'onboarding_tips';
    if (step === 2 && daysSinceSignup >= 7) return 'onboarding_success_story';
    if (step === 3 && daysSinceSignup >= 10) return 'onboarding_first_course';
    if (step === 4 && daysSinceSignup >= 14) return 'onboarding_upgrade';

    return null;
}

/**
 * Check if user needs re-engagement email
 */
export async function checkReEngagement(userId: string): Promise<boolean> {
    const supabase = createClient();

    // Get last activity
    const { data: streak } = await supabase
        .from('user_streaks')
        .select('last_activity_date')
        .eq('user_id', userId)
        .single();

    if (!streak?.last_activity_date) return false;

    const daysSinceActivity = Math.floor(
        (Date.now() - new Date(streak.last_activity_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceActivity >= 14;
}

/**
 * Check if user needs streak reminder
 */
export async function checkStreakReminder(userId: string): Promise<boolean> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    // Get streak data
    const { data: streak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!streak) return false;

    // Only remind if they have a streak >= 3 and haven't logged in today
    if (streak.current_streak >= 3 && streak.last_activity_date !== today) {
        // Check if it's evening (streak at risk)
        const hour = new Date().getHours();
        return hour >= 18; // After 6 PM
    }

    return false;
}
