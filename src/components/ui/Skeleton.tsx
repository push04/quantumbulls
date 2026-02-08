"use client";

import { ReactNode } from "react";

interface SkeletonProps {
    className?: string;
    children?: ReactNode;
    style?: React.CSSProperties;
}

/**
 * Base Skeleton Loader
 */
export function Skeleton({ className = "", style }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gray-200 rounded ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
}

/**
 * Text Line Skeleton
 */
export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {[...Array(lines)].map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

/**
 * Card Skeleton
 */
export function SkeletonCard({ className = "" }: SkeletonProps) {
    return (
        <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
            <Skeleton className="w-full aspect-video mb-4" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
        </div>
    );
}

/**
 * Video Player Skeleton
 */
export function SkeletonVideo({ className = "" }: SkeletonProps) {
    return (
        <div className={`relative ${className}`}>
            <Skeleton className="w-full aspect-video" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gray-300 animate-pulse flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

/**
 * Table Row Skeleton
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
    return (
        <tr>
            {[...Array(columns)].map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

/**
 * Avatar Skeleton
 */
export function SkeletonAvatar({ size = 40 }: { size?: number }) {
    return (
        <Skeleton
            className="rounded-full"
            style={{ width: size, height: size }}
        />
    );
}

/**
 * Button Skeleton
 */
export function SkeletonButton({ width = 100 }: { width?: number }) {
    return (
        <Skeleton
            className="h-10 rounded-lg"
            style={{ width }}
        />
    );
}

/**
 * Course Grid Skeleton
 */
export function SkeletonCourseGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(count)].map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

/**
 * Dashboard Stats Skeleton
 */
export function SkeletonStats({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                </div>
            ))}
        </div>
    );
}

/**
 * Lesson List Skeleton
 */
export function SkeletonLessonList({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full" />
                </div>
            ))}
        </div>
    );
}
