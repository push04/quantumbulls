"use client";

import { useEffect, useState } from "react";
import RazorpayButton from "./RazorpayButton";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PlanPaymentButtonProps {
    plan: {
        name: string;
        price: number;
        tier: string;
        interval?: string;
    };
    user: { id: string; email?: string } | null;
    className?: string;
    children?: React.ReactNode;
}

export default function PlanPaymentButton({ plan, user, className, children }: PlanPaymentButtonProps) {
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(false);
    const [isRazorpayEnabled, setIsRazorpayEnabled] = useState(true);
    const [isCheckingConfig, setIsCheckingConfig] = useState(true);

    useEffect(() => {
        const checkConfig = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('system_settings')
                .select('value')
                .eq('key', 'razorpay_enabled')
                .single();

            if (data && data.value === 'false') {
                setIsRazorpayEnabled(false);
            }
            setIsCheckingConfig(false);
        };
        checkConfig();
    }, []);

    if (!user) {
        return (
            <button
                onClick={() => router.push("/signup")}
                className={className || "block w-full text-center px-4 py-2 rounded-lg transition-colors bg-[#2EBD59] text-white hover:bg-[#26a34d]"}
            >
                Start Now
            </button>
        );
    }

    if (plan.price === 0) {
        return (
            <button
                onClick={() => router.push("/dashboard")}
                className={className || "block w-full text-center px-4 py-2 rounded-lg transition-colors border border-[#2EBD59] text-[#2EBD59] hover:bg-green-50"}
            >
                {children || "Get Started Free"}
            </button>
        );
    }

    const handleSuccess = async (paymentId: string, orderId: string, signature: string) => {
        setIsVerifying(true);
        try {
            const response = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    razorpay_payment_id: paymentId,
                    razorpay_order_id: orderId,
                    razorpay_signature: signature,
                }),
            });

            const data = await response.json();
            if (data.success) {
                if (plan.tier === 'mentor') {
                    router.push("/dashboard?upgrade=success&tier=mentor");
                } else {
                    router.push("/dashboard?upgrade=success");
                }
                router.refresh();
            } else {
                alert("Payment verification failed. Please contact support.");
            }
        } catch (error) {
            console.error("Verification error:", error);
            alert("An error occurred during verification.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleManualRequest = async () => {
        setIsVerifying(true);
        try {
            const response = await fetch("/api/payment/manual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan_name: plan.name,
                    tier: plan.tier,
                    price: plan.price,
                    interval: plan.interval
                }),
            });

            if (response.ok) {
                alert("Order placed successfully! We will contact you shortly to complete the payment.");
                router.push("/dashboard?order=manual_pending");
            } else {
                throw new Error("Failed to place order");
            }
        } catch (error) {
            console.error("Manual order error:", error);
            alert("Could not place manual request. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    if (isCheckingConfig) {
        return <button className={className + " opacity-50 cursor-wait"}>Loading...</button>;
    }

    if (!isRazorpayEnabled) {
        return (
            <button
                onClick={handleManualRequest}
                disabled={isVerifying}
                className={className || "block w-full text-center px-4 py-2 rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700"}
            >
                {isVerifying ? "Processing..." : "Request Access"}
            </button>
        );
    }

    return (
        <RazorpayButton
            amount={plan.price}
            description={`Subscription: ${plan.name}`}
            metadata={{
                action: 'subscription_update',
                tier: plan.tier,
                interval: plan.interval || 'month'
            }}
            onSuccess={handleSuccess}
            className={className}
        >
            {isVerifying ? "Verifying..." : children || "Subscribe Now"}
        </RazorpayButton>
    );
}
