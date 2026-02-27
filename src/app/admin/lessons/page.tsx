import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { deleteLesson } from "./actions";

export default async function AdminLessonsPage() {
    const supabase = await createClient();
    const { data: lessons } = await supabase
        .from("lessons")
        .select("*, course:courses(title)")
        .order("order_index", { ascending: true });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Manage Lessons</h1>
                <Link
                    href="/admin/lessons/create"
                    className="px-4 py-2 bg-[#2EBD59] text-white rounded-lg hover:bg-[#26a34d] transition-colors flex items-center gap-2"
                >
                    <span>+</span> New Lesson
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Lesson</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Course</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Order</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Preview</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {!lessons || lessons.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No lessons found.
                                </td>
                            </tr>
                        ) : (
                            lessons.map((lesson) => (
                                <tr key={lesson.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{lesson.title}</div>
                                        <div className="text-xs text-gray-500">{lesson.slug}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {lesson.course?.title || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        #{lesson.order_index}
                                    </td>
                                    <td className="px-6 py-4">
                                        {lesson.is_preview ? (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">Yes</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">No</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/lessons/${lesson.id}`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                ✏️
                                            </Link>
                                            <form action={async () => {
                                                "use server";
                                                await deleteLesson(lesson.id, lesson.course_id);
                                            }}>
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
