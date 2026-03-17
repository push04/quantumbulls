import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/payment/razorpay";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { keySecret } = await getRazorpayClient();

        // Verify Signature
        const generated_signature = crypto
            .createHmac("sha256", keySecret!)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Update Order Status
        const { data: order, error: orderError } = await supabase
            .from("payment_orders")
            .update({
                status: "paid",
                razorpay_payment_id,
                updated_at: new Date().toISOString()
            })
            .eq("razorpay_order_id", razorpay_order_id)
            .select("*")
            .single();

        if (orderError || !order) {
            console.error("Error updating order:", orderError);
            return NextResponse.json({ error: "Order not found or update failed" }, { status: 500 });
        }

        // 2. Fulfill Purchase based on Metadata
        const metadata = order.metadata || {};
        const userId = order.user_id;

        if (metadata.action === 'subscription_update' && metadata.tier) {
            // Update user role
            const { error: profileError } = await supabase
                .from("profiles")
                .update({ role: metadata.tier, updated_at: new Date().toISOString() })
                .eq("id", userId);

            if (profileError) {
                console.error("CRITICAL: Payment succeeded but profile role update failed for user", userId, profileError);
                // Mark the order as paid but with fulfillment_failed flag so admin can retry
                await supabase
                    .from("payment_orders")
                    .update({ status: "fulfillment_failed", updated_at: new Date().toISOString() })
                    .eq("razorpay_order_id", razorpay_order_id);
                return NextResponse.json(
                    { error: "Payment received but account upgrade failed. Please contact support with your order ID: " + razorpay_order_id },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true, verified: true });

    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
