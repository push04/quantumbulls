/**
 * XP Manager
 * Handles XP awarding, level calculation, and level-up detection
 */

import { createClient } from '@/lib/supabase/client';

export type XPEventType =
    | 'video_watch'
    | 'course_complete'
    | 'daily_login'
    | 'streak_bonus'
    | 'achievement'
    | 'lesson_complete';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface LevelInfo {
    level: UserLevel;
    minXP: number;
    maxXP: number;
    title: string;
    icon: string;
    color: string;
}

export interface UserXPData {
    totalXP: number;
    currentLevel: UserLevel;
    xpToNextLevel: number;
    progressPercent: number;
    levelInfo: LevelInfo;
    nextLevelInfo: LevelInfo | null;
}

// XP values for each action
export const XP_VALUES: Record<XPEventType, number> = {
    video_watch: 10,
    course_complete: 100,
    daily_login: 5,
    streak_bonus: 25, // base, multiplied by milestone
    achievement: 50,
    lesson_complete: 15,
};

// Level definitions
export const LEVELS: Record<UserLevel, LevelInfo> = {
    beginner: {
        level: 'beginner',
        minXP: 0,
        maxXP: 99,
        title: 'Beginner Trader',
        icon: '🌱',
        color: '#22c55e',
    },
    intermediate: {
        level: 'intermediate',
        minXP: 100,
        maxXP: 499,
        title: 'Intermediate Trader',
        icon: '📈',
        color: '#3b82f6',
    },
    advanced: {
        level: 'advanced',
        minXP: 500,
        maxXP: 999,
        title: 'Advanced Trader',
        icon: '🚀',
        color: '#8b5cf6',
    },
    expert: {
        level: 'expert',
        minXP: 1000,
        maxXP: Infinity,
        title: 'Expert Trader',
        icon: '👑',
        color: '#f59e0b',
    },
};

const LEVEL_ORDER: UserLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

/**
 * Get level from XP amount
 */
export function getLevelFromXP(xp: number): UserLevel {
    if (xp >= 1000) return 'expert';
    if (xp >= 500) return 'advanced';
    if (xp >= 100) return 'intermediate';
    return 'beginner';
}

/**
 * Get next level info
 */
export function getNextLevel(currentLevel: UserLevel): UserLevel | null {
    const index = LEVEL_ORDER.indexOf(currentLevel);
    if (index < LEVEL_ORDER.length - 1) {
        return LEVEL_ORDER[index + 1];
    }
    return null;
}

/**
 * Award XP to user
 */
export async function awardXP(
    userId: string,
    eventType: XPEventType,
    metadata?: Record<string, unknown>
): Promise<{ xpEarned: number; leveledUp: boolean; newLevel?: UserLevel }> {
    const supabase = createClient();
    const xpEarned = XP_VALUES[eventType];

    // Get current level before awarding
    const { data: beforeData } = await supabase
        .from('user_levels')
        .select('total_xp, current_level')
        .eq('user_id', userId)
        .single();

    const previousLevel = beforeData?.current_level as UserLevel | undefined;
    const previousXP = beforeData?.total_xp || 0;

    // Insert XP event
    await supabase.from('user_xp_events').insert({
        user_id: userId,
        event_type: eventType,
        xp_earned: xpEarned,
        metadata: metadata || {},
    });

    // Get new level (trigger should have updated it)
    const newXP = previousXP + xpEarned;
    const newLevel = getLevelFromXP(newXP);
    const leveledUp = previousLevel !== undefined && newLevel !== previousLevel;

    return {
        xpEarned,
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined,
    };
}

/**
 * Award streak bonus XP
 */
export async function awardStreakBonus(
    userId: string,
    streakDays: number
): Promise<number> {
    const supabase = createClient();

    // Bonus multiplier based on streak
    let multiplier = 1;
    if (streakDays >= 90) multiplier = 4;
    else if (streakDays >= 30) multiplier = 3;
    else if (streakDays >= 7) multiplier = 2;

    const xpEarned = XP_VALUES.streak_bonus * multiplier;

    await supabase.from('user_xp_events').insert({
        user_id: userId,
        event_type: 'streak_bonus',
        xp_earned: xpEarned,
        metadata: { streak_days: streakDays, multiplier },
    });

    return xpEarned;
}

/**
 * Get user's XP data
 */
export async function getUserXPData(userId: string): Promise<UserXPData> {
    const supabase = createClient();

    const { data } = await supabase
        .from('user_levels')
        .select('total_xp, current_level')
        .eq('user_id', userId)
        .single();

    const totalXP = data?.total_xp || 0;
    const currentLevel = (data?.current_level as UserLevel) || 'beginner';
    const levelInfo = LEVELS[currentLevel];
    const nextLevel = getNextLevel(currentLevel);
    const nextLevelInfo = nextLevel ? LEVELS[nextLevel] : null;

    // Calculate progress to next level
    let xpToNextLevel = 0;
    let progressPercent = 100;

    if (nextLevelInfo) {
        xpToNextLevel = nextLevelInfo.minXP - totalXP;
        const levelRange = nextLevelInfo.minXP - levelInfo.minXP;
        const progressInLevel = totalXP - levelInfo.minXP;
        progressPercent = Math.round((progressInLevel / levelRange) * 100);
    }

    return {
        totalXP,
        currentLevel,
        xpToNextLevel,
        progressPercent,
        levelInfo,
        nextLevelInfo,
    };
}

/**
 * Get recent XP events
 */
export async function getRecentXPEvents(
    userId: string,
    limit: number = 10
): Promise<Array<{ type: XPEventType; xp: number; createdAt: string }>> {
    const supabase = createClient();

    const { data } = await supabase
        .from('user_xp_events')
        .select('event_type, xp_earned, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    return (data || []).map(e => ({
        type: e.event_type as XPEventType,
        xp: e.xp_earned,
        createdAt: e.created_at,
    }));
}

/**
 * Get XP earned today
 */
export async function getTodayXP(userId: string): Promise<number> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
        .from('user_xp_events')
        .select('xp_earned')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

    return (data || []).reduce((sum, e) => sum + e.xp_earned, 0);
}
