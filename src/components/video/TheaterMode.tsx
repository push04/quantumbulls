"use client";

import { useState, useEffect, ReactNode } from "react";

interface TheaterModeProps {
    children: ReactNode;
    isActive: boolean;
    onToggle: () => void;
}

const THEATER_MODE_KEY = 'qb_theater_mode';

/**
 * Theater Mode Container
 * Dims background and focuses on video content
 */
export default function TheaterMode({ children, isActive, onToggle }: TheaterModeProps) {
    // Handle ESC to exit theater mode
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isActive) {
                onToggle();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isActive, onToggle]);

    // Prevent scrolling in theater mode
    useEffect(() => {
        if (isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isActive]);

    if (!isActive) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col">
            {/* Dimmed backdrop */}
            <div
                className="absolute inset-0 bg-black/95"
                onClick={onToggle}
            />

            {/* Video container */}
            <div className="relative flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-6xl">
                    {children}
                </div>
            </div>

            {/* Exit hint */}
            <div className="absolute top-4 right-4 text-white/50 text-sm flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">ESC</kbd>
                <span>to exit theater mode</span>
            </div>

            {/* Exit button */}
            <button
                onClick={onToggle}
                className="absolute top-4 left-4 p-2 text-white/50 hover:text-white transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

/**
 * Theater Mode Toggle Button
 */
export function TheaterModeButton({
    isActive,
    onClick
}: {
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="p-2 text-white/80 hover:text-white transition-colors group"
            title={isActive ? 'Exit theater mode (T)' : 'Theater mode (T)'}
        >
            {isActive ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
            )}
        </button>
    );
}
