"use client";

import Link from "next/link";

interface Lesson {
    id: string;
    title: string;
    thumbnail_url?: string;
    duration_seconds: number;
    course_title?: string;
}

interface RelatedContentProps {
    lessons: Lesson[];
    title?: string;
}

/**
 * Related Content / Also Watched section
 */
export default function RelatedContent({ lessons, title = "Students also watched" }: RelatedContentProps) {
    if (lessons.length === 0) return null;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins} min`;
    };

    return (
        <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lessons.slice(0, 4).map((lesson) => (
                    <Link
                        key={lesson.id}
                        href={`/lesson/${lesson.id}`}
                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-gray-100">
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${lesson.thumbnail_url || '/placeholder-video.jpg'})` }}
                            />

                            {/* Duration */}
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                                {formatDuration(lesson.duration_seconds)}
                            </div>

                            {/* Play hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#2EBD59] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-3">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#2EBD59] transition-colors">
                                {lesson.title}
                            </h4>
                            {lesson.course_title && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                    {lesson.course_title}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
