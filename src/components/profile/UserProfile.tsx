"use client";

import { type UserXPData } from "@/lib/engagement/xpManager";
import { type StreakData } from "@/lib/engagement/streakManager";
import { type Achievement } from "@/lib/learning/achievementTracker";
import Image from "next/image";
import LevelBadge from "./LevelBadge";
import XPProgress from "./XPProgress";
import BadgeGrid from "./BadgeGrid";

interface UserProfileProps {
    user: {
        id: string;
        name: string;
        email?: string;
        avatarUrl?: string;
        joinedAt: string;
        tier?: string;
    };
    xpData: UserXPData;
    streakData: StreakData;
    badges: Achievement[];
    stats: {
        coursesCompleted: number;
        lessonsWatched: number;
        totalMinutes: number;
    };
    isOwnProfile?: boolean;
}

/**
 * User Profile Component
 */
export default function UserProfile({
    user,
    xpData,
    streakData,
    badges,
    stats,
    isOwnProfile = false,
}: UserProfileProps) {
    const joinDate = new Date(user.joinedAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="max-w-3xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2EBD59] to-emerald-400 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                            {user.avatarUrl ? (
                                <Image
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        {/* Level icon */}
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center text-xl shadow-md border border-gray-100">
                            {xpData.levelInfo.icon}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                            <LevelBadge level={xpData.currentLevel} size="sm" />
                        </div>
                        <p className="text-gray-500 mb-2">Member since {joinDate}</p>

                        {/* Quick stats */}
                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <span className="text-orange-500">🔥</span>
                                <span className="font-medium text-gray-900">{streakData.currentStreak}</span>
                                <span className="text-gray-500">day streak</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-amber-500">⭐</span>
                                <span className="font-medium text-gray-900">{xpData.totalXP.toLocaleString()}</span>
                                <span className="text-gray-500">XP</span>
                            </div>
                        </div>
                    </div>

                    {/* Edit button (if own profile) */}
                    {isOwnProfile && (
                        <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-[#2EBD59]">{stats.coursesCompleted}</div>
                    <div className="text-sm text-gray-500">Courses Completed</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">{stats.lessonsWatched}</div>
                    <div className="text-sm text-gray-500">Lessons Watched</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-purple-500">{Math.round(stats.totalMinutes / 60)}h</div>
                    <div className="text-sm text-gray-500">Learning Time</div>
                </div>
            </div>

            {/* XP Progress */}
            <div className="mb-6">
                <XPProgress xpData={xpData} />
            </div>

            {/* Badges */}
            <BadgeGrid earnedBadges={badges} />
        </div>
    );
}
