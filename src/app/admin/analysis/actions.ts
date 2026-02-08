"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAnalysis(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const content = formData.get("content") as string;
    const image_url = formData.get("image_url") as string;
    const is_premium = formData.get("is_premium") === "on";

    if (!title) return { error: "Title is required" };
    if (!content) return { error: "Content is required" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase.from("market_analysis").insert({
        title,
        summary,
        content,
        image_url,
        is_premium,
        author_id: user.id,
        published_at: new Date().toISOString(),
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/analysis");
    revalidatePath("/analysis");
    redirect("/admin/analysis");
}

export async function updateAnalysis(id: string, formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const content = formData.get("content") as string;
    const image_url = formData.get("image_url") as string;
    const is_premium = formData.get("is_premium") === "on";

    const { error } = await supabase.from("market_analysis").update({
        title,
        summary,
        content,
        image_url,
        is_premium,
    }).eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/analysis");
    revalidatePath("/analysis");
    redirect("/admin/analysis");
}

export async function deleteAnalysis(id: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("market_analysis").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/analysis");
    revalidatePath("/analysis");
    return { success: true };
}
