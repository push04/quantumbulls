"use client";

import Link from "next/link";

interface PathCardProps {
    id: string;
    slug: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedHours?: number;
    lessonsCount: number;
    isEnrolled?: boolean;
    completedLessons?: number;
}

const DIFFICULTY_COLORS = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
};

/**
 * Learning Path Card
 */
export default function PathCard({
    id,
    slug,
    title,
    description,
    thumbnail_url,
    difficulty,
    estimatedHours,
    lessonsCount,
    isEnrolled = false,
    completedLessons = 0,
}: PathCardProps) {
    const progressPercent = lessonsCount > 0
        ? Math.round((completedLessons / lessonsCount) * 100)
        : 0;
    const isCompleted = progressPercent === 100;

    return (
        <Link
            href={`/paths/${slug}`}
            className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
        >
            {/* Thumbnail / Header */}
            <div className="relative h-40 bg-gradient-to-br from-[#2EBD59]/20 to-emerald-100">
                {thumbnail_url ? (
                    <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${thumbnail_url})` }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-[#2EBD59]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    </div>
                )}

                {/* Enrolled badge */}
                {isEnrolled && !isCompleted && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-[#2EBD59] text-white text-xs font-medium rounded-lg">
                        Enrolled
                    </div>
                )}

                {/* Completed badge */}
                {isCompleted && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-[#2EBD59] text-white text-xs font-medium rounded-lg flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        Completed
                    </div>
                )}

                {/* Path icon */}
                <div className="absolute bottom-0 left-4 transform translate-y-1/2">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-lg flex items-center justify-center">
                        <svg className="w-7 h-7 text-[#2EBD59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 pt-10">
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#2EBD59] transition-colors line-clamp-2">
                    {title}
                </h3>

                {description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                    <span className={`px-2 py-1 rounded-md font-medium ${DIFFICULTY_COLORS[difficulty]}`}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{lessonsCount} lessons</span>
                    {estimatedHours && (
                        <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">{estimatedHours}h total</span>
                        </>
                    )}
                </div>

                {/* Progress bar (if enrolled) */}
                {isEnrolled && (
                    <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">
                                {completedLessons} of {lessonsCount} completed
                            </span>
                            <span className="font-medium text-[#2EBD59]">{progressPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#2EBD59] rounded-full transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* CTA for non-enrolled */}
                {!isEnrolled && (
                    <div className="mt-2 text-sm text-[#2EBD59] font-medium group-hover:underline">
                        Start this path →
                    </div>
                )}
            </div>
        </Link>
    );
}
