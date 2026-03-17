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

        const parsedAmount = Number(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            return NextResponse.json({ error: "A valid positive amount is required" }, { status: 400 });
        }
        // Guard against accidental overcharges — max 1,00,000 INR per order
        if (parsedAmount > 100000) {
            return NextResponse.json({ error: "Amount exceeds maximum allowed limit" }, { status: 400 });
        }

        // Initialize Razorpay
        const { instance, keyId } = await getRazorpayClient();

        // Amount received in INR, converted to paise (1 INR = 100 paise)
        const amountInPaise = Math.round(parsedAmount * 100);

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

    } catch (error) {
        console.error("Payment API Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}
