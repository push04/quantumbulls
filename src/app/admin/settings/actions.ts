"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSetting(key: string, value: string) {
    const supabase = await createClient();

    // Auth check implied by RLS, but explicit check good practice
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

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
