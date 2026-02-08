"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SessionGuard from "@/components/SessionGuard";
import type { User } from "@supabase/supabase-js";

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    subscription_tier: "basic" | "medium" | "advanced";
    payment_status: string;
    enrolled_date: string;
}

interface DashboardClientProps {
    user: User;
    profile: Profile | null;
}

export default function DashboardClient({ user, profile }: DashboardClientProps) {
    const router = useRouter();
    const supabase = createClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSignOut = async () => {
        localStorage.removeItem("session_id");
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    const currentTier = profile?.subscription_tier || "basic";

    // Gradient definitions for tiers
    const tierGradients = {
        basic: "from-gray-700 to-gray-900",
        medium: "from-[#2EBD59] to-[#1a8f40]",
        advanced: "from-purple-600 to-indigo-700",
    };

    return (
        <SessionGuard userId={user.id}>
            <div className="min-h-screen bg-[#F8FAFC]">
                {/* Mobile sidebar backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Mobile Sidebar (Simplified for mobile, main sidebar is in layout/Sidebar.tsx for desktop) */}
                <aside
                    className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } shadow-2xl`}
                >
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="font-bold text-lg tracking-tight text-gray-900">QUANTUM <span className="text-[#2EBD59]">BULL</span></span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                            ✕
                        </button>
                    </div>
                    <nav className="p-4 space-y-2">
                        <Link href="/dashboard" className="block px-4 py-3 bg-[#2EBD59]/10 text-[#2EBD59] rounded-xl font-medium">Dashboard</Link>
                        <Link href="/dashboard/courses" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium">My Courses</Link>
                        <Link href="/dashboard/progress" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium">Progress</Link>
                        <Link href="/dashboard/settings" className="block px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium">Settings</Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="transition-all duration-300">
                    {/* Top Bar */}
                    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                </button>
                                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Dashboard</h1>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Notifications (Mock) */}
                                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                </button>

                                {/* User Dropdown */}
                                <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-bold text-gray-900 leading-none">{profile?.full_name || "Trader"}</p>
                                        <p className="text-xs text-gray-500 mt-1 capitalize">{currentTier} Member</p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tierGradients[currentTier]} flex items-center justify-center text-white font-bold shadow-md`}>
                                        {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="p-6 max-w-7xl mx-auto space-y-8">
                        {/* Welcome Banner */}
                        <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl p-8 md:p-10">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] to-[#1a1f2e] z-0"></div>
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2EBD59] rounded-full blur-[120px] opacity-10 translate-x-1/3 -translate-y-1/3"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="max-w-xl">
                                    <h2 className="text-3xl font-bold mb-2">
                                        Good Afternoon, {profile?.full_name?.split(" ")[0] || "Trader"}! 🚀
                                    </h2>
                                    <p className="text-gray-300 text-lg leading-relaxed">
                                        The market is moving. Ready to continue your masterclass?
                                    </p>
                                </div>
                                <div className="flex gap-3 shrink-0">
                                    <Link href="/dashboard/courses" className="px-6 py-3 bg-[#2EBD59] hover:bg-[#26a34d] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#2EBD59]/20 flex items-center gap-2">
                                        Resume Learning
                                    </Link>
                                    <Link href="/analysis" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl font-bold transition-all backdrop-blur-sm">
                                        Market Analysis
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Courses Enrolled", value: "0", icon: "📚", color: "text-blue-500", bg: "bg-blue-500/10" },
                                { label: "Lessons Completed", value: "0", icon: "✅", color: "text-[#2EBD59]", bg: "bg-[#2EBD59]/10" },
                                { label: "Watch Time", value: "0h", icon: "⏱️", color: "text-purple-500", bg: "bg-purple-500/10" },
                                { label: "Certificates", value: "0", icon: "🏆", color: "text-amber-500", bg: "bg-amber-500/10" },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center text-xl`}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">{stat.label}</p>
                                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Continue Learning Course Cards */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900">Continue Learning</h3>
                                    <Link href="/dashboard/courses" className="text-sm font-bold text-[#2EBD59] hover:underline">View All</Link>
                                </div>

                                {/* Placeholder for when no courses */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl opacity-50">
                                        🎓
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">No active courses</h4>
                                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Explore our catalog of premium trading courses and start your journey today.</p>
                                    <Link href="/dashboard/courses" className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-bold">
                                        Explore Catalog
                                    </Link>
                                </div>
                            </div>

                            {/* Sidebar Widgets (Community & Live) */}
                            <div className="space-y-6">
                                {/* Community Teaser */}
                                <div className="bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[50px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl bg-white/20 p-2 rounded-lg">💬</span>
                                            <div>
                                                <h3 className="font-bold text-lg leading-tight">Trader's Hub</h3>
                                                <p className="text-purple-200 text-xs">500+ Online</p>
                                            </div>
                                        </div>
                                        <p className="text-purple-100 text-sm mb-4">Join the discussion on market trends.</p>
                                        <Link href="/community" className="block w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-center font-bold text-sm transition-all border border-white/10">
                                            Join Chat
                                        </Link>
                                    </div>
                                </div>

                                {/* Live Session Teaser */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500 rounded-full blur-[40px] opacity-5"></div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </div>
                                        <h3 className="font-bold text-gray-900">Live Sessions</h3>
                                    </div>

                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 mb-4">
                                        <p className="text-[10px] font-bold text-[#2EBD59] mb-1 uppercase tracking-wider">Upcoming</p>
                                        <h4 className="font-bold text-gray-900 text-sm">Market Open Strategy</h4>
                                        <p className="text-xs text-gray-500 mt-1">Tomorrow, 9:00 AM</p>
                                    </div>

                                    <Link href="/dashboard/live" className="block w-full text-center py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors">
                                        View Schedule
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </SessionGuard>
    );
}
