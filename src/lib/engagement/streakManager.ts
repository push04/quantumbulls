/**
 * Streak Manager
 * Handles daily streaks, challenges, and streak rewards
 */

import { createClient } from '@/lib/supabase/client';
import { awardXP, awardStreakBonus } from './xpManager';

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
    streakStartedAt: string | null;
    isActiveToday: boolean;
}

export interface DailyChallenge {
    id: string;
    challengeDate: string;
    challengeType: 'watch_video' | 'complete_lesson' | 'login';
    targetId?: string;
    targetTitle?: string;
    isCompleted: boolean;
    completedAt?: string;
}

export interface StreakMilestone {
    days: number;
    reward: string;
    icon: string;
    xpBonus: number;
}

// Streak milestones
export const STREAK_MILESTONES: StreakMilestone[] = [
    { days: 3, reward: 'Getting Started!', icon: '🔥', xpBonus: 15 },
    { days: 7, reward: '1 Week Warrior', icon: '⚡', xpBonus: 50 },
    { days: 14, reward: '2 Week Champion', icon: '🌟', xpBonus: 100 },
    { days: 30, reward: 'Monthly Master', icon: '🏆', xpBonus: 200 },
    { days: 60, reward: 'Dedicated Trader', icon: '💎', xpBonus: 300 },
    { days: 90, reward: 'Elite Streak', icon: '👑', xpBonus: 500 },
    { days: 365, reward: 'Year of Excellence', icon: '🎖️', xpBonus: 1000 },
];

/**
 * Get user's streak data
 */
export async function getStreakData(userId: string): Promise<StreakData> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!data) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
            streakStartedAt: null,
            isActiveToday: false,
        };
    }

    return {
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastActivityDate: data.last_activity_date,
        streakStartedAt: data.streak_started_at,
        isActiveToday: data.last_activity_date === today,
    };
}

/**
 * Check in for today (updates streak)
 */
export async function checkInToday(userId: string): Promise<{
    newStreak: number;
    streakBroken: boolean;
    streakContinued: boolean;
    milestone?: StreakMilestone;
    xpEarned: number;
}> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    // Get current streak
    const { data: current } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

    let newStreak = 1;
    let streakBroken = false;
    let streakContinued = false;
    let longestStreak = current?.longest_streak || 0;

    if (current) {
        if (current.last_activity_date === today) {
            // Already checked in today
            return {
                newStreak: current.current_streak,
                streakBroken: false,
                streakContinued: false,
                xpEarned: 0,
            };
        }

        const lastDate = new Date(current.last_activity_date);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Continuing streak
            newStreak = current.current_streak + 1;
            streakContinued = true;
        } else {
            // Streak broken
            newStreak = 1;
            streakBroken = true;
        }

        longestStreak = Math.max(longestStreak, newStreak);
    }

    // Upsert streak data
    await supabase.from('user_streaks').upsert({
        user_id: userId,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        streak_started_at: streakBroken || !current ? today : current.streak_started_at,
        updated_at: new Date().toISOString(),
    });

    // Award daily login XP
    let xpEarned = 0;
    await awardXP(userId, 'daily_login');
    xpEarned += 5;

    // Check for milestone
    const milestone = STREAK_MILESTONES.find(m => m.days === newStreak);
    if (milestone) {
        const bonusXP = await awardStreakBonus(userId, newStreak);
        xpEarned += bonusXP;
    }

    return {
        newStreak,
        streakBroken,
        streakContinued,
        milestone,
        xpEarned,
    };
}

/**
 * Get today's challenge
 */
export async function getTodayChallenge(userId: string): Promise<DailyChallenge | null> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    // Check for existing challenge
    const { data: existing } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_date', today)
        .single();

    if (existing) {
        return {
            id: existing.id,
            challengeDate: existing.challenge_date,
            challengeType: existing.challenge_type,
            targetId: existing.target_id,
            targetTitle: existing.target_title,
            isCompleted: existing.is_completed,
            completedAt: existing.completed_at,
        };
    }

    // Generate new challenge
    const challenge = await generateDailyChallenge(userId);
    return challenge;
}

/**
 * Generate a new daily challenge
 */
async function generateDailyChallenge(userId: string): Promise<DailyChallenge> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    // Get a lesson user hasn't completed
    const { data: incompleteLessons } = await supabase
        .from('lessons')
        .select('id, title, courses(is_active)')
        .not('id', 'in',
            supabase.from('video_progress')
                .select('video_id')
                .eq('user_id', userId)
                .eq('completed', true)
        )
        .limit(10);

    let targetId: string | undefined;
    let targetTitle: string | undefined;
    let challengeType: 'watch_video' | 'complete_lesson' | 'login' = 'login';

    if (incompleteLessons && incompleteLessons.length > 0) {
        // Pick a random lesson
        const randomLesson = incompleteLessons[Math.floor(Math.random() * incompleteLessons.length)];
        targetId = randomLesson.id;
        targetTitle = randomLesson.title;
        challengeType = 'watch_video';
    }

    const { data: challenge } = await supabase
        .from('daily_challenges')
        .insert({
            user_id: userId,
            challenge_date: today,
            challenge_type: challengeType,
            target_id: targetId,
            target_title: targetTitle,
        })
        .select()
        .single();

    return {
        id: challenge?.id || '',
        challengeDate: today,
        challengeType,
        targetId,
        targetTitle,
        isCompleted: false,
    };
}

/**
 * Complete a challenge
 */
export async function completeChallenge(
    userId: string,
    challengeId: string
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('daily_challenges')
        .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
        })
        .eq('id', challengeId)
        .eq('user_id', userId);

    if (!error) {
        // Award bonus XP for completing challenge
        await awardXP(userId, 'achievement', { type: 'daily_challenge' });
    }

    return !error;
}

/**
 * Get next milestone info
 */
export function getNextMilestone(currentStreak: number): StreakMilestone | null {
    return STREAK_MILESTONES.find(m => m.days > currentStreak) || null;
}

/**
 * Get empathetic message for streak state
 */
export function getStreakMessage(streak: StreakData): string {
    if (streak.currentStreak === 0) {
        return "Start your learning journey today! 🌱";
    }
    if (streak.currentStreak === 1) {
        return "Great start! Come back tomorrow to build your streak! 💪";
    }
    if (streak.currentStreak < 7) {
        return `${streak.currentStreak} days strong! Keep the momentum going! 🔥`;
    }
    if (streak.currentStreak < 30) {
        return `Amazing ${streak.currentStreak}-day streak! You're building great habits! ⚡`;
    }
    return `Incredible ${streak.currentStreak}-day streak! You're a learning machine! 👑`;
}

/**
 * Get empathetic message for broken streak
 */
export function getBrokenStreakMessage(previousStreak: number): string {
    if (previousStreak > 30) {
        return "Life happens! You had an amazing run. Let's start fresh! 💪";
    }
    if (previousStreak > 7) {
        return "Missed a day? No worries! Your knowledge isn't going anywhere. 🌟";
    }
    return "Every day is a new opportunity to learn. Let's go! 🚀";
}
