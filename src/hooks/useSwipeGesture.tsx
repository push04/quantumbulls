"use client";

import { useRef, useCallback, useEffect } from "react";

interface SwipeConfig {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    threshold?: number; // Minimum distance for swipe
    allowedTime?: number; // Max time for swipe gesture
}

interface TouchPoint {
    x: number;
    y: number;
    time: number;
}

/**
 * Hook for swipe gesture detection
 */
export function useSwipeGesture<T extends HTMLElement = HTMLDivElement>(
    config: SwipeConfig
) {
    const {
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        threshold = 50,
        allowedTime = 300,
    } = config;

    const ref = useRef<T>(null);
    const touchStart = useRef<TouchPoint | null>(null);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        const touch = e.changedTouches[0];
        touchStart.current = {
            x: touch.pageX,
            y: touch.pageY,
            time: Date.now(),
        };
    }, []);

    const handleTouchEnd = useCallback(
        (e: TouchEvent) => {
            if (!touchStart.current) return;

            const touch = e.changedTouches[0];
            const dx = touch.pageX - touchStart.current.x;
            const dy = touch.pageY - touchStart.current.y;
            const dt = Date.now() - touchStart.current.time;

            // Check if swipe is fast enough
            if (dt > allowedTime) {
                touchStart.current = null;
                return;
            }

            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            // Horizontal swipe
            if (absDx > threshold && absDx > absDy) {
                if (dx > 0) {
                    onSwipeRight?.();
                } else {
                    onSwipeLeft?.();
                }
            }
            // Vertical swipe
            else if (absDy > threshold && absDy > absDx) {
                if (dy > 0) {
                    onSwipeDown?.();
                } else {
                    onSwipeUp?.();
                }
            }

            touchStart.current = null;
        },
        [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, allowedTime]
    );

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        element.addEventListener("touchstart", handleTouchStart, { passive: true });
        element.addEventListener("touchend", handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener("touchstart", handleTouchStart);
            element.removeEventListener("touchend", handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchEnd]);

    return ref;
}

/**
 * Swipe-enabled lesson navigation wrapper
 */
interface SwipeLessonNavProps {
    children: React.ReactNode;
    onPrevious?: () => void;
    onNext?: () => void;
    className?: string;
}

export function SwipeLessonNav({
    children,
    onPrevious,
    onNext,
    className = "",
}: SwipeLessonNavProps) {
    const swipeRef = useSwipeGesture<HTMLDivElement>({
        onSwipeLeft: onNext,
        onSwipeRight: onPrevious,
        threshold: 75, // Larger threshold for lesson nav
    });

    return (
        <div ref={swipeRef} className={`touch-pan-y ${className}`}>
            {children}
        </div>
    );
}

/**
 * Swipe indicator component
 */
export function SwipeIndicator({
    show,
    direction
}: {
    show: boolean;
    direction: "left" | "right"
}) {
    if (!show) return null;

    return (
        <div
            className={`fixed top-1/2 -translate-y-1/2 z-50 pointer-events-none transition-opacity ${direction === "left" ? "right-4" : "left-4"
                }`}
        >
            <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                {direction === "left" ? (
                    <>
                        <span>Next</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Previous</span>
                    </>
                )}
            </div>
        </div>
    );
}
