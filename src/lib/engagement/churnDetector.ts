/**
 * Churn Detector
 * Identifies at-risk users and calculates risk scores
 */

import { createClient } from '@/lib/supabase/client';

export interface RiskFactor {
    factor: string;
    weight: number;
    description: string;
}

export interface UserRiskProfile {
    userId: string;
    riskScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: RiskFactor[];
    lastCalculated: string;
}

// Risk factor weights
const RISK_WEIGHTS = {
    inactiveDays: { base: 3, maxDays: 30 }, // 3 points per day, max 90
    lowEngagement: 15, // Watched only 1-2 videos ever
    noStreak: 10, // Never had a streak > 3
    freeTier: 5, // Free tier users more likely to churn
    noCourseComplete: 10, // Never completed a course
    shortSessions: 10, // Average session < 2 min
    noNotes: 5, // Never took notes
    noBookmarks: 5, // Never bookmarked
};

/**
 * Calculate risk score for a user
 */
export async function calculateRiskScore(userId: string): Promise<UserRiskProfile> {
    const supabase = createClient();
    const factors: RiskFactor[] = [];
    let totalScore = 0;

    // Get user data
    const { data: profile } = await supabase
        .from('profiles')
        .select('tier, created_at')
        .eq('id', userId)
        .single();

    // Get last activity
    const { data: streak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

    // Get video progress
    const { data: progress } = await supabase
        .from('video_progress')
        .select('*')
        .eq('user_id', userId);

    // Get notes count
    const { count: notesCount } = await supabase
        .from('lesson_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // Get bookmarks count
    const { count: bookmarksCount } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // Calculate inactive days
    if (streak?.last_activity_date) {
        const lastActivity = new Date(streak.last_activity_date);
        const inactiveDays = Math.floor(
            (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (inactiveDays > 3) {
            const weight = Math.min(
                inactiveDays * RISK_WEIGHTS.inactiveDays.base,
                RISK_WEIGHTS.inactiveDays.maxDays * RISK_WEIGHTS.inactiveDays.base
            );
            totalScore += weight;
            factors.push({
                factor: 'inactive',
                weight,
                description: `No activity for ${inactiveDays} days`,
            });
        }
    } else {
        // Never had activity
        totalScore += 30;
        factors.push({
            factor: 'never_active',
            weight: 30,
            description: 'No recorded activity',
        });
    }

    // Low engagement
    const videosWatched = progress?.length || 0;
    if (videosWatched <= 2) {
        totalScore += RISK_WEIGHTS.lowEngagement;
        factors.push({
            factor: 'low_engagement',
            weight: RISK_WEIGHTS.lowEngagement,
            description: `Only watched ${videosWatched} video(s)`,
        });
    }

    // No streak
    if (!streak || streak.longest_streak < 3) {
        totalScore += RISK_WEIGHTS.noStreak;
        factors.push({
            factor: 'no_streak',
            weight: RISK_WEIGHTS.noStreak,
            description: 'Never maintained a 3+ day streak',
        });
    }

    // Free tier
    if (profile?.tier === 'free') {
        totalScore += RISK_WEIGHTS.freeTier;
        factors.push({
            factor: 'free_tier',
            weight: RISK_WEIGHTS.freeTier,
            description: 'On free tier',
        });
    }

    // No course completed
    const completedVideos = progress?.filter(p => p.completed) || [];
    if (completedVideos.length === 0) {
        totalScore += RISK_WEIGHTS.noCourseComplete;
        factors.push({
            factor: 'no_completion',
            weight: RISK_WEIGHTS.noCourseComplete,
            description: 'Never completed a lesson',
        });
    }

    // No notes
    if (!notesCount || notesCount === 0) {
        totalScore += RISK_WEIGHTS.noNotes;
        factors.push({
            factor: 'no_notes',
            weight: RISK_WEIGHTS.noNotes,
            description: 'Never took notes',
        });
    }

    // No bookmarks
    if (!bookmarksCount || bookmarksCount === 0) {
        totalScore += RISK_WEIGHTS.noBookmarks;
        factors.push({
            factor: 'no_bookmarks',
            weight: RISK_WEIGHTS.noBookmarks,
            description: 'Never bookmarked content',
        });
    }

    // Cap at 100
    totalScore = Math.min(totalScore, 100);

    // Determine risk level
    let riskLevel: UserRiskProfile['riskLevel'] = 'low';
    if (totalScore >= 70) riskLevel = 'critical';
    else if (totalScore >= 50) riskLevel = 'high';
    else if (totalScore >= 30) riskLevel = 'medium';

    // Save to database
    await supabase.from('user_risk_scores').upsert({
        user_id: userId,
        risk_score: totalScore,
        risk_factors: factors,
        last_calculated_at: new Date().toISOString(),
    });

    return {
        userId,
        riskScore: totalScore,
        riskLevel,
        factors,
        lastCalculated: new Date().toISOString(),
    };
}

/**
 * Get all at-risk users
 */
export async function getAtRiskUsers(minRiskScore: number = 50): Promise<UserRiskProfile[]> {
    const supabase = createClient();

    const { data } = await supabase
        .from('user_risk_scores')
        .select('*')
        .gte('risk_score', minRiskScore)
        .order('risk_score', { ascending: false });

    return (data || []).map(d => ({
        userId: d.user_id,
        riskScore: d.risk_score,
        riskLevel: d.risk_score >= 70 ? 'critical' : d.risk_score >= 50 ? 'high' : 'medium',
        factors: d.risk_factors || [],
        lastCalculated: d.last_calculated_at,
    }));
}

/**
 * Get churn statistics
 */
export async function getChurnStats(): Promise<{
    totalUsers: number;
    atRiskCount: number;
    criticalCount: number;
    avgRiskScore: number;
    churnedLast30Days: number;
}> {
    const supabase = createClient();

    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    const { data: riskScores } = await supabase
        .from('user_risk_scores')
        .select('risk_score');

    const atRiskCount = (riskScores || []).filter(r => r.risk_score >= 50).length;
    const criticalCount = (riskScores || []).filter(r => r.risk_score >= 70).length;
    const avgRiskScore = riskScores && riskScores.length > 0
        ? Math.round(riskScores.reduce((sum, r) => sum + r.risk_score, 0) / riskScores.length)
        : 0;

    // Get churned users (cancelled in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: churnedLast30Days } = await supabase
        .from('exit_surveys')
        .select('*', { count: 'exact', head: true })
        .gte('cancellation_date', thirtyDaysAgo.toISOString());

    return {
        totalUsers: totalUsers || 0,
        atRiskCount,
        criticalCount,
        avgRiskScore,
        churnedLast30Days: churnedLast30Days || 0,
    };
}
