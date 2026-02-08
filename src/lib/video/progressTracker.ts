/**
 * Video Progress Tracker
 * Saves and retrieves video watch progress
 */

import { createClient } from '@/lib/supabase/client';

export interface VideoProgress {
    video_id: string;
    progress_seconds: number;
    duration_seconds: number | null;
    completed: boolean;
    last_watched_at: string;
}

const SAVE_INTERVAL = 10000; // Save every 10 seconds
const LOCAL_STORAGE_KEY = 'qb_video_progress_';

/**
 * Save video progress to database
 */
export async function saveProgress(
    userId: string,
    videoId: string,
    progressSeconds: number,
    durationSeconds?: number
): Promise<void> {
    const supabase = createClient();
    const completed = durationSeconds
        ? progressSeconds >= durationSeconds * 0.9 // 90% watched = completed
        : false;

    const { error } = await supabase
        .from('video_progress')
        .upsert({
            user_id: userId,
            video_id: videoId,
            progress_seconds: Math.floor(progressSeconds),
            duration_seconds: durationSeconds ? Math.floor(durationSeconds) : null,
            completed,
            last_watched_at: new Date().toISOString(),
        });

    if (error) {
        // Fallback to localStorage if database fails
        saveProgressLocal(videoId, progressSeconds, durationSeconds);
        console.error('Error saving progress to database:', error);
    }
}

/**
 * Get video progress from database
 */
export async function getProgress(
    userId: string,
    videoId: string
): Promise<VideoProgress | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('video_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .single();

    if (error || !data) {
        // Try localStorage fallback
        return getProgressLocal(videoId);
    }

    return data as VideoProgress;
}

/**
 * Save progress to localStorage (fallback)
 */
function saveProgressLocal(
    videoId: string,
    progressSeconds: number,
    durationSeconds?: number
): void {
    if (typeof window === 'undefined') return;

    const data = {
        video_id: videoId,
        progress_seconds: progressSeconds,
        duration_seconds: durationSeconds || null,
        completed: durationSeconds ? progressSeconds >= durationSeconds * 0.9 : false,
        last_watched_at: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_STORAGE_KEY + videoId, JSON.stringify(data));
}

/**
 * Get progress from localStorage
 */
function getProgressLocal(videoId: string): VideoProgress | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(LOCAL_STORAGE_KEY + videoId);
    if (!stored) return null;

    try {
        return JSON.parse(stored) as VideoProgress;
    } catch {
        return null;
    }
}

/**
 * Format seconds to human readable time
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Create a progress tracker class for a video element
 */
export class VideoProgressTracker {
    private videoId: string;
    private userId: string;
    private saveTimer: NodeJS.Timeout | null = null;
    private lastSavedTime = 0;

    constructor(videoId: string, userId: string) {
        this.videoId = videoId;
        this.userId = userId;
    }

    /**
     * Start tracking progress
     */
    startTracking(videoElement: HTMLVideoElement): void {
        // Save on time update (throttled)
        videoElement.addEventListener('timeupdate', () => {
            const currentTime = videoElement.currentTime;

            // Only save if changed significantly (at least 5 seconds)
            if (Math.abs(currentTime - this.lastSavedTime) >= 5) {
                this.schedulesSave(currentTime, videoElement.duration);
            }
        });

        // Save on pause
        videoElement.addEventListener('pause', () => {
            this.saveNow(videoElement.currentTime, videoElement.duration);
        });

        // Save on visibility change (tab switch, minimize)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveNow(videoElement.currentTime, videoElement.duration);
            }
        });

        // Save before unload
        window.addEventListener('beforeunload', () => {
            this.saveNow(videoElement.currentTime, videoElement.duration);
        });
    }

    /**
     * Schedule a save (debounced)
     */
    private schedulesSave(currentTime: number, duration: number): void {
        if (this.saveTimer) return;

        this.saveTimer = setTimeout(() => {
            this.saveNow(currentTime, duration);
            this.saveTimer = null;
        }, SAVE_INTERVAL);
    }

    /**
     * Save immediately
     */
    private saveNow(currentTime: number, duration: number): void {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
            this.saveTimer = null;
        }

        this.lastSavedTime = currentTime;
        saveProgress(this.userId, this.videoId, currentTime, duration);
    }

    /**
     * Cleanup
     */
    destroy(): void {
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
    }
}
