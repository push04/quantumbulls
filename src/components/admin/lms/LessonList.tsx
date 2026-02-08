"use client";

import { useState } from "react";
import LessonForm from "./LessonForm";
import { deleteLesson } from "@/app/admin/lessons/actions";

interface LessonListProps {
    courseId: string;
    initialLessons: any[];
}

export default function LessonList({ courseId, initialLessons }: LessonListProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<any | null>(null);

    // InitialLessons are from server, but we rely on revalidatePath to update the page passed props?
    // Actually, in a client component, props update when parent re-renders (which happens on revalidatePath).
    // So distinct state for lessons isn't strictly needed if we trust the re-render.
    // But for optimistic updates, it's better. For now, we'll simpler approach: rely on server refresh.

    const handleEdit = (lesson: any) => {
        setEditingLesson(lesson);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingLesson(null);
        setIsFormOpen(true);
    };

    const handleClose = () => {
        setIsFormOpen(false);
        setEditingLesson(null);
    };

    return (
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm mt-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Course Lessons</h2>
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
                >
                    + Add Lesson
                </button>
            </div>

            {(!initialLessons || initialLessons.length === 0) ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No lessons added yet. Click &quot;Add Lesson&quot; to get started.
                </div>
            ) : (
                <div className="space-y-3">
                    {initialLessons.map((lesson: any) => (
                        <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 group hover:border-[#2EBD59]/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-xs font-bold text-gray-500 border border-gray-200">
                                    {lesson.order_index}
                                </span>
                                <div>
                                    <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                                    <p className="text-xs text-gray-400">
                                        {lesson.video_url ? "Video Content" : "Text Only"} • {lesson.is_free_preview ? "Free Preview" : "Locked"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(lesson)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                                <form action={async () => {
                                    await deleteLesson(lesson.id, courseId);
                                }}>
                                    <button
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isFormOpen && (
                <LessonForm
                    courseId={courseId}
                    lessonHelper={editingLesson}
                    onClose={handleClose}
                />
            )}
        </div>
    );
}
