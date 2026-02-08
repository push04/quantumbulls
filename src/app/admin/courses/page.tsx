import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { deleteCourse } from "./actions";

export default async function AdminCoursesPage() {
    const supabase = await createClient();
    const { data: courses } = await supabase.from("courses").select("*").order("order_index", { ascending: true });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
                <Link
                    href="/admin/courses/create"
                    className="px-4 py-2 bg-[#2EBD59] text-white rounded-lg hover:bg-[#26a34d] transition-colors flex items-center gap-2"
                >
                    <span>+</span> Add Course
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Order</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Tier</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {!courses || courses.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No courses found.
                                </td>
                            </tr>
                        ) : (
                            courses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 text-sm text-gray-500 w-20">#{course.order_index}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{course.title}</div>
                                        <div className="text-xs text-gray-500 capitalize">{course.difficulty}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.tier === 'free' ? 'bg-gray-100 text-gray-700' :
                                            course.tier === 'pro' ? 'bg-green-100 text-green-700' :
                                                'bg-purple-100 text-purple-700'
                                            }`}>
                                            {course.tier?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-flex items-center gap-1 ${course.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                            <span className={`w-2 h-2 rounded-full ${course.is_active ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                            {course.is_active ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/courses/${course.id}`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit & Manage Lessons"
                                            >
                                                ✏️
                                            </Link>
                                            <form action={async () => {
                                                "use server";
                                                await deleteCourse(course.id);
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
