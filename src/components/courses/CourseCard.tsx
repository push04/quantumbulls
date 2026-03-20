"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface CourseCardProps {
    id: string;
    title: string;
    slug: string;
    description?: string;
    thumbnail_url?: string;
    tier: 'free' | 'basic' | 'medium' | 'pro';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    totalLessons: number;
    completedLessons: number;
    estimatedHours?: number;
    isLocked?: boolean;
    userTier?: string;
}

const TIER_COLORS = {
    free: 'bg-gray-100 text-gray-700',
    basic: 'bg-blue-100 text-blue-700',
    medium: 'bg-purple-100 text-purple-700',
    pro: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700',
};

const DIFFICULTY_COLORS = {
    beginner: 'text-green-600',
    intermediate: 'text-yellow-600',
    advanced: 'text-red-600',
};

// Branded gradient fallback colors per tier
const TIER_GRADIENTS = {
    free: 'from-slate-400 to-slate-600',
    basic: 'from-blue-400 to-blue-600',
    medium: 'from-purple-400 to-purple-600',
    pro: 'from-amber-400 to-orange-500',
};

/**
 * Course Card with progress bar and reliable image/fallback rendering
 */
export default function CourseCard({
    id,
    title,
    slug,
    description,
    thumbnail_url,
    tier,
    difficulty,
    totalLessons,
    completedLessons,
    estimatedHours,
    isLocked = false,
    userTier,
}: CourseCardProps) {
    const [imgError, setImgError] = useState(false);

    const progressPercent = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
    const isCompleted = progressPercent === 100;
    const isStarted = completedLessons > 0;

    const showImage = !!thumbnail_url && !imgError;

    return (
        <Link
            href={isLocked ? '#' : `/courses/${slug}`}
            className={`group relative bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all ${isLocked
                    ? 'cursor-not-allowed'
                    : 'hover:shadow-lg hover:border-gray-300'
                }`}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-100">
                {showImage ? (
                    <Image
                        src={thumbnail_url!}
                        alt={title}
                        fill
                        className="object-cover"
                        onError={() => setImgError(true)}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    /* Branded gradient fallback — never shows a broken image */
                    <div className={`w-full h-full bg-gradient-to-br ${TIER_GRADIENTS[tier]} flex flex-col items-center justify-center gap-2`}>
                        <svg className="w-10 h-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-white/60 text-xs font-medium">Course</span>
                    </div>
                )}

                {/* Tier badge */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold ${TIER_COLORS[tier]}`}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </div>

                {/* Completed badge */}
                {isCompleted && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-[#2EBD59] rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}

                {/* Lock overlay */}
                {isLocked && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4">
                        <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-sm font-medium">Upgrade to {tier}</span>
                        <span className="text-xs text-white/70 mt-1">to unlock this course</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#2EBD59] transition-colors">
                    {title}
                </h3>

                {/* Description */}
                {description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Meta info */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className={`font-medium ${DIFFICULTY_COLORS[difficulty]}`}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </span>
                    <span>•</span>
                    <span>{totalLessons} lessons</span>
                    {estimatedHours && (
                        <>
                            <span>•</span>
                            <span>{estimatedHours}h</span>
                        </>
                    )}
                </div>

                {/* Progress bar */}
                {!isLocked && (
                    <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">
                                {isStarted
                                    ? `${completedLessons} of ${totalLessons} completed`
                                    : 'Not started'
                                }
                            </span>
                            {isStarted && (
                                <span className="font-medium text-[#2EBD59]">{progressPercent}%</span>
                            )}
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${isCompleted ? 'bg-[#2EBD59]' : 'bg-[#2EBD59]/70'
                                    }`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}
