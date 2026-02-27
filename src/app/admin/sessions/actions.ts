"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSession(formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const scheduled_at = formData.get("scheduled_at") as string;
    const duration_minutes = parseInt(formData.get("duration_minutes") as string) || 60;
    const tier_restriction = formData.get("tier_restriction") as string;

    if (!title || !scheduled_at) return { error: "Title and schedule are required" };

    const { error } = await supabase.from("live_sessions").insert({
        title,
        description,
        scheduled_at,
        duration_minutes,
        tier_restriction,
        status: 'scheduled',
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/sessions");
    redirect("/admin/sessions");
}

export async function updateSession(id: string, formData: FormData) {
    const supabase = await createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const scheduled_at = formData.get("scheduled_at") as string;
    const duration_minutes = parseInt(formData.get("duration_minutes") as string) || 60;
    const tier_restriction = formData.get("tier_restriction") as string;
    const status = formData.get("status") as string;

    const { error } = await supabase.from("live_sessions").update({
        title,
        description,
        scheduled_at,
        duration_minutes,
        tier_restriction,
        status,
    }).eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/sessions");
    redirect("/admin/sessions");
}

export async function deleteSession(id: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("live_sessions").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/sessions");
    return { success: true };
}

export async function startSession(id: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("live_sessions").update({
        status: 'live',
    }).eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/sessions");
    return { success: true };
}

export async function endSession(id: string) {
    const supabase = await createClient();

    const { error } = await supabase.from("live_sessions").update({
        status: 'ended',
    }).eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/sessions");
    return { success: true };
}
