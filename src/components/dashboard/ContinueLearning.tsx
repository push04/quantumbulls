"use client";

import Link from "next/link";
import { formatDuration } from "@/lib/learning/progressCalculator";

interface ContinueLearningProps {
    lesson: {
        id: string;
        title: string;
        thumbnail_url: string;
        course_title: string;
    } | null;
    progressSeconds: number;
    durationSeconds: number;
}

/**
 * Continue Learning card with last watched video
 */
export default function ContinueLearning({
    lesson,
    progressSeconds,
    durationSeconds
}: ContinueLearningProps) {
    if (!lesson) {
        return (
            <div className="bg-gradient-to-br from-[#2EBD59]/5 to-emerald-50 rounded-2xl p-6 border border-[#2EBD59]/10">
                <h3 className="font-semibold text-gray-900 mb-3">Start Learning</h3>
                <p className="text-gray-600 text-sm mb-4">
                    Begin your trading education journey today!
                </p>
                <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#2EBD59] hover:bg-[#26a34d] text-white font-medium rounded-xl transition-colors"
                >
                    Browse Courses
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        );
    }

    const progressPercent = durationSeconds > 0
        ? Math.round((progressSeconds / durationSeconds) * 100)
        : 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row">
                {/* Thumbnail */}
                <Link
                    href={`/lesson/${lesson.id}`}
                    className="relative md:w-64 aspect-video md:aspect-auto flex-shrink-0 group"
                >
                    <div
                        className="w-full h-full bg-gray-200 bg-cover bg-center"
                        style={{ backgroundImage: `url(${lesson.thumbnail_url || '/placeholder-video.jpg'})` }}
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                            <svg className="w-6 h-6 text-[#2EBD59] ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                        <div
                            className="h-full bg-[#2EBD59]"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </Link>

                {/* Content */}
                <div className="flex-1 p-5">
                    <div className="text-xs font-medium text-[#2EBD59] mb-1">
                        Continue Learning
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        {lesson.course_title}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Resume at <span className="font-medium">{formatDuration(progressSeconds)}</span>
                        </div>
                        <Link
                            href={`/lesson/${lesson.id}?t=${progressSeconds}`}
                            className="px-4 py-2 bg-[#2EBD59] hover:bg-[#26a34d] text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Resume
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
