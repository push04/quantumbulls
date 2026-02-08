import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

export async function getRazorpayClient() {
    const supabase = await createClient();

    // Fetch settings from DB
    const { data: settings } = await supabase
        .from("system_settings")
        .select("key, value")
        .in("key", ["razorpay_key_id", "razorpay_key_secret"]);

    if (!settings) {
        throw new Error("Could not fetch payment settings");
    }

    const keyId = settings.find(s => s.key === "razorpay_key_id")?.value;
    const keySecret = settings.find(s => s.key === "razorpay_key_secret")?.value;

    if (!keyId || !keySecret || keyId === "rzp_test_placeholder") {
        throw new Error("Razorpay credentials not configured in Admin Settings");
    }

    return {
        instance: new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        }),
        keyId, // Return keyId separately as it's needed for the frontend
        keySecret
    };
}
