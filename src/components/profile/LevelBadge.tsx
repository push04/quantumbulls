"use client";

import { LEVELS, type UserLevel } from "@/lib/engagement/xpManager";

interface LevelBadgeProps {
    level: UserLevel;
    size?: 'sm' | 'md' | 'lg';
    showTitle?: boolean;
}

/**
 * User Level Badge
 */
export default function LevelBadge({
    level,
    size = 'md',
    showTitle = false
}: LevelBadgeProps) {
    const levelInfo = LEVELS[level];

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };

    const iconSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
            style={{
                backgroundColor: `${levelInfo.color}20`,
                color: levelInfo.color,
            }}
        >
            <span className={iconSizes[size]}>{levelInfo.icon}</span>
            <span>{showTitle ? levelInfo.title : levelInfo.level.charAt(0).toUpperCase() + levelInfo.level.slice(1)}</span>
        </div>
    );
}
