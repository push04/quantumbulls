import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/payment/razorpay";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { amount, currency = "INR", description, metadata = {} } = body;

        if (!amount) {
            return NextResponse.json({ error: "Amount is required" }, { status: 400 });
        }

        // Initialize Razorpay
        const { instance, keyId } = await getRazorpayClient();

        // Create Order
        // Amount should be in paise (100 paise = 1 INR)
        // If the input 'amount' is in INR, multiply by 100. 
        // We'll assume input is in INR for simplicity of API usage, 
        // OR we enforce input to be in smallest unit. 
        // Let's assume input is in INR and convert here to be safe and standard.
        // Wait, standard for APIs often expects smallest unit, but let's be developer friendly.
        // NO, standard practice: explicitly document. I will receive amount in INR.

        const amountInPaise = Math.round(Number(amount) * 100);

        const options = {
            amount: amountInPaise,
            currency,
            receipt: `receipt_${Date.now()}_${user.id.substring(0, 5)}`,
            notes: {
                user_id: user.id,
                description: description || "Payment",
                ...metadata
            }
        };

        const order = await instance.orders.create(options);

        // Record pending order in DB
        const { error: dbError } = await supabase.from("payment_orders").insert({
            user_id: user.id,
            amount: amountInPaise,
            currency,
            razorpay_order_id: order.id,
            status: "created",
            description,
            metadata
        });

        if (dbError) {
            console.error("Database Error logging order:", dbError);
            // We still return the order to the client, but logging failed. 
            // Ideally we should fail, but payment is critical.
        }

        return NextResponse.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: keyId, // Send public key to client
        });

    } catch (error: any) {
        console.error("Payment API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
