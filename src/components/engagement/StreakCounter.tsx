"use client";

import { type StreakData, getStreakMessage, getNextMilestone, STREAK_MILESTONES } from "@/lib/engagement/streakManager";

interface StreakCounterProps {
    streak: StreakData;
    size?: 'sm' | 'md' | 'lg';
    showMessage?: boolean;
}

/**
 * Streak Counter with fire animation
 */
export default function StreakCounter({
    streak,
    size = 'md',
    showMessage = true
}: StreakCounterProps) {
    const nextMilestone = getNextMilestone(streak.currentStreak);
    const daysToMilestone = nextMilestone ? nextMilestone.days - streak.currentStreak : 0;

    const sizeClasses = {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    const iconSizes = {
        sm: 'text-2xl',
        md: 'text-3xl',
        lg: 'text-4xl',
    };

    const numberSizes = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-4xl',
    };

    // Determine fire intensity based on streak
    const getFireEmoji = () => {
        if (streak.currentStreak === 0) return '🌱';
        if (streak.currentStreak < 3) return '🔥';
        if (streak.currentStreak < 7) return '🔥🔥';
        if (streak.currentStreak < 30) return '🔥🔥🔥';
        return '🔥👑🔥';
    };

    return (
        <div className={`bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 ${sizeClasses[size]}`}>
            <div className="flex items-center gap-4">
                {/* Fire icon with animation */}
                <div className={`${iconSizes[size]} animate-pulse`}>
                    {getFireEmoji()}
                </div>

                {/* Streak number */}
                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <span className={`font-bold text-orange-600 ${numberSizes[size]}`}>
                            {streak.currentStreak}
                        </span>
                        <span className="text-orange-500 font-medium">
                            day{streak.currentStreak !== 1 ? 's' : ''} streak
                        </span>
                    </div>

                    {showMessage && (
                        <p className="text-sm text-orange-600/70 mt-1">
                            {getStreakMessage(streak)}
                        </p>
                    )}
                </div>

                {/* Next milestone */}
                {nextMilestone && streak.currentStreak > 0 && (
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Next reward</div>
                        <div className="flex items-center gap-1 text-sm">
                            <span>{nextMilestone.icon}</span>
                            <span className="text-orange-600 font-medium">
                                {daysToMilestone} day{daysToMilestone !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Milestone progress */}
            {nextMilestone && streak.currentStreak > 0 && (
                <div className="mt-3">
                    <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all"
                            style={{
                                width: `${(streak.currentStreak / nextMilestone.days) * 100}%`
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Today's status */}
            {streak.isActiveToday && (
                <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Today&apos;s streak secured!</span>
                </div>
            )}
        </div>
    );
}
