"use client";

import { LEVELS, type UserXPData } from "@/lib/engagement/xpManager";

interface XPProgressProps {
    xpData: UserXPData;
    showNumbers?: boolean;
    compact?: boolean;
}

/**
 * XP Progress Bar with level info
 */
export default function XPProgress({
    xpData,
    showNumbers = true,
    compact = false
}: XPProgressProps) {
    const { totalXP, currentLevel, xpToNextLevel, progressPercent, levelInfo, nextLevelInfo } = xpData;

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <span className="text-lg">{levelInfo.icon}</span>
                <div className="flex-1">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${progressPercent}%`,
                                backgroundColor: levelInfo.color,
                            }}
                        />
                    </div>
                </div>
                <span className="text-sm font-medium" style={{ color: levelInfo.color }}>
                    {totalXP} XP
                </span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{levelInfo.icon}</span>
                    <div>
                        <div className="font-semibold text-gray-900">{levelInfo.title}</div>
                        {showNumbers && (
                            <div className="text-sm text-gray-500">
                                {totalXP.toLocaleString()} XP total
                            </div>
                        )}
                    </div>
                </div>
                {nextLevelInfo && (
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Next level</div>
                        <div className="flex items-center gap-1">
                            <span>{nextLevelInfo.icon}</span>
                            <span className="font-medium" style={{ color: nextLevelInfo.color }}>
                                {nextLevelInfo.level.charAt(0).toUpperCase() + nextLevelInfo.level.slice(1)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div className="mb-2">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500 relative"
                        style={{
                            width: `${progressPercent}%`,
                            background: `linear-gradient(90deg, ${levelInfo.color}, ${nextLevelInfo?.color || levelInfo.color})`,
                        }}
                    >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    </div>
                </div>
            </div>

            {/* XP to next level */}
            {nextLevelInfo && showNumbers && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                        {progressPercent}% to {nextLevelInfo.level}
                    </span>
                    <span className="font-medium text-gray-700">
                        {xpToNextLevel} XP needed
                    </span>
                </div>
            )}

            {/* Max level */}
            {!nextLevelInfo && (
                <div className="text-center text-sm text-gray-500">
                    🎉 You've reached the highest level!
                </div>
            )}
        </div>
    );
}
