/**
 * Achievement Tracker
 * Manages user achievements and badges
 */

import { createClient } from '@/lib/supabase/client';

export type AchievementType =
    | 'first_lesson'
    | 'first_course_complete'
    | 'streak_3'
    | 'streak_7'
    | 'streak_30'
    | 'lessons_10'
    | 'lessons_50'
    | 'lessons_100'
    | 'path_complete'
    | 'all_basic_complete'
    | 'all_intermediate_complete';

export interface Achievement {
    type: AchievementType;
    title: string;
    description: string;
    icon: string;
    achievedAt?: string;
}

export const ACHIEVEMENTS: Record<AchievementType, Omit<Achievement, 'achievedAt'>> = {
    first_lesson: {
        type: 'first_lesson',
        title: 'First Steps',
        description: 'Completed your first lesson',
        icon: '🎯',
    },
    first_course_complete: {
        type: 'first_course_complete',
        title: 'Course Champion',
        description: 'Completed your first course',
        icon: '🏆',
    },
    streak_3: {
        type: 'streak_3',
        title: '3-Day Streak',
        description: 'Learned for 3 days in a row',
        icon: '🔥',
    },
    streak_7: {
        type: 'streak_7',
        title: 'Week Warrior',
        description: '7-day learning streak',
        icon: '⚡',
    },
    streak_30: {
        type: 'streak_30',
        title: 'Monthly Master',
        description: '30-day learning streak',
        icon: '💎',
    },
    lessons_10: {
        type: 'lessons_10',
        title: 'Getting Started',
        description: 'Completed 10 lessons',
        icon: '📚',
    },
    lessons_50: {
        type: 'lessons_50',
        title: 'Dedicated Learner',
        description: 'Completed 50 lessons',
        icon: '🎓',
    },
    lessons_100: {
        type: 'lessons_100',
        title: 'Century Club',
        description: 'Completed 100 lessons',
        icon: '💯',
    },
    path_complete: {
        type: 'path_complete',
        title: 'Path Finder',
        description: 'Completed a learning path',
        icon: '🗺️',
    },
    all_basic_complete: {
        type: 'all_basic_complete',
        title: 'Basic Mastery',
        description: 'Completed all Basic tier courses',
        icon: '🌟',
    },
    all_intermediate_complete: {
        type: 'all_intermediate_complete',
        title: 'Intermediate Pro',
        description: 'Completed all Intermediate courses',
        icon: '👑',
    },
};

/**
 * Get user's achievements
 */
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
    const supabase = createClient();

    const { data } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

    if (!data) return [];

    return data.map(a => ({
        ...ACHIEVEMENTS[a.achievement_type as AchievementType],
        achievedAt: a.achieved_at,
    }));
}

/**
 * Award an achievement to user
 */
export async function awardAchievement(
    userId: string,
    type: AchievementType,
    metadata?: Record<string, unknown>
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('user_achievements')
        .upsert({
            user_id: userId,
            achievement_type: type,
            metadata: metadata || {},
        });

    if (error) {
        console.error('Error awarding achievement:', error);
        return false;
    }

    return true;
}

/**
 * Check and award applicable achievements based on current stats
 */
export async function checkAndAwardAchievements(
    userId: string,
    stats: {
        lessonsCompleted: number;
        coursesCompleted: number;
        currentStreak: number;
        pathsCompleted: number;
    }
): Promise<AchievementType[]> {
    const awarded: AchievementType[] = [];

    // Check lessons milestones
    if (stats.lessonsCompleted >= 1) {
        if (await awardAchievement(userId, 'first_lesson')) {
            awarded.push('first_lesson');
        }
    }
    if (stats.lessonsCompleted >= 10) {
        if (await awardAchievement(userId, 'lessons_10')) {
            awarded.push('lessons_10');
        }
    }
    if (stats.lessonsCompleted >= 50) {
        if (await awardAchievement(userId, 'lessons_50')) {
            awarded.push('lessons_50');
        }
    }
    if (stats.lessonsCompleted >= 100) {
        if (await awardAchievement(userId, 'lessons_100')) {
            awarded.push('lessons_100');
        }
    }

    // Check course completion
    if (stats.coursesCompleted >= 1) {
        if (await awardAchievement(userId, 'first_course_complete')) {
            awarded.push('first_course_complete');
        }
    }

    // Check streak milestones
    if (stats.currentStreak >= 3) {
        if (await awardAchievement(userId, 'streak_3')) {
            awarded.push('streak_3');
        }
    }
    if (stats.currentStreak >= 7) {
        if (await awardAchievement(userId, 'streak_7')) {
            awarded.push('streak_7');
        }
    }
    if (stats.currentStreak >= 30) {
        if (await awardAchievement(userId, 'streak_30')) {
            awarded.push('streak_30');
        }
    }

    // Check path completion
    if (stats.pathsCompleted >= 1) {
        if (await awardAchievement(userId, 'path_complete')) {
            awarded.push('path_complete');
        }
    }

    return awarded;
}

/**
 * Get all possible achievements with user's progress
 */
export async function getAllAchievementsWithStatus(userId: string): Promise<{
    earned: Achievement[];
    locked: Achievement[];
}> {
    const userAchievements = await getUserAchievements(userId);
    const earnedTypes = new Set(userAchievements.map(a => a.type));

    const earned: Achievement[] = userAchievements;
    const locked: Achievement[] = [];

    for (const [type, achievement] of Object.entries(ACHIEVEMENTS)) {
        if (!earnedTypes.has(type as AchievementType)) {
            locked.push(achievement);
        }
    }

    return { earned, locked };
}
