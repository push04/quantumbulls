/**
 * Content Analytics
 * Video and course performance tracking
 */

import { createClient } from '@/lib/supabase/client';

export interface VideoStats {
    videoId: string;
    title: string;
    courseTitle: string;
    views: number;
    completions: number;
    avgWatchTime: number; // seconds
    completionRate: number; // percentage
    dropoffRate: number; // percentage
}

export interface CourseStats {
    courseId: string;
    title: string;
    enrollments: number;
    completions: number;
    completionRate: number;
    avgProgress: number;
}

export interface DropoffPoint {
    videoId: string;
    title: string;
    exitCount: number;
    exitPercentage: number;
    avgExitTime: number; // seconds
}

/**
 * Get top watched videos
 */
export async function getTopVideos(limit: number = 20): Promise<VideoStats[]> {
    const supabase = createClient();

    // Get video views from analytics
    const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type, event_data')
        .in('event_type', ['video_start', 'video_complete']);

    if (!events) return [];

    // Aggregate by video
    const videoStats: Record<string, { views: number; completions: number; durations: number[] }> = {};

    events.forEach(e => {
        const videoId = e.event_data?.videoId as string;
        if (!videoId) return;

        if (!videoStats[videoId]) {
            videoStats[videoId] = { views: 0, completions: 0, durations: [] };
        }

        if (e.event_type === 'video_start') {
            videoStats[videoId].views++;
        } else if (e.event_type === 'video_complete') {
            videoStats[videoId].completions++;
            if (e.event_data?.duration) {
                videoStats[videoId].durations.push(e.event_data.duration as number);
            }
        }
    });

    // Get video details
    const videoIds = Object.keys(videoStats);
    const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title, courses(title)')
        .in('id', videoIds);

    if (!lessons) return [];

    // Build result
    const result: VideoStats[] = lessons.map(lesson => {
        const stats = videoStats[lesson.id] || { views: 0, completions: 0, durations: [] };
        const avgWatchTime = stats.durations.length > 0
            ? stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length
            : 0;

        return {
            videoId: lesson.id,
            title: lesson.title,
            courseTitle: Array.isArray(lesson.courses)
                ? (lesson.courses[0] as { title: string })?.title || ''
                : (lesson.courses as { title: string } | null)?.title || '',
            views: stats.views,
            completions: stats.completions,
            avgWatchTime: Math.round(avgWatchTime),
            completionRate: stats.views > 0 ? Math.round((stats.completions / stats.views) * 100) : 0,
            dropoffRate: stats.views > 0 ? Math.round(((stats.views - stats.completions) / stats.views) * 100) : 0,
        };
    });

    return result
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
}

/**
 * Get course completion rates
 */
export async function getCourseStats(): Promise<CourseStats[]> {
    const supabase = createClient();

    // Get all courses
    const { data: courses } = await supabase
        .from('courses')
        .select('id, title, lessons(id)')
        .eq('is_active', true);

    if (!courses) return [];

    // Get user progress
    const { data: progress } = await supabase
        .from('video_progress')
        .select('video_id, user_id, completed');

    if (!progress) return [];

    // Calculate stats for each course
    const result: CourseStats[] = courses.map(course => {
        const lessonIds = new Set((course.lessons as { id: string }[]).map(l => l.id));
        const totalLessons = lessonIds.size;

        // Get unique users who started this course
        const userProgress: Record<string, { completed: number; total: number }> = {};

        progress.forEach(p => {
            if (!lessonIds.has(p.video_id)) return;

            if (!userProgress[p.user_id]) {
                userProgress[p.user_id] = { completed: 0, total: 0 };
            }
            userProgress[p.user_id].total++;
            if (p.completed) {
                userProgress[p.user_id].completed++;
            }
        });

        const enrollments = Object.keys(userProgress).length;
        const completions = Object.values(userProgress).filter(
            up => up.completed >= totalLessons * 0.9 // 90% completion = complete
        ).length;

        const avgProgress = enrollments > 0
            ? Math.round(
                Object.values(userProgress).reduce((sum, up) =>
                    sum + (totalLessons > 0 ? (up.completed / totalLessons) * 100 : 0), 0
                ) / enrollments
            )
            : 0;

        return {
            courseId: course.id,
            title: course.title,
            enrollments,
            completions,
            completionRate: enrollments > 0 ? Math.round((completions / enrollments) * 100) : 0,
            avgProgress,
        };
    });

    return result.sort((a, b) => b.enrollments - a.enrollments);
}

/**
 * Get drop-off points (videos with high exit rates)
 */
export async function getDropoffPoints(limit: number = 10): Promise<DropoffPoint[]> {
    const supabase = createClient();

    // Get video progress patterns
    const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type, event_data')
        .in('event_type', ['video_start', 'video_complete', 'video_progress']);

    if (!events) return [];

    // Calculate dropoffs
    const videoDropoffs: Record<string, { starts: number; exits: number; exitTimes: number[] }> = {};

    events.forEach(e => {
        const videoId = e.event_data?.videoId as string;
        if (!videoId) return;

        if (!videoDropoffs[videoId]) {
            videoDropoffs[videoId] = { starts: 0, exits: 0, exitTimes: [] };
        }

        if (e.event_type === 'video_start') {
            videoDropoffs[videoId].starts++;
        } else if (e.event_type === 'video_progress') {
            // Track exit times (last progress before no completion)
            const duration = e.event_data?.duration as number;
            if (duration) {
                videoDropoffs[videoId].exitTimes.push(duration);
            }
        }
    });

    // Calculate exits (starts - completions)
    events.filter(e => e.event_type === 'video_complete').forEach(e => {
        const videoId = e.event_data?.videoId as string;
        if (videoDropoffs[videoId]) {
            videoDropoffs[videoId].exits = videoDropoffs[videoId].starts - 1;
        }
    });

    // Get video titles
    const videoIds = Object.keys(videoDropoffs);
    const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title')
        .in('id', videoIds);

    if (!lessons) return [];

    const titleMap = new Map(lessons.map(l => [l.id, l.title]));

    // Build result
    const result: DropoffPoint[] = Object.entries(videoDropoffs)
        .filter(([, stats]) => stats.starts > 5) // Minimum sample size
        .map(([videoId, stats]) => ({
            videoId,
            title: titleMap.get(videoId) || 'Unknown',
            exitCount: stats.exits,
            exitPercentage: stats.starts > 0 ? Math.round((stats.exits / stats.starts) * 100) : 0,
            avgExitTime: stats.exitTimes.length > 0
                ? Math.round(stats.exitTimes.reduce((a, b) => a + b, 0) / stats.exitTimes.length)
                : 0,
        }))
        .sort((a, b) => b.exitPercentage - a.exitPercentage)
        .slice(0, limit);

    return result;
}

/**
 * Get average watch time across platform
 */
export async function getAverageWatchTime(): Promise<number> {
    const supabase = createClient();

    const { data } = await supabase
        .from('video_progress')
        .select('progress_seconds');

    if (!data || data.length === 0) return 0;

    const total = data.reduce((sum, p) => sum + p.progress_seconds, 0);
    return Math.round(total / data.length);
}

/**
 * Format duration
 */
export function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
}
