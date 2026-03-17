"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "superadmin") throw new Error("Forbidden");
    return { supabase, user };
}

export async function createAnalysis(formData: FormData) {
    const { supabase, user } = await requireAdmin().catch(() => {
        redirect("/signin");
        return { supabase: null as never, user: null as never };
    });

    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const content = formData.get("content") as string;
    const image_url = formData.get("image_url") as string;
    const is_premium = formData.get("is_premium") === "on";

    if (!title) return { error: "Title is required" };
    if (!content) return { error: "Content is required" };

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
    const { supabase } = await requireAdmin().catch(() => { redirect("/signin"); return { supabase: null as never, user: null as never }; });

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
    const { supabase } = await requireAdmin().catch(() => { redirect("/signin"); return { supabase: null as never, user: null as never }; });

    const { error } = await supabase.from("market_analysis").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/analysis");
    revalidatePath("/analysis");
    return { success: true };
}
