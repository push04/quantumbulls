"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createNews(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const source = formData.get("source") as string;
    const url = formData.get("url") as string;

    // Basic validation
    if (!title) return { error: "Title is required" };

    const { error } = await supabase.from("market_news").insert({
        title,
        summary,
        source,
        url,
        published_at: new Date().toISOString(),
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/news");
    revalidatePath("/news"); // Update public page
    redirect("/admin/news");
}

export async function updateNews(id: string, formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const source = formData.get("source") as string;
    const url = formData.get("url") as string;

    const { error } = await supabase.from("market_news").update({
        title,
        summary,
        source,
        url,
    }).eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/news");
    revalidatePath("/news");
    redirect("/admin/news");
}

export async function deleteNews(id: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("market_news").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/news");
    revalidatePath("/news");
    return { success: true };
}
