"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function Hero({ stats }: { stats?: { courses: number; traders: number; success_rate: number } }) {
    const [count1, setCount1] = useState(0);
    const [count2, setCount2] = useState(0);
    const [count3, setCount3] = useState(0);

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
        <section className="relative bg-white overflow-hidden">
            {/* Clean background with subtle pattern */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(#2EBD59_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03]" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#2EBD59]/5 to-transparent" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full mb-6 lg:mb-8">
                            <span className="w-2 h-2 rounded-full bg-[#2EBD59] animate-pulse" />
                            <span className="text-sm font-medium text-gray-600">India&apos;s #1 Trading Education Platform</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-4 lg:mb-6">
                            Master Trading
                            <span className="block text-[#2EBD59]">With Precision</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg text-gray-500 mb-8 lg:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Join thousands of traders who transformed their trading journey with expert-led courses, real-time market analysis, and a thriving community.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                            <Link
                                href="/courses"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2EBD59] hover:bg-[#26a34d] text-white font-semibold rounded-lg transition-all duration-200 active:scale-95"
                            >
                                <Icon name="play" size={18} />
                                Explore Courses
                            </Link>
                            <Link
                                href="/community"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 hover:border-[#2EBD59] text-gray-700 hover:text-[#2EBD59] font-medium rounded-lg transition-all duration-200"
                            >
                                <Icon name="users" size={18} />
                                Join Community
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Icon name="check-circle" size={16} className="text-[#2EBD59]" />
                                <span>{targetStats.courses}+ Video Lessons</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon name="check-circle" size={16} className="text-[#2EBD59]" />
                                <span>{targetStats.traders.toLocaleString()}+ Active Traders</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Visual */}
                    <div className="relative hidden lg:block">
                        <div className="relative">
                            {/* Main card */}
                            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#2EBD59]/10 flex items-center justify-center">
                                            <Icon name="trending" size={20} className="text-[#2EBD59]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Live Analysis</h3>
                                            <p className="text-xs text-gray-500">Updated Daily</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Live</span>
                                </div>

                                {/* Chart placeholder */}
                                <div className="h-32 bg-gray-50 rounded-lg mb-4 flex items-end justify-between px-4 pb-2">
                                    {[40, 65, 45, 70, 55, 80, 60, 75, 85, 70, 90, 95].map((height, i) => (
                                        <div
                                            key={i}
                                            className="w-4 bg-[#2EBD59]/20 rounded-t"
                                            style={{ height: `${height}%` }}
                                        />
                                    ))}
                                </div>

                                {/* Market info */}
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-400">NIFTY 50</p>
                                        <p className="font-semibold text-green-600">+1.25%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">SENSEX</p>
                                        <p className="font-semibold text-green-600">+0.89%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">USD/INR</p>
                                        <p className="font-semibold text-red-600">-0.12%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating cards */}
                            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 animate-float">
                                <div className="flex items-center gap-2">
                                    <Icon name="award" size={16} className="text-amber-500" />
                                    <span className="text-sm font-medium text-gray-700">{targetStats.success_rate}% Success Rate</span>
                                </div>
                            </div>

                            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 p-3 animate-float-reverse">
                                <div className="flex items-center gap-2">
                                    <Icon name="users" size={16} className="text-[#2EBD59]" />
                                    <span className="text-sm font-medium text-gray-700">{targetStats.traders.toLocaleString()}+ Members</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-gray-100">
                    <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{count1}+</div>
                        <div className="text-sm text-gray-500">Courses</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{count2.toLocaleString()}+</div>
                        <div className="text-sm text-gray-500">Active Traders</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{count3}%</div>
                        <div className="text-sm text-gray-500">Success Rate</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
