/**
 * Learning Path Manager
 * Handles path enrollment and progress tracking
 */

import { createClient } from '@/lib/supabase/client';

export interface LearningPath {
    id: string;
    title: string;
    slug: string;
    description?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedHours?: number;
    thumbnailUrl?: string;
    lessonsCount: number;
    isActive: boolean;
}

export interface PathEnrollment {
    pathId: string;
    enrolledAt: string;
    completedAt?: string;
    certificateUrl?: string;
}

export interface PathProgress {
    path: LearningPath;
    isEnrolled: boolean;
    completedLessons: number;
    percentComplete: number;
    enrollment?: PathEnrollment;
}

/**
 * Get all learning paths
 */
export async function getAllPaths(): Promise<LearningPath[]> {
    const supabase = createClient();

    const { data: paths } = await supabase
        .from('learning_paths')
        .select(`
            *,
            learning_path_lessons(count)
        `)
        .eq('is_active', true)
        .order('order_index');

    if (!paths) return [];

    return paths.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        difficulty: p.difficulty,
        estimatedHours: p.estimated_hours,
        thumbnailUrl: p.thumbnail_url,
        lessonsCount: p.learning_path_lessons?.[0]?.count || 0,
        isActive: p.is_active,
    }));
}

/**
 * Get path by slug with lessons
 */
export async function getPathBySlug(slug: string): Promise<LearningPath & { lessons: Array<{ id: string; title: string; orderIndex: number }> } | null> {
    const supabase = createClient();

    const { data: path } = await supabase
        .from('learning_paths')
        .select(`
            *,
            learning_path_lessons(
                order_index,
                lessons(id, title)
            )
        `)
        .eq('slug', slug)
        .single();

    if (!path) return null;

    const lessons = (path.learning_path_lessons || [])
        .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
        .map((lpl: { lessons: { id: string; title: string }; order_index: number }) => ({
            id: lpl.lessons.id,
            title: lpl.lessons.title,
            orderIndex: lpl.order_index,
        }));

    return {
        id: path.id,
        title: path.title,
        slug: path.slug,
        description: path.description,
        difficulty: path.difficulty,
        estimatedHours: path.estimated_hours,
        thumbnailUrl: path.thumbnail_url,
        lessonsCount: lessons.length,
        isActive: path.is_active,
        lessons,
    };
}

/**
 * Enroll user in a path
 */
export async function enrollInPath(userId: string, pathId: string): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('user_path_enrollments')
        .insert({
            user_id: userId,
            path_id: pathId,
        });

    if (error) {
        console.error('Error enrolling in path:', error);
        return false;
    }

    return true;
}

/**
 * Get user's enrolled paths with progress
 */
export async function getUserPathProgress(userId: string): Promise<PathProgress[]> {
    const supabase = createClient();

    // Get all paths
    const allPaths = await getAllPaths();

    // Get user's enrollments
    const { data: enrollments } = await supabase
        .from('user_path_enrollments')
        .select('*')
        .eq('user_id', userId);

    // Get user's completed lessons
    const { data: completedLessons } = await supabase
        .from('video_progress')
        .select('video_id')
        .eq('user_id', userId)
        .eq('completed', true);

    const completedSet = new Set((completedLessons || []).map(l => l.video_id));
    const enrollmentMap = new Map(
        (enrollments || []).map(e => [e.path_id, e])
    );

    // Get lessons for each path
    const pathProgressPromises = allPaths.map(async (path) => {
        const { data: pathLessons } = await supabase
            .from('learning_path_lessons')
            .select('lesson_id')
            .eq('path_id', path.id);

        const lessonIds = (pathLessons || []).map(pl => pl.lesson_id);
        const completedCount = lessonIds.filter(id => completedSet.has(id)).length;
        const enrollment = enrollmentMap.get(path.id);

        return {
            path,
            isEnrolled: !!enrollment,
            completedLessons: completedCount,
            percentComplete: lessonIds.length > 0
                ? Math.round((completedCount / lessonIds.length) * 100)
                : 0,
            enrollment: enrollment ? {
                pathId: enrollment.path_id,
                enrolledAt: enrollment.enrolled_at,
                completedAt: enrollment.completed_at,
                certificateUrl: enrollment.certificate_url,
            } : undefined,
        };
    });

    return Promise.all(pathProgressPromises);
}

/**
 * Mark path as completed and generate certificate
 */
export async function completePath(userId: string, pathId: string): Promise<string | null> {
    const supabase = createClient();

    // Generate certificate URL (placeholder - would be actual PDF generation)
    const certificateUrl = `/api/certificates/${pathId}/${userId}`;

    const { error } = await supabase
        .from('user_path_enrollments')
        .update({
            completed_at: new Date().toISOString(),
            certificate_url: certificateUrl,
        })
        .eq('user_id', userId)
        .eq('path_id', pathId);

    if (error) {
        console.error('Error completing path:', error);
        return null;
    }

    return certificateUrl;
}

/**
 * Get suggested next path
 */
export async function getSuggestedNextPath(userId: string): Promise<LearningPath | null> {
    const pathProgress = await getUserPathProgress(userId);

    // Find first incomplete enrolled path
    const incompletePath = pathProgress.find(
        p => p.isEnrolled && p.percentComplete < 100
    );
    if (incompletePath) return incompletePath.path;

    // Find first unenrolled path matching user level
    const completedBeginner = pathProgress.some(
        p => p.path.difficulty === 'beginner' && p.percentComplete === 100
    );
    const completedIntermediate = pathProgress.some(
        p => p.path.difficulty === 'intermediate' && p.percentComplete === 100
    );

    let targetDifficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (completedIntermediate) targetDifficulty = 'advanced';
    else if (completedBeginner) targetDifficulty = 'intermediate';

    const suggested = pathProgress.find(
        p => !p.isEnrolled && p.path.difficulty === targetDifficulty
    );

    return suggested?.path || null;
}
