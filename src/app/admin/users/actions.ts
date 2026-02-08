"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: string) {
    const supabase = await createClient();

    // Security check: Only admins can perform this action (RLS should handle it, but good to be explicit if using Service Role, but here we use user client)
    // We rely on RLS policies on 'profiles' table.

    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);

    if (error) return { error: error.message };

    revalidatePath("/admin/users");
    return { success: true };
}

export async function deleteUser(userId: string) {
    // Deleting a user from auth.users requires Service Role. 
    // Deleting from public.profiles might be allowed but won't delete auth user.
    // For now, we'll just "Soft Delete" or Ban by changing role, as actual deletion is complex without Admin API.
    // Let's implement BAN as "role = banned"

    return updateUserRole(userId, "banned");
}
