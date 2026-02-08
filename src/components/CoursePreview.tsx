"use client";

import Link from "next/link";
import PlanPaymentButton from "@/components/payment/PlanPaymentButton";

export default function CoursePreview({ plans, user }: { plans?: any[], user?: any }) {
    // Fallback if no plans provided
    if (!plans || plans.length === 0) return null;

    // Map DB plans to component format if needed, or use directly
    // Assuming plans come in sorted by price
    const tiers = plans.map(plan => ({
        name: plan.name,
        price: plan.price === 0 ? "Free" : `₹${plan.price}`,
        period: plan.interval === 'lifetime' ? 'forever' : `/${plan.interval}`,
        description: plan.name === 'Basic' ? "Perfect for beginners" : plan.name.includes('Pro') ? "For serious traders" : "Personal mentorship",
        features: plan.features || [],
        cta: plan.cta_text || (plan.price === 0 ? "Start Free" : "Get Started"),
        popular: plan.is_popular,
        gradient: plan.tier === 'free' ? "from-gray-100 to-gray-50" : plan.tier === 'pro' ? "from-[#2EBD59] to-emerald-600" : "from-gray-900 to-gray-800",
        originalPlan: plan,
    }));
    return (
        <section className="relative py-20 md:py-32 bg-white overflow-hidden">
            {/* Floating decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-4 h-4 rounded-full bg-[#2EBD59]/30 animate-float" style={{ animationDelay: '0s' }} />
                <div className="absolute top-40 right-20 w-6 h-6 rounded-full bg-emerald-200/40 animate-float-reverse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-40 left-20 w-5 h-5 rounded-full bg-teal-200/30 animate-float-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-20 right-40 w-3 h-3 rounded-full bg-[#2EBD59]/40 animate-float" style={{ animationDelay: '1.5s' }} />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
                {/* Section header */}
                <div className="text-center mb-16">
                    <div className="inline-block mb-4">
                        <span className="text-sm font-semibold text-[#2EBD59] uppercase tracking-wider">Pricing</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5">
                        Choose Your <span className="gradient-text">Trading Path</span>
                    </h2>
                    <p className="text-gray-600 max-w-lg mx-auto text-lg">
                        Start free and upgrade when you&apos;re ready. All plans include our money-back guarantee.
                    </p>
                </div>

                {/* Pricing cards */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                    {tiers.map((tier, index) => (
                        <div
                            key={tier.name}
                            className={`relative rounded-3xl transition-all duration-500 hover-lift ${tier.popular
                                ? "bg-gradient-to-br from-[#2EBD59] to-emerald-600 text-white md:-mt-6 md:mb-6 shadow-2xl shadow-[#2EBD59]/20"
                                : "bg-white border border-gray-200 hover:border-[#2EBD59]/30"
                                }`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Popular badge */}
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="px-4 py-1.5 bg-white text-[#2EBD59] text-xs font-bold rounded-full shadow-lg">
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            {/* Card content */}
                            <div className="p-8">
                                {/* Tier name & description */}
                                <h3 className={`text-xl font-bold mb-2 ${tier.popular ? "text-white" : "text-gray-900"}`}>
                                    {tier.name}
                                </h3>
                                <p className={`text-sm mb-6 ${tier.popular ? "text-white/80" : "text-gray-500"}`}>
                                    {tier.description}
                                </p>

                                {/* Price */}
                                <div className="mb-8">
                                    <span className={`text-4xl font-bold ${tier.popular ? "text-white" : "text-gray-900"}`}>
                                        {tier.price}
                                    </span>
                                    {tier.period !== "forever" && (
                                        <span className={tier.popular ? "text-white/70" : "text-gray-500"}>{tier.period}</span>
                                    )}
                                </div>

                                {/* CTA Button */}
                                {/* <Link
                                    href="/signup"
                                    className={`group block w-full py-3.5 rounded-xl font-semibold text-center transition-all mb-8 ${tier.popular
                                        ? "bg-white text-[#2EBD59] hover:bg-gray-50 hover:shadow-lg"
                                        : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg"
                                        }`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {tier.cta}
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </span>
                                </Link> */}
                                <PlanPaymentButton
                                    plan={tier.originalPlan}
                                    user={user}
                                    className={`group block w-full py-3.5 rounded-xl font-semibold text-center transition-all mb-8 ${tier.popular
                                        ? "bg-white text-[#2EBD59] hover:bg-gray-50 hover:shadow-lg"
                                        : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg"
                                        }`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {tier.cta}
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </span>
                                </PlanPaymentButton>

                                {/* Features list */}
                                <ul className="space-y-3">
                                    {tier.features.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <svg
                                                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.popular ? "text-white" : "text-[#2EBD59]"}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            <span className={`text-sm ${tier.popular ? "text-white/90" : "text-gray-600"}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust badges */}
                <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500">
                    <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
                        <svg className="w-5 h-5 text-[#2EBD59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-sm font-medium">Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
                        <svg className="w-5 h-5 text-[#2EBD59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-sm font-medium">30-Day Money Back</span>
                    </div>
                    <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
                        <svg className="w-5 h-5 text-[#2EBD59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-sm font-medium">Cancel Anytime</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
