"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveOrder(orderId: string, userId: string, metadata: Record<string, unknown>) {
    const supabase = await createClient();

    // 1. Update Order Status
    const { error: orderError } = await supabase
        .from("payment_orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("id", orderId);

    if (orderError) throw new Error("Failed to update order status");

    // 2. Update User Role if applicable
    if (metadata?.action === 'subscription_update' && metadata?.tier) {
        const { error: profileError } = await supabase
            .from("profiles")
            .update({ role: metadata.tier })
            .eq("id", userId);

        if (profileError) throw new Error("Failed to update user role");
    }

    revalidatePath("/admin/orders");
}

export async function rejectOrder(orderId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("payment_orders")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", orderId);

    if (error) throw new Error("Failed to reject order");
    revalidatePath("/admin/orders");
}
