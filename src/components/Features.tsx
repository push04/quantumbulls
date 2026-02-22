"use client";

import { useState } from "react";
import Link from "next/link";
import Icon, { IconName } from "@/components/ui/Icon";

interface Feature {
    title: string;
    description: string;
    icon: IconName;
}

export default function Features() {
    const [features] = useState<Feature[]>([
        {
            title: "Expert-Led Courses",
            description: "Learn from professional traders with years of market experience. Structured curriculum from basics to advanced strategies.",
            icon: "graduation",
        },
        {
            title: "Daily Market Analysis",
            description: "Get real-time market insights, trading setups, and technical analysis delivered to your dashboard every morning.",
            icon: "trending",
        },
        {
            title: "Active Trading Community",
            description: "Connect with thousands of traders. Share ideas, discuss strategies, and grow together in our forums.",
            icon: "users",
        },
        {
            title: "Live Trading Sessions",
            description: "Watch expert traders in action. Ask questions live and learn market psychology in real-time.",
            icon: "video",
        },
        {
            title: "Risk Management Tools",
            description: "Protect your capital with proven risk management strategies and position sizing calculators.",
            icon: "shield",
        },
        {
            title: "Verified Success Stories",
            description: "See real results from our students. Transform your trading journey like thousands of others have.",
            icon: "award",
        },
    ]);

    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Why Choose <span className="text-[#2EBD59]">Quantum Bull</span>
                    </h2>
                    <p className="text-lg text-gray-500">
                        Everything you need to become a consistently profitable trader. No fluff, just practical education that works.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-6 lg:p-8 border border-gray-100 hover:border-[#2EBD59]/30 hover:shadow-lg transition-all duration-300 group"
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-lg bg-[#2EBD59]/10 flex items-center justify-center mb-4 group-hover:bg-[#2EBD59] transition-colors">
                                <Icon name={feature.icon} size={24} className="text-[#2EBD59] group-hover:text-white transition-colors" />
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-500 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#2EBD59] hover:bg-[#26a34d] text-white font-semibold rounded-lg transition-colors"
                    >
                        View All Courses
                        <Icon name="arrow-right" size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
