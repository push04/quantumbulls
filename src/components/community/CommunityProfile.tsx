"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserProfile, isFollowing, followUser, unfollowUser, getReputationBadge, type UserProfile } from "@/lib/community";

interface CommunityProfileProps {
    userId: string;
    currentUserId?: string;
}

/**
 * Community Profile Component
 * Displays public user profile with forum stats and follow functionality
 */
export function CommunityProfile({ userId, currentUserId }: CommunityProfileProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [following, setFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [data, isFollow] = await Promise.all([
                    getUserProfile(userId),
                    currentUserId ? isFollowing(userId) : Promise.resolve(false),
                ]);
                setProfile(data);
                setFollowing(isFollow);
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [userId, currentUserId]);

    const handleFollow = async () => {
        if (!currentUserId) return;
        try {
            if (following) {
                await unfollowUser(userId);
                setFollowing(false);
            } else {
                await followUser(userId);
                setFollowing(true);
            }
        } catch (error) {
            console.error("Failed to follow/unfollow:", error);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-100 rounded-xl" />
                <div className="h-48 bg-gray-100 rounded-xl" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-12 text-gray-500">
                User not found
            </div>
        );
    }

    const badge = getReputationBadge(profile.reputation_score);
    const joinDate = new Date(profile.created_at);

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2EBD59] to-[#1a8d3e] flex items-center justify-center text-white text-3xl font-bold">
                        {profile.full_name?.charAt(0) || "?"}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {profile.full_name || "Anonymous User"}
                            </h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color} bg-opacity-10`}>
                                {badge.icon} {badge.name}
                            </span>
                        </div>
                        <p className="text-gray-500 mt-1">
                            Member since {joinDate.toLocaleDateString("en", { month: "long", year: "numeric" })}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-6 mt-4">
                            <div>
                                <div className="text-xl font-semibold text-gray-900">{profile.reputation_score}</div>
                                <div className="text-sm text-gray-500">reputation</div>
                            </div>
                            <div>
                                <div className="text-xl font-semibold text-gray-900">{profile.forum_post_count}</div>
                                <div className="text-sm text-gray-500">posts</div>
                            </div>
                            <div>
                                <div className="text-xl font-semibold text-gray-900">{profile.follower_count}</div>
                                <div className="text-sm text-gray-500">followers</div>
                            </div>
                            <div>
                                <div className="text-xl font-semibold text-gray-900">{profile.following_count}</div>
                                <div className="text-sm text-gray-500">following</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {currentUserId && currentUserId !== userId && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleFollow}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${following
                                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        : "bg-[#2EBD59] text-white hover:bg-[#26a34d]"
                                    }`}
                            >
                                {following ? "Following" : "Follow"}
                            </button>
                            <Link
                                href={`/messages/new?to=${userId}`}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Message
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Badges</h2>
                <div className="flex flex-wrap gap-3">
                    {profile.is_trusted_member && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                            <span>⭐</span>
                            <span className="text-sm font-medium text-blue-700">Trusted Member</span>
                        </div>
                    )}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${badge.name === "Guru" ? "bg-amber-50 border-amber-200" :
                            badge.name === "Expert" ? "bg-purple-50 border-purple-200" :
                                badge.name === "Contributor" ? "bg-blue-50 border-blue-200" :
                                    "bg-gray-50 border-gray-200"
                        }`}>
                        <span>{badge.icon}</span>
                        <span className={`text-sm font-medium ${badge.color}`}>{badge.name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
