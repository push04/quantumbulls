/**
 * Progress Calculator
 * Calculates user progress for courses, paths, and overall learning
 */

import { createClient } from '@/lib/supabase/client';

export interface CourseProgress {
    courseId: string;
    courseTitle: string;
    totalLessons: number;
    completedLessons: number;
    percentComplete: number;
    remainingSeconds: number;
    lastWatchedLessonId: string | null;
    lastWatchedAt: string | null;
    lastWatchedProgress: number;
}

export interface LearningStats {
    totalCoursesStarted: number;
    totalCoursesCompleted: number;
    totalLessonsCompleted: number;
    totalMinutesWatched: number;
    currentStreak: number;
    longestStreak: number;
}

export interface WeeklyActivity {
    date: string;
    dayName: string;
    minutesWatched: number;
    lessonsCompleted: number;
}

/**
 * Get progress for a specific course
 */
export async function getCourseProgress(
    userId: string,
    courseId: string
): Promise<CourseProgress | null> {
    const supabase = createClient();

    // Get course info and lessons
    const { data: course } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', courseId)
        .single();

    if (!course) return null;

    const { data: lessons } = await supabase
        .from('lessons')
        .select('id, duration_seconds')
        .eq('course_id', courseId);

    if (!lessons) return null;

    // Get user's progress for these lessons
    const lessonIds = lessons.map(l => l.id);
    const { data: progress } = await supabase
        .from('video_progress')
        .select('*')
        .eq('user_id', userId)
        .in('video_id', lessonIds);

    const completedLessons = progress?.filter(p => p.completed).length || 0;
    const totalLessons = lessons.length;

    // Calculate remaining time
    const completedIds = new Set(progress?.filter(p => p.completed).map(p => p.video_id) || []);
    const remainingSeconds = lessons
        .filter(l => !completedIds.has(l.id))
        .reduce((sum, l) => sum + (l.duration_seconds || 0), 0);

    // Get last watched lesson
    const lastProgress = progress?.sort((a, b) =>
        new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime()
    )[0];

    return {
        courseId,
        courseTitle: course.title,
        totalLessons,
        completedLessons,
        percentComplete: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        remainingSeconds,
        lastWatchedLessonId: lastProgress?.video_id || null,
        lastWatchedAt: lastProgress?.last_watched_at || null,
        lastWatchedProgress: lastProgress?.progress_seconds || 0,
    };
}

/**
 * Get all course progress for a user
 */
export async function getAllCourseProgress(userId: string): Promise<CourseProgress[]> {
    const supabase = createClient();

    const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('is_active', true);

    if (!courses) return [];

    const progressPromises = courses.map(c => getCourseProgress(userId, c.id));
    const allProgress = await Promise.all(progressPromises);

    return allProgress.filter((p): p is CourseProgress => p !== null);
}

/**
 * Get the last watched lesson across all courses
 */
