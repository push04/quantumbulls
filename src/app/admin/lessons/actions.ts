"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLesson(formData: FormData) {
    const supabase = await createClient();

    const course_id = formData.get("course_id") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const video_url = formData.get("video_url") as string;
    const order_index = parseInt(formData.get("order_index") as string) || 0;
    const is_free_preview = formData.get("is_free_preview") === "on";

    if (!title || !course_id) return { error: "Title and Course ID are required" };

    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const { error } = await supabase.from("lessons").insert({
        course_id,
        title,
        slug,
        content,
        video_url,
        order_index,
        is_free_preview,
    });

    if (error) return { error: error.message };

    revalidatePath(`/admin/courses/${course_id}`);
    revalidatePath("/courses");
    return { success: true };
}

export async function updateLesson(id: string, formData: FormData) {
    const supabase = await createClient();

    const course_id = formData.get("course_id") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const video_url = formData.get("video_url") as string;
    const order_index = parseInt(formData.get("order_index") as string) || 0;
    const is_free_preview = formData.get("is_free_preview") === "on";

    const { error } = await supabase.from("lessons").update({
        title,
        content,
        video_url,
        order_index,
        is_free_preview,
    }).eq("id", id);

    if (error) return { error: error.message };

    revalidatePath(`/admin/courses/${course_id}`);
    revalidatePath("/courses");
    return { success: true };
}

export async function deleteLesson(id: string, course_id: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("lessons").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath(`/admin/courses/${course_id}`);
    revalidatePath("/courses");
    return { success: true };
}
