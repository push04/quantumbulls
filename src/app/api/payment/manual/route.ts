import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { plan_name, tier, price, interval } = body;

        // Create Manual Order
        const { data: order, error } = await supabase.from("payment_orders").insert({
            user_id: user.id,
            amount: price * 100, // stored in paise
            currency: "INR",
            status: "manual_verification_pending",
            description: `Manual Request for ${plan_name}`,
            metadata: {
                action: 'subscription_update',
                tier,
                interval,
                type: 'manual_request'
            }
        }).select().single();

        if (error) {
            console.error("Database Error logging manuals order:", error);
            return NextResponse.json({ error: "Failed to create request" }, { status: 500 });
        }

        return NextResponse.json({ success: true, order_id: order.id });

    } catch (error: any) {
        console.error("Manual Payment API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
