"use client";

import Link from "next/link";
import PlanPaymentButton from "@/components/payment/PlanPaymentButton";
import Icon from "@/components/ui/Icon";

interface Plan {
    name: string;
    price: number;
    interval?: string;
    features?: string[];
    cta_text?: string;
    is_popular?: boolean;
    tier: string;
}

interface User {
    id: string;
    email?: string;
}

export default function CoursePreview({ plans, user }: { plans?: Plan[], user?: User | null }) {
    if (!plans || plans.length === 0) return null;

    const tiers = plans.map(plan => ({
        name: plan.name,
        price: plan.price === 0 ? "Free" : `Rs.${plan.price}`,
        period: plan.interval === 'lifetime' ? 'forever' : `/${plan.interval}`,
        description: plan.name === 'Basic' ? "Perfect for beginners" : plan.name.includes('Pro') ? "For serious traders" : "Personal mentorship",
        features: plan.features || [],
        cta: plan.cta_text || (plan.price === 0 ? "Start Free" : "Get Started"),
        popular: plan.is_popular,
        originalPlan: plan,
    }));

    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12 lg:mb-16">
                    <span className="inline-block text-sm font-semibold text-[#2EBD59] uppercase tracking-wider mb-3">Pricing Plans</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        Choose the plan that fits your trading journey. Upgrade or downgrade anytime.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
                    {tiers.map((tier, index) => (
                        <div
                            key={tier.name}
                            className={`relative bg-white rounded-xl border ${tier.popular ? 'border-[#2EBD59] shadow-lg shadow-[#2EBD59]/10' : 'border-gray-200'} overflow-hidden`}
                        >
                            {/* Popular Badge */}
                            {tier.popular && (
                                <div className="absolute top-0 left-0 right-0">
                                    <div className="bg-[#2EBD59] text-white text-center py-1.5 text-sm font-medium">
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            {/* Card Content */}
                            <div className={`p-6 lg:p-8 ${tier.popular ? 'pt-10' : ''}`}>
                                {/* Plan Name */}
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {tier.name}
                                </h3>
                                <p className="text-gray-500 text-sm mb-4">
                                    {tier.description}
                                </p>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-3xl lg:text-4xl font-bold text-gray-900">{tier.price}</span>
                                    <span className="text-gray-500">{tier.period}</span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {tier.features.length > 0 ? tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <Icon name="check" size={16} className="text-[#2EBD59] flex-shrink-0 mt-0.5" />
                                            {feature}
                                        </li>
                                    )) : (
                                        <>
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <Icon name="check" size={16} className="text-[#2EBD59] flex-shrink-0 mt-0.5" />
                                                Access to all courses
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <Icon name="check" size={16} className="text-[#2EBD59] flex-shrink-0 mt-0.5" />
                                                Daily market analysis
                                            </li>
                                            <li className="flex items-start gap-2 text-sm text-gray-600">
                                                <Icon name="check" size={16} className="text-[#2EBD59] flex-shrink-0 mt-0.5" />
                                                Community access
                                            </li>
                                        </>
                                    )}
                                </ul>

                                {/* CTA Button */}
                                <PlanPaymentButton
                                    plan={tier.originalPlan}
                                    user={user ?? null}
                                    className={`w-full py-3 font-semibold rounded-lg text-center transition-all active:scale-95 ${
                                        tier.popular
                                            ? 'bg-[#2EBD59] hover:bg-[#26a34d] text-white'
                                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                                    }`}
                                >
                                    {tier.cta}
                                </PlanPaymentButton>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Note */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    30-day money-back guarantee. No questions asked.
                </p>
            </div>
        </section>
    );
}
