/**
 * Prefetch Utility
 * Prefetches next lesson when user is near completion
 */

import { createClient } from "@/lib/supabase/client";

interface LessonData {
    id: string;
    title: string;
    video_url: string;
    thumbnail_url?: string;
}

// Cache for prefetched lessons
const prefetchCache = new Map<string, LessonData>();

/**
 * Prefetch next lesson data
 */
export async function prefetchNextLesson(
    currentLessonId: string,
    courseId: string
): Promise<LessonData | null> {
    const cacheKey = `next-${currentLessonId}`;

    // Check cache first
    if (prefetchCache.has(cacheKey)) {
        return prefetchCache.get(cacheKey) || null;
    }

    try {
        const supabase = createClient();

        // Get current lesson order
        const { data: currentLesson } = await supabase
            .from("lessons")
            .select("order_index")
            .eq("id", currentLessonId)
            .single();

        if (!currentLesson) return null;

        // Get next lesson
        const { data: nextLesson } = await supabase
            .from("lessons")
            .select("id, title, video_url, thumbnail_url")
            .eq("course_id", courseId)
            .gt("order_index", currentLesson.order_index)
            .order("order_index", { ascending: true })
            .limit(1)
            .single();

        if (nextLesson) {
            prefetchCache.set(cacheKey, nextLesson);

            // Prefetch thumbnail image
            if (nextLesson.thumbnail_url) {
                const img = new Image();
                img.src = nextLesson.thumbnail_url;
            }
        }

        return nextLesson || null;
    } catch (error) {
        console.error("Failed to prefetch next lesson:", error);
        return null;
    }
}

/**
 * Hook to trigger prefetch at video progress threshold
 */
export function shouldPrefetch(
    currentProgress: number,
    duration: number,
    threshold: number = 0.8
): boolean {
    if (duration === 0) return false;
    return currentProgress / duration >= threshold;
}

/**
 * Prefetch page data for faster navigation
 */
export function prefetchPage(url: string): void {
    if (typeof window === "undefined") return;

    // Use link prefetch
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    document.head.appendChild(link);
}

/**
 * Warm video buffer by starting to load first chunk
 */
export function warmVideoBuffer(videoUrl: string): void {
    if (typeof window === "undefined") return;

    // Request first 1MB of video to warm cache
    fetch(videoUrl, {
        method: "GET",
        headers: {
            Range: "bytes=0-1048576", // First 1MB
        },
    }).catch(() => {
        // Ignore errors - this is just optimization
    });
}

/**
 * Clear prefetch cache
 */
export function clearPrefetchCache(): void {
    prefetchCache.clear();
}

/**
 * Get cached lesson data
 */
export function getCachedLesson(lessonId: string): LessonData | null {
    for (const [key, value] of prefetchCache.entries()) {
        if (value.id === lessonId) {
            return value;
        }
    }
    return null;
}