export async function getLastWatchedLesson(userId: string): Promise<{
    lesson: { id: string; title: string; thumbnail_url: string; course_title: string } | null;
    progressSeconds: number;
    durationSeconds: number;
}> {
    const supabase = createClient();

    const { data: progress } = await supabase
        .from('video_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false)
        .order('last_watched_at', { ascending: false })
        .limit(1)
        .single();

    if (!progress) {
        return { lesson: null, progressSeconds: 0, durationSeconds: 0 };
    }

    const { data: lesson } = await supabase
        .from('lessons')
        .select('id, title, thumbnail_url, courses(title)')
        .eq('id', progress.video_id)
        .single();

    if (!lesson) {
        return { lesson: null, progressSeconds: 0, durationSeconds: 0 };
    }

    return {
        lesson: {
            id: lesson.id,
            title: lesson.title,
            thumbnail_url: lesson.thumbnail_url,
            course_title: ((lesson as unknown as { courses: { title: string } | null }).courses)?.title || '',
        },
        progressSeconds: progress.progress_seconds,
        durationSeconds: progress.duration_seconds || 0,
    };
}

/**
 * Get weekly activity data for chart
 */
export async function getWeeklyActivity(userId: string): Promise<WeeklyActivity[]> {
    const supabase = createClient();

    // Get last 7 days
    const days: WeeklyActivity[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        days.push({
            date: dateStr,
            dayName: dayNames[date.getDay()],
            minutesWatched: 0,
            lessonsCompleted: 0,
        });
    }

    // Fetch activity data
    const startDate = days[0].date;
    const endDate = days[days.length - 1].date;

    const { data: activity } = await supabase
        .from('user_daily_activity')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

    // Merge with days array
    if (activity) {
        activity.forEach(a => {
            const day = days.find(d => d.date === a.date);
            if (day) {
                day.minutesWatched = a.minutes_watched;
                day.lessonsCompleted = a.lessons_completed;
            }
        });
    }

    return days;
}

/**
 * Calculate learning streak
 */
export async function calculateStreak(userId: string): Promise<{ current: number; longest: number }> {
    const supabase = createClient();

    const { data: activity } = await supabase
        .from('user_daily_activity')
        .select('date, minutes_watched')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(365);

    if (!activity || activity.length === 0) {
        return { current: 0, longest: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;
    let prevDate: Date | null = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const day of activity) {
        const date = new Date(day.date);
        date.setHours(0, 0, 0, 0);

        if (day.minutes_watched > 0) {
            if (!prevDate) {
                streak = 1;
                // Check if it's today or yesterday for current streak
                const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays <= 1) {
                    currentStreak = streak;
                }
            } else {
                const diff = Math.floor((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                if (diff === 1) {
                    streak++;
                    if (currentStreak > 0) currentStreak = streak;
                } else {
                    longestStreak = Math.max(longestStreak, streak);
                    streak = 1;
                }
            }
            prevDate = date;
        }
    }

    longestStreak = Math.max(longestStreak, streak);

    return { current: currentStreak, longest: longestStreak };
}

/**
 * Get overall learning stats
 */
export async function getLearningStats(userId: string): Promise<LearningStats> {
    const supabase = createClient();

    // Get total minutes from daily activity
    const { data: activity } = await supabase
        .from('user_daily_activity')
        .select('minutes_watched, lessons_completed')
        .eq('user_id', userId);

    const totalMinutesWatched = activity?.reduce((sum, a) => sum + a.minutes_watched, 0) || 0;
    const totalLessonsCompleted = activity?.reduce((sum, a) => sum + a.lessons_completed, 0) || 0;

    // Get courses started/completed
    const allProgress = await getAllCourseProgress(userId);
    const coursesStarted = allProgress.filter(p => p.completedLessons > 0).length;
    const coursesCompleted = allProgress.filter(p => p.percentComplete === 100).length;

    // Get streak
    const { current, longest } = await calculateStreak(userId);

    return {
        totalCoursesStarted: coursesStarted,
        totalCoursesCompleted: coursesCompleted,
        totalLessonsCompleted,
        totalMinutesWatched,
        currentStreak: current,
        longestStreak: longest,
    };
}

/**
 * Update daily activity when user watches video
 */
export async function updateDailyActivity(
    userId: string,
    minutesToAdd: number,
    lessonCompleted: boolean = false
): Promise<void> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    // Try to update existing record
    const { data: existing } = await supabase
        .from('user_daily_activity')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

    if (existing) {
        await supabase
            .from('user_daily_activity')
            .update({
                minutes_watched: existing.minutes_watched + minutesToAdd,
                lessons_completed: existing.lessons_completed + (lessonCompleted ? 1 : 0),
            })
            .eq('id', existing.id);
    } else {
        await supabase
            .from('user_daily_activity')
            .insert({
                user_id: userId,
                date: today,
                minutes_watched: minutesToAdd,
                lessons_completed: lessonCompleted ? 1 : 0,
            });
    }
}

/**
 * Format seconds to readable duration
 */
export function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
}

/**
 * Format remaining time for course
 */
export function formatRemainingTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''} remaining`;
    }
    return `${mins} minute${mins !== 1 ? 's' : ''} remaining`;
}
