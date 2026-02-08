"use client";

import type { Achievement } from "@/lib/learning/achievementTracker";

interface AchievementBadgesProps {
    achievements: Achievement[];
    showAll?: boolean;
}

/**
 * Achievement Badges Display
 */
export default function AchievementBadges({ achievements, showAll = false }: AchievementBadgesProps) {
    const displayed = showAll ? achievements : achievements.slice(0, 5);
    const remaining = achievements.length - displayed.length;

    if (achievements.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">🏆 Achievements</h3>
                <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                        🎯
                    </div>
                    <p className="text-gray-600 text-sm">
                        Complete lessons to earn your first badge!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">🏆 Achievements</h3>
                <span className="text-sm text-gray-500">
                    {achievements.length} earned
                </span>
            </div>

            {/* Badges Grid */}
            <div className="flex flex-wrap gap-3">
                {displayed.map((achievement) => (
                    <div
                        key={achievement.type}
                        className="group relative"
                    >
                        {/* Badge */}
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2EBD59]/10 to-emerald-100 flex items-center justify-center text-2xl hover:scale-110 transition-transform cursor-default border border-[#2EBD59]/20">
                            {achievement.icon}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            <div className="font-semibold">{achievement.title}</div>
                            <div className="text-gray-300">{achievement.description}</div>
                            {achievement.achievedAt && (
                                <div className="text-gray-400 mt-1">
                                    {new Date(achievement.achievedAt).toLocaleDateString()}
                                </div>
                            )}
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </div>
                    </div>
                ))}

                {/* Plus more indicator */}
                {remaining > 0 && (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500 border border-gray-200">
                        +{remaining}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Single Achievement Badge (for notifications)
 */
export function AchievementNotification({ achievement }: { achievement: Achievement }) {
    return (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#2EBD59]/10 to-emerald-50 rounded-xl border border-[#2EBD59]/20 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm">
                {achievement.icon}
            </div>
            <div>
                <div className="text-xs font-medium text-[#2EBD59] uppercase tracking-wide">
                    Achievement Unlocked!
                </div>
                <div className="font-semibold text-gray-900">{achievement.title}</div>
                <div className="text-sm text-gray-600">{achievement.description}</div>
            </div>
        </div>
    );
}
