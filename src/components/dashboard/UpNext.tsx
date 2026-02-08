"use client";

import Link from "next/link";

interface Lesson {
    id: string;
    title: string;
    thumbnail_url: string;
    duration_seconds: number;
    isCompleted?: boolean;
    isLocked?: boolean;
}

interface UpNextProps {
    lessons: Lesson[];
    currentCourseTitle?: string;
}

/**
 * Up Next recommendations section
 */
export default function UpNext({ lessons, currentCourseTitle }: UpNextProps) {
    if (lessons.length === 0) {
        return null;
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins} min`;
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900">Up Next</h3>
                    {currentCourseTitle && (
                        <p className="text-sm text-gray-500">Continue with {currentCourseTitle}</p>
                    )}
                </div>
                <Link
                    href="/courses"
                    className="text-sm text-[#2EBD59] hover:text-[#26a34d] font-medium"
                >
                    View All →
                </Link>
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lessons.slice(0, 4).map((lesson, index) => (
                    <Link
                        key={lesson.id}
                        href={lesson.isLocked ? '#' : `/lesson/${lesson.id}`}
                        className={`group relative rounded-xl overflow-hidden bg-white border border-gray-200 hover:shadow-md transition-shadow ${lesson.isLocked ? 'cursor-not-allowed opacity-70' : ''
                            }`}
                    >
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-gray-100">
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${lesson.thumbnail_url || '/placeholder-video.jpg'})` }}
                            />

                            {/* Duration badge */}
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                                {formatDuration(lesson.duration_seconds)}
                            </div>

                            {/* Up next badge for first item */}
                            {index === 0 && !lesson.isCompleted && !lesson.isLocked && (
                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#2EBD59] text-white text-xs font-medium rounded">
                                    Up Next
                                </div>
                            )}

                            {/* Completed checkmark */}
                            {lesson.isCompleted && (
                                <div className="absolute top-2 left-2 w-6 h-6 bg-[#2EBD59] rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}

                            {/* Lock overlay */}
                            {lesson.isLocked && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            )}

                            {/* Hover play button */}
                            {!lesson.isLocked && !lesson.isCompleted && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[#2EBD59] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <div className="p-3">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                {lesson.title}
                            </h4>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
