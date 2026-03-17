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

export async function createNews(formData: FormData) {
    const { supabase } = await requireAdmin().catch(() => { redirect("/signin"); return { supabase: null as never, user: null as never }; });

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
    const { supabase } = await requireAdmin().catch(() => { redirect("/signin"); return { supabase: null as never, user: null as never }; });

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
    const { supabase } = await requireAdmin().catch(() => { redirect("/signin"); return { supabase: null as never, user: null as never }; });

    const { error } = await supabase.from("market_news").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/news");
    revalidatePath("/news");
    return { success: true };
}
