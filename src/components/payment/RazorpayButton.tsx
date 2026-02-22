"use client";

import { useState } from "react";
import Script from "next/script";

interface RazorpayButtonProps {
    amount: number; // in INR
    currency?: string;
    description?: string;
    metadata?: Record<string, string>;
    onSuccess?: (paymentId: string, orderId: string, signature: string) => void;
    onError?: (error: Error | unknown) => void;
    className?: string;
    children?: React.ReactNode;
}

export default function RazorpayButton({
    amount,
    currency = "INR",
    description = "Payment",
    metadata = {},
    onSuccess,
    onError,
    className,
    children
}: RazorpayButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);

        try {
            // 1. Create Order
            const response = await fetch("/api/payment/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, currency, description, metadata }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create order");
            }

            const { order_id, key_id, amount: orderAmount, currency: orderCurrency } = data;

            // 2. Open Razorpay Checkout
            const options = {
                key: key_id,
                amount: orderAmount,
                currency: orderCurrency,
                name: "Quantum Bull",
                description: description,
                order_id: order_id,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                handler: function (response: any) {
                    // Success callback
                    if (onSuccess) {
                        onSuccess(
                            response.razorpay_payment_id,
                            response.razorpay_order_id,
                            response.razorpay_signature
                        );
                    }
                },
                prefill: {
                    // prefill user detials if available (optional, can be passed via props)
                    // email: userEmail
                },
                theme: {
                    color: "#2EBD59",
                },
                modal: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ondismiss: function () {
                        setIsLoading(false);
                    }
                }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rzp = new (window as any).Razorpay(options);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rzp.on("payment.failed", function (response: any) {
                if (onError) onError(response.error);
                setIsLoading(false);
            });
            rzp.open();

        } catch (error) {
            console.error("Payment Error:", error);
            if (onError) onError(error);
            setIsLoading(false);
        }
    };

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <button
                onClick={handlePayment}
                disabled={isLoading}
                className={className || "px-6 py-2 bg-[#2EBD59] text-white rounded-lg hover:bg-[#26a34d] transition-colors disabled:opacity-50 font-medium"}
            >
                {isLoading ? "Processing..." : children || `Pay ₹${amount}`}
            </button>
        </>
    );
}
