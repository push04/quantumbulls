"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCourse(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const thumbnail_url = formData.get("thumbnail_url") as string;
    const difficulty = formData.get("difficulty") as string;
    const tier = formData.get("tier") as string;
    const is_active = formData.get("is_active") === "on";
    const order_index = parseInt(formData.get("order_index") as string) || 0;

    if (!title) return { error: "Title is required" };

    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const { error } = await supabase.from("courses").insert({
        title,
        slug,
        description,
        thumbnail_url,
        difficulty,
        tier,
        is_active,
        order_index,
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    redirect("/admin/courses");
}

export async function updateCourse(id: string, formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const thumbnail_url = formData.get("thumbnail_url") as string;
    const difficulty = formData.get("difficulty") as string;
    const tier = formData.get("tier") as string;
    const is_active = formData.get("is_active") === "on";
    const order_index = parseInt(formData.get("order_index") as string) || 0;

    const { error } = await supabase.from("courses").update({
        title,
        description,
        thumbnail_url,
        difficulty,
        tier,
        is_active,
        order_index,
    }).eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    redirect("/admin/courses");
}

export async function deleteCourse(id: string) {
    const supabase = await createClient();

    // Note: cascade delete might be needed on DB side for lessons, or handle here
    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    return { success: true };
}
