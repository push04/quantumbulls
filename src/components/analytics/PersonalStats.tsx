"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface PersonalStats {
    totalVideosWatched: number;
    totalWatchTimeSeconds: number;
    coursesCompleted: number;
    coursesInProgress: number;
    avgVideosPerWeek: number;
    favoriteTopics: string[];
    currentStreak: number;
    longestStreak: number;
}

/**
 * Personal Learning Stats
 */
export default function PersonalStats({ userId }: { userId: string }) {
    const [stats, setStats] = useState<PersonalStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            const supabase = createClient();

            // Get video progress
            const { data: progress } = await supabase
                .from('video_progress')
                .select('*, lessons(course_id, courses(title, category))')
                .eq('user_id', userId);

            // Get streak data
            const { data: streak } = await supabase
                .from('user_streaks')
                .select('current_streak, longest_streak')
                .eq('user_id', userId)
                .single();

            if (!progress) {
                setStats({
                    totalVideosWatched: 0,
                    totalWatchTimeSeconds: 0,
                    coursesCompleted: 0,
                    coursesInProgress: 0,
                    avgVideosPerWeek: 0,
                    favoriteTopics: [],
                    currentStreak: 0,
                    longestStreak: 0,
                });
                setLoading(false);
                return;
            }

            // Calculate total videos and time
            const totalVideosWatched = progress.filter(p => p.completed).length;
            const totalWatchTimeSeconds = progress.reduce((sum, p) => sum + p.progress_seconds, 0);

            // Calculate courses
            const courseProgress: Record<string, { completed: number; total: number }> = {};
            progress.forEach(p => {
                const courseId = (p.lessons as { course_id: string })?.course_id;
                if (!courseId) return;
                if (!courseProgress[courseId]) {
                    courseProgress[courseId] = { completed: 0, total: 0 };
                }
                courseProgress[courseId].total++;
                if (p.completed) courseProgress[courseId].completed++;
            });

            let coursesCompleted = 0;
            let coursesInProgress = 0;
            Object.values(courseProgress).forEach(cp => {
                if (cp.completed >= cp.total * 0.9) coursesCompleted++;
                else if (cp.completed > 0) coursesInProgress++;
            });

            // Calculate avg videos per week
            const firstWatch = progress.length > 0
                ? new Date(progress[progress.length - 1].updated_at)
                : new Date();
            const weeks = Math.max(1, Math.ceil((Date.now() - firstWatch.getTime()) / (7 * 24 * 60 * 60 * 1000)));
            const avgVideosPerWeek = Math.round(totalVideosWatched / weeks * 10) / 10;

            // Calculate favorite topics
            const topicCounts: Record<string, number> = {};
            progress.forEach(p => {
                const category = (p.lessons as { courses: { category: string } })?.courses?.category;
                if (category) {
                    topicCounts[category] = (topicCounts[category] || 0) + 1;
                }
            });
            const favoriteTopics = Object.entries(topicCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([topic]) => topic);

            setStats({
                totalVideosWatched,
                totalWatchTimeSeconds,
                coursesCompleted,
                coursesInProgress,
                avgVideosPerWeek,
                favoriteTopics,
                currentStreak: streak?.current_streak || 0,
                longestStreak: streak?.longest_streak || 0,
            });
            setLoading(false);
        }
        loadStats();
    }, [userId]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                ))}
            </div>
        );
    }

    const statCards = [
        { label: 'Videos Watched', value: stats?.totalVideosWatched || 0, icon: '📺' },
        { label: 'Watch Time', value: formatTime(stats?.totalWatchTimeSeconds || 0), icon: '⏱️' },
        { label: 'Courses Completed', value: stats?.coursesCompleted || 0, icon: '🎓' },
        { label: 'In Progress', value: stats?.coursesInProgress || 0, icon: '📚' },
        { label: 'Avg/Week', value: stats?.avgVideosPerWeek || 0, icon: '📈' },
        { label: 'Current Streak', value: `${stats?.currentStreak || 0} days`, icon: '🔥' },
        { label: 'Best Streak', value: `${stats?.longestStreak || 0} days`, icon: '🏆' },
    ];

    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-4">Your Learning Stats</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{stat.icon}</span>
                            <span className="text-xs text-gray-500">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {stats?.favoriteTopics && stats.favoriteTopics.length > 0 && (
                <div className="mt-4 p-4 bg-[#2EBD59]/5 rounded-xl border border-[#2EBD59]/20">
                    <div className="text-sm text-gray-600 mb-2">Your Favorite Topics:</div>
                    <div className="flex flex-wrap gap-2">
                        {stats.favoriteTopics.map((topic, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-white text-[#2EBD59] text-sm font-medium rounded-full border border-[#2EBD59]/20"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
