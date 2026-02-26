"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SessionGuard from "@/components/SessionGuard";
import Icon from "@/components/ui/Icon";
import type { User } from "@supabase/supabase-js";

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
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
    const displayName = profile?.full_name || profile?.username || user.email?.split('@')[0] || "Trader";

    const tierConfig = {
        basic: {
            gradient: "from-slate-600 to-slate-800",
            badge: "bg-slate-100 text-slate-600",
            label: "Basic Member"
        },
        medium: {
            gradient: "from-emerald-500 to-green-600",
            badge: "bg-emerald-100 text-emerald-700",
            label: "Pro Trader"
        },
        advanced: {
            gradient: "from-violet-600 to-indigo-700",
            badge: "bg-violet-100 text-violet-700",
            label: "Elite Member"
        }
    };

    const tier = tierConfig[currentTier as keyof typeof tierConfig];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <SessionGuard userId={user.id}>
            <div className="min-h-screen bg-slate-50">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <aside
                    className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 lg:hidden shadow-2xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
                >
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/logo.svg" alt="Quantum Bull" className="h-8 w-auto" />
                            <span className="font-bold text-lg tracking-tight text-slate-900">QUANTUM <span className="text-emerald-500">BULL</span></span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                            <Icon name="close" size={20} />
                        </button>
                    </div>
                    <nav className="p-4 space-y-1">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-semibold">
                            <Icon name="dashboard" size={20} /> Dashboard
                        </Link>
                        <Link href="/dashboard/courses" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium">
                            <Icon name="book" size={20} /> My Courses
                        </Link>
                        <Link href="/dashboard/progress" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium">
                            <Icon name="target" size={20} /> Progress
                        </Link>
                        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium">
                            <Icon name="settings" size={20} /> Settings
                        </Link>
                        <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-600 hover:bg-slate-50 rounded-xl font-medium">
                            <Icon name="logout" size={20} /> Sign Out
                        </button>
                    </nav>
                </aside>

                <div className="transition-all duration-300">
                    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <Icon name="menu" size={24} />
                                </button>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
                                    <p className="text-xs text-slate-500 hidden sm:block">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                                    <Icon name="bell" size={20} />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>

                                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-semibold text-slate-900 leading-none">{displayName}</p>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tier.badge} mt-1 inline-block`}>{tier.label}</span>
                                    </div>
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20`}>
                                        {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="p-6 max-w-7xl mx-auto space-y-8">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
                            <div className="absolute inset-0 opacity-30">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3"></div>
                            </div>
                            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 md:p-10">
                                <div className="max-w-xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-4">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Market Live
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                                        {getGreeting()}, {displayName.split(' ')[0]}! Ready to trade?
                                    </h2>
                                    <p className="text-slate-300 text-base leading-relaxed">
                                        Continue your learning journey and master the markets with our expert-led courses.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                                    <Link href="/dashboard/courses" className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2">
                                        <Icon name="play" size={18} />
                                        Resume Learning
                                    </Link>
                                    <Link href="/analysis" className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-white/10 flex items-center justify-center gap-2">
                                        <Icon name="trending" size={18} />
                                        Market Analysis
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Courses Enrolled", value: "0", icon: "book" as const, color: "blue", bg: "bg-blue-50", iconBg: "bg-blue-100" },
                                { label: "Lessons Completed", value: "0", icon: "check" as const, color: "emerald", bg: "bg-emerald-50", iconBg: "bg-emerald-100" },
                                { label: "Total Watch Time", value: "0h", icon: "clock" as const, color: "violet", bg: "bg-violet-50", iconBg: "bg-violet-100" },
                                { label: "Certificates", value: "0", icon: "award" as const, color: "amber", bg: "bg-amber-50", iconBg: "bg-amber-100" },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                                            <Icon name={stat.icon} size={22} className={`text-${stat.color}-600`} />
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{stat.label}</p>
                                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900">Continue Learning</h3>
                                    <Link href="/dashboard/courses" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View All →</Link>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
                                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                        <Icon name="graduation" size={36} className="text-emerald-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-2">No active courses yet</h4>
                                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">Start your trading journey today with our expert-led masterclasses.</p>
                                    <Link href="/dashboard/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-semibold">
                                        <Icon name="search" size={18} />
                                        Explore Courses
                                    </Link>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[50px] opacity-10"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                                <Icon name="users" size={24} className="text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Trader&apos;s Hub</h3>
                                                <p className="text-violet-200 text-xs font-medium">500+ traders online</p>
                                            </div>
                                        </div>
                                        <p className="text-violet-100 text-sm mb-5">Connect with fellow traders and share insights.</p>
                                        <Link href="/community" className="flex items-center justify-center gap-2 w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold text-sm transition-all">
                                            Join Community
                                            <Icon name="arrow-right" size={16} />
                                        </Link>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </div>
                                        <h3 className="font-bold text-slate-900">Live Sessions</h3>
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Next Session</p>
                                            <span className="text-xs text-slate-400">Tomorrow</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-sm">Market Open Strategy</h4>
                                        <p className="text-xs text-slate-500 mt-1">9:00 AM IST</p>
                                    </div>

                                    <Link href="/dashboard/live" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                                        View Schedule
                                        <Icon name="arrow-right" size={16} />
                                    </Link>
                                </div>

                                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-[40px] opacity-10"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                                <Icon name="crown" size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm">Upgrade to Pro</h3>
                                                <p className="text-emerald-100 text-[10px]">Unlock all features</p>
                                            </div>
                                        </div>
                                        <Link href="/pricing" className="block w-full py-2.5 bg-white text-emerald-600 rounded-lg text-center font-bold text-sm hover:bg-emerald-50 transition-colors">
                                            View Plans
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </SessionGuard>
    );
}
