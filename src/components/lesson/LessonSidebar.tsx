"use client";

import Link from "next/link";
import { formatDuration } from "@/lib/learning/progressCalculator";

interface Lesson {
    id: string;
    title: string;
    duration_seconds: number;
    order_index: number;
    isCompleted?: boolean;
    isLocked?: boolean;
    isCurrent?: boolean;
}

interface LessonSidebarProps {
    lessons: Lesson[];
    courseTitle: string;
    courseSlug: string;
    currentLessonId?: string;
}

/**
 * Lesson Sidebar with checkmarks
 */
export default function LessonSidebar({
    lessons,
    courseTitle,
    courseSlug,
    currentLessonId
}: LessonSidebarProps) {
    const completedCount = lessons.filter(l => l.isCompleted).length;
    const totalCount = lessons.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <Link
                    href={`/courses/${courseSlug}`}
                    className="text-sm text-[#2EBD59] hover:underline mb-1 block"
                >
                    ← Back to course
                </Link>
                <h2 className="font-semibold text-gray-900 line-clamp-2">{courseTitle}</h2>

                {/* Progress */}
                <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">{completedCount} of {totalCount} completed</span>
                        <span className="font-medium text-[#2EBD59]">{progressPercent}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                        <div
                            className="h-full bg-[#2EBD59] rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Lessons List */}
            <div className="flex-1 overflow-y-auto">
                <div className="py-2">
                    {lessons.map((lesson) => {
                        const isCurrent = lesson.id === currentLessonId;

                        return (
                            <Link
                                key={lesson.id}
                                href={lesson.isLocked ? '#' : `/lesson/${lesson.id}`}
                                className={`flex items-start gap-3 px-4 py-3 transition-colors ${isCurrent
                                        ? 'bg-[#2EBD59]/10 border-l-2 border-[#2EBD59]'
                                        : lesson.isLocked
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-gray-50'
                                    }`}
                            >
                                {/* Status indicator */}
                                <div className="flex-shrink-0 mt-0.5">
                                    {lesson.isCompleted ? (
                                        <div className="w-5 h-5 rounded-full bg-[#2EBD59] flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    ) : lesson.isLocked ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    ) : isCurrent ? (
                                        <div className="w-5 h-5 rounded-full bg-[#2EBD59] flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm line-clamp-2 ${isCurrent ? 'font-medium text-gray-900' : 'text-gray-700'
                                        }`}>
                                        {lesson.order_index + 1}. {lesson.title}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        {formatDuration(lesson.duration_seconds)}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
