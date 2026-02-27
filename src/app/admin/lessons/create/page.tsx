import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CreateLessonPage() {
    const supabase = await createClient();
    const { data: courses } = await supabase.from("courses").select("id, title").order("title");

    async function createLesson(formData: FormData) {
        "use server";
        const supabase = await createClient();

        const course_id = formData.get("course_id") as string;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const video_url = formData.get("video_url") as string;
        const duration = parseInt(formData.get("duration") as string) || 0;
        const order_index = parseInt(formData.get("order_index") as string) || 0;
        const is_preview = formData.get("is_preview") === "on";

        if (!course_id || !title) {
            throw new Error("Course and title are required");
        }

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

        const { error } = await supabase.from("lessons").insert({
            course_id,
            title,
            slug,
            description,
            video_url,
            duration,
            order_index,
            is_preview,
        });

        if (error) {
            console.error("Error creating lesson:", error);
            throw new Error(error.message);
        }

        redirect("/admin/lessons");
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create Lesson</h1>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <form action={createLesson} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course *
                        </label>
                        <select
                            name="course_id"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                        >
                            <option value="">Select a course</option>
                            {courses?.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lesson Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                            placeholder="e.g., Introduction to Candlesticks"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                            placeholder="What will students learn in this lesson?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video URL
                        </label>
                        <input
                            type="url"
                            name="video_url"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                name="duration"
                                min={0}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Order Index
                            </label>
                            <input
                                type="number"
                                name="order_index"
                                defaultValue={0}
                                min={0}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="is_preview"
                            id="is_preview"
                            className="w-4 h-4 rounded border-gray-300 text-[#2EBD59] focus:ring-[#2EBD59]"
                        />
                        <label htmlFor="is_preview" className="text-sm text-gray-700">
                            Available as free preview (non-subscribers can watch)
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#2EBD59] text-white rounded-lg hover:bg-[#26a34d] transition-colors"
                        >
                            Create Lesson
                        </button>
                        <a
                            href="/admin/lessons"
                            className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
