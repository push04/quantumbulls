import { createClient } from "@/lib/supabase/server";
import CourseForm from "../CourseForm";
import LessonList from "@/components/admin/lms/LessonList";
import { notFound } from "next/navigation";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: course } = await supabase.from("courses").select("*").eq("id", id).single();

    if (!course) {
        notFound();
    }

    // Fetch lessons
    const { data: lessons } = await supabase.from("lessons").select("*").eq("course_id", id).order("order_index", { ascending: true });

    return (
        <div className="max-w-5xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Course</h1>
                <CourseForm courseHelper={course} isEditing={true} />
            </div>

            <LessonList courseId={id} initialLessons={lessons || []} />
        </div>
    );
}
