"use client";

import { ACHIEVEMENTS, type Achievement } from "@/lib/learning/achievementTracker";

interface BadgeGridProps {
    earnedBadges: Achievement[];
    showLocked?: boolean;
    maxVisible?: number;
}

/**
 * Badge Grid Display
 */
export default function BadgeGrid({
    earnedBadges,
    showLocked = true,
    maxVisible = 12
}: BadgeGridProps) {
    const allAchievements = Object.values(ACHIEVEMENTS);
    const earnedTypes = new Set(earnedBadges.map(b => b.type));

    const displayBadges = showLocked
        ? allAchievements.slice(0, maxVisible)
        : earnedBadges.slice(0, maxVisible);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🏅</span>
                    <h3 className="font-semibold text-gray-900">Achievements</h3>
                </div>
                <span className="text-sm text-gray-500">
                    {earnedBadges.length} / {allAchievements.length} unlocked
                </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {displayBadges.map((badge) => {
                    const isEarned = earnedTypes.has(badge.type);
                    const earnedBadge = earnedBadges.find(b => b.type === badge.type);

                    return (
                        <div
                            key={badge.type}
                            className={`group relative aspect-square rounded-xl flex items-center justify-center text-3xl transition-all cursor-pointer ${isEarned
                                    ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 hover:scale-110'
                                    : 'bg-gray-100 border-2 border-gray-200 opacity-40'
                                }`}
                            title={isEarned ? `${badge.title} - ${badge.description}` : `🔒 ${badge.title}`}
                        >
                            {isEarned ? (
                                <span className="drop-shadow-sm">{badge.icon}</span>
                            ) : (
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            )}

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                <div className="font-medium">{badge.title}</div>
                                <div className="text-gray-400">{badge.description}</div>
                                {earnedBadge?.achievedAt && (
                                    <div className="text-gray-500 mt-1">
                                        Earned {new Date(earnedBadge.achievedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View all link */}
            {allAchievements.length > maxVisible && (
                <button className="w-full mt-4 py-2 text-sm text-[#2EBD59] hover:text-[#26a34d] font-medium">
                    View all achievements →
                </button>
            )}
        </div>
    );
}
