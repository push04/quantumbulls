"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSetting(key: string, value: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "superadmin") return { error: "Forbidden" };

    const { error } = await supabase.from("system_settings").update({
        value,
        updated_at: new Date().toISOString(),
        updated_by: user.id
    }).eq("key", key);

    if (error) return { error: error.message };

    revalidatePath("/admin/settings");
    revalidatePath("/"); // Might affect global layout
    return { success: true };
}
