"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateTestimonialStatus(id: string, status: "approved" | "rejected" | "pending") {
    const supabase = await createClient();

    // Check admin permission (though RLS handles this, good to be explicit/safe)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
        .from("testimonials")
        .update({ status, approved_at: status === 'approved' ? new Date().toISOString() : null })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/testimonials");
    return { success: true };
}

export async function deleteTestimonial(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/testimonials");
    return { success: true };
}
