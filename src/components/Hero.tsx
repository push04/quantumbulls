"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Hero({ stats }: { stats?: { courses: number; traders: number; success_rate: number } }) {
    const [count1, setCount1] = useState(0);
    const [count2, setCount2] = useState(0);
    const [count3, setCount3] = useState(0);

    // Default values if stats are not provided (fallback or loading state)
    const targetStats = stats || { courses: 0, traders: 0, success_rate: 0 };

    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCount1(Math.floor(targetStats.courses * easeOut));
            setCount2(Math.floor(targetStats.traders * easeOut));
            setCount3(Math.floor(targetStats.success_rate * easeOut));

            if (step >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
            {/* Animated floating shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large morphing blob */}
                <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-[#2EBD59]/20 via-emerald-300/15 to-teal-200/20 animate-morph animate-pulse-glow" />

                {/* Floating circles */}
                <div className="absolute top-20 left-[10%] w-16 h-16 rounded-full bg-[#2EBD59]/10 animate-float" style={{ animationDelay: '0s' }} />
                <div className="absolute top-[60%] left-[5%] w-24 h-24 rounded-full bg-emerald-200/30 animate-float-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute top-[30%] right-[15%] w-20 h-20 rounded-full bg-teal-200/20 animate-float-reverse" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-[20%] right-[10%] w-12 h-12 rounded-full bg-[#2EBD59]/15 animate-float" style={{ animationDelay: '1.5s' }} />

                {/* Floating lines/bars */}
                <div className="absolute top-[40%] left-[20%] w-32 h-1 bg-gradient-to-r from-transparent via-[#2EBD59]/30 to-transparent rounded-full animate-float-slow" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-[35%] right-[25%] w-24 h-1 bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent rounded-full animate-float" style={{ animationDelay: '1.2s' }} />

                {/* Small dots */}
                <div className="absolute top-[15%] right-[30%] w-3 h-3 rounded-full bg-[#2EBD59]/40 animate-float" style={{ animationDelay: '0.3s' }} />
                <div className="absolute top-[70%] left-[25%] w-2 h-2 rounded-full bg-[#2EBD59]/50 animate-float-reverse" style={{ animationDelay: '0.8s' }} />
                <div className="absolute top-[45%] left-[8%] w-4 h-4 rounded-full bg-emerald-400/30 animate-float-slow" style={{ animationDelay: '1.8s' }} />

                {/* Gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* Main content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <div className="text-center">
                    {/* Trust badge with shimmer effect */}
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-[#2EBD59]/20 mb-10 animate-fade-in hover-lift">
                        <div className="relative w-2 h-2">
                            <div className="absolute inset-0 bg-[#2EBD59] rounded-full" />
                            <div className="absolute inset-0 bg-[#2EBD59] rounded-full animate-ping opacity-75" />
                        </div>
                        <span className="text-sm font-medium text-[#2EBD59]">
                            Trusted by 10,000+ Traders
                        </span>
                    </div>

                    {/* Main headline with gradient text */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 animate-fade-in stagger-1">
                        <span className="text-gray-900">Master the Art of</span>
                        <br />
                        <span className="gradient-text">
                            Trading Excellence
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in stagger-2">
                        Learn proven strategies from expert traders. Build wealth with our
                        comprehensive curriculum and daily market insights.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in stagger-3">
                        <Link
                            href="/courses"
                            className="group w-full sm:w-auto px-8 py-4 bg-[#2EBD59] hover:bg-[#26a34d] text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-[#2EBD59]/30 hover:-translate-y-1 text-center"
                        >
                            <span className="flex items-center justify-center gap-2 text-lg">
                                Start Learning Free
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </span>
                        </Link>

                        <Link
                            href="/analysis"
                            className="w-full sm:w-auto px-8 py-4 text-gray-700 font-semibold rounded-2xl glass border border-gray-200 hover:border-[#2EBD59]/30 hover:bg-white/80 transition-all duration-300 text-center hover:-translate-y-1"
                        >
                            View Daily Analysis
                        </Link>
                    </div>

                    {/* Stats with glass effect */}
                    <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto animate-fade-in stagger-4">
                        <div className="p-5 md:p-6 rounded-2xl glass border border-gray-100 hover-lift group">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 group-hover:gradient-text transition-colors">
                                {count1}+
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 font-medium">Courses</div>
                        </div>

                        <div className="p-5 md:p-6 rounded-2xl glass border border-gray-100 hover-lift group">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 group-hover:gradient-text transition-colors">
                                {count2.toLocaleString()}+
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 font-medium">Traders</div>
                        </div>

                        <div className="p-5 md:p-6 rounded-2xl glass border border-gray-100 hover-lift group">
                            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 group-hover:gradient-text transition-colors">
                                {count3}%
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 font-medium">Success</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animated scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-fade-in stagger-5">
                <span className="text-xs text-gray-400 font-medium">Scroll to explore</span>
                <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex justify-center pt-2">
                    <div className="w-1 h-3 bg-[#2EBD59] rounded-full animate-bounce" />
                </div>
            </div>
        </section>
    );
}
