/**
 * Video Keyboard Shortcuts Hook
 * Provides keyboard controls for video playback
 */

import { useEffect, useCallback, RefObject } from 'react';

interface UseVideoKeyboardOptions {
    videoRef: RefObject<HTMLVideoElement | null>;
    onToggleTheaterMode?: () => void;
    onShowShortcuts?: () => void;
    skipAmount?: number; // seconds to skip, default 10
    enabled?: boolean;
}

interface KeyboardShortcut {
    key: string;
    description: string;
    action: () => void;
}

/**
 * Hook to handle video keyboard shortcuts
 */
export function useVideoKeyboard({
    videoRef,
    onToggleTheaterMode,
    onShowShortcuts,
    skipAmount = 10,
    enabled = true,
}: UseVideoKeyboardOptions) {

    const getVideo = useCallback(() => videoRef.current, [videoRef]);

    // Play/Pause
    const togglePlay = useCallback(() => {
        const video = getVideo();
        if (!video) return;

        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }, [getVideo]);

    // Skip forward
    const skipForward = useCallback(() => {
        const video = getVideo();
        if (!video) return;
        video.currentTime = Math.min(video.currentTime + skipAmount, video.duration);
    }, [getVideo, skipAmount]);

    // Skip backward
    const skipBackward = useCallback(() => {
        const video = getVideo();
        if (!video) return;
        video.currentTime = Math.max(video.currentTime - skipAmount, 0);
    }, [getVideo, skipAmount]);

    // Toggle mute
    const toggleMute = useCallback(() => {
        const video = getVideo();
        if (!video) return;
        video.muted = !video.muted;
    }, [getVideo]);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        const video = getVideo();
        if (!video) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            video.requestFullscreen?.();
        }
    }, [getVideo]);

    // Volume up
    const volumeUp = useCallback(() => {
        const video = getVideo();
        if (!video) return;
        video.volume = Math.min(video.volume + 0.1, 1);
    }, [getVideo]);

    // Volume down
    const volumeDown = useCallback(() => {
        const video = getVideo();
        if (!video) return;
        video.volume = Math.max(video.volume - 0.1, 0);
    }, [getVideo]);

    // Speed increase
    const speedUp = useCallback(() => {
        const video = getVideo();
        if (!video) return;
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentIndex = speeds.indexOf(video.playbackRate);
        const nextIndex = Math.min(currentIndex + 1, speeds.length - 1);
        video.playbackRate = speeds[nextIndex];
    }, [getVideo]);

    // Speed decrease
    const speedDown = useCallback(() => {
        const video = getVideo();
        if (!video) return;
        const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentIndex = speeds.indexOf(video.playbackRate);
        const prevIndex = Math.max(currentIndex - 1, 0);
        video.playbackRate = speeds[prevIndex];
    }, [getVideo]);

    // Define all shortcuts
    // eslint-disable-next-line react-hooks/purity
    const shortcuts: Record<string, KeyboardShortcut> = {
        ' ': { key: 'Space', description: 'Play / Pause', action: togglePlay },
        'k': { key: 'K', description: 'Play / Pause', action: togglePlay },
        'ArrowRight': { key: '→', description: `Skip ${skipAmount}s forward`, action: skipForward },
        'l': { key: 'L', description: `Skip ${skipAmount}s forward`, action: skipForward },
        'ArrowLeft': { key: '←', description: `Skip ${skipAmount}s backward`, action: skipBackward },
        'j': { key: 'J', description: `Skip ${skipAmount}s backward`, action: skipBackward },
        'm': { key: 'M', description: 'Toggle mute', action: toggleMute },
        'f': { key: 'F', description: 'Toggle fullscreen', action: toggleFullscreen },
        'ArrowUp': { key: '↑', description: 'Volume up', action: volumeUp },
        'ArrowDown': { key: '↓', description: 'Volume down', action: volumeDown },
        '>': { key: '>', description: 'Increase speed', action: speedUp },
        '<': { key: '<', description: 'Decrease speed', action: speedDown },
        't': { key: 'T', description: 'Theater mode', action: () => onToggleTheaterMode?.() },
        '?': { key: '?', description: 'Show shortcuts', action: () => onShowShortcuts?.() },
    };

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if typing in an input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement)?.isContentEditable
            ) {
                return;
            }

            const shortcut = shortcuts[e.key];
            if (shortcut) {
                e.preventDefault();
                shortcut.action();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled, shortcuts]);

    // Return list of shortcuts for display
    const shortcutList = Object.values(shortcuts).filter(
        (s, i, arr) => arr.findIndex(x => x.description === s.description) === i
    );

    return {
        shortcuts: shortcutList,
        togglePlay,
        skipForward,
        skipBackward,
        toggleMute,
        toggleFullscreen,
        volumeUp,
        volumeDown,
        speedUp,
        speedDown,
    };
}

/**
 * Get keyboard shortcut display list
 */
export function getShortcutList(): Array<{ key: string; description: string }> {
    return [
        { key: 'Space / K', description: 'Play / Pause' },
        { key: '← / J', description: 'Skip 10s backward' },
        { key: '→ / L', description: 'Skip 10s forward' },
        { key: 'M', description: 'Toggle mute' },
        { key: 'F', description: 'Toggle fullscreen' },
        { key: '↑ / ↓', description: 'Volume up / down' },
        { key: '< / >', description: 'Playback speed' },
        { key: 'T', description: 'Theater mode' },
        { key: '?', description: 'Show shortcuts' },
    ];
}
