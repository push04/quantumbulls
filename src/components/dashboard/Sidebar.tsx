"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "My Learning", href: "/dashboard/progress", icon: "🎯" },
    { name: "All Courses", href: "/dashboard/courses", icon: "📚" },
    { name: "Live Sessions", href: "/dashboard/live", icon: "🔴" },
    { name: "Community", href: "/community", icon: "💬" },
    { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-72 bg-white border-r border-gray-100 h-screen fixed top-0 left-0 pt-0 hidden lg:flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="h-24 flex items-center px-8 border-b border-gray-50">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo.svg" alt="Quantum Bull" className="h-10 w-auto" />
                    <span className="font-bold text-lg tracking-tight text-gray-900">QUANTUM <span className="text-[#2EBD59]">BULL</span></span>
                </Link>
            </div>

            <div className="flex-1 px-4 py-8 overflow-y-auto">
                <div className="mb-8">
                    <h2 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Menu</h2>
                    <nav className="space-y-1.5">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                        ? "bg-[#2EBD59] text-white shadow-lg shadow-[#2EBD59]/20"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <span className={`text-lg transition-transform group-hover:scale-110 ${!isActive && "grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"}`}>{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 pb-8">
                <div className="rounded-2xl bg-[#0B0F19] p-5 text-center relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#2EBD59] rounded-full blur-[50px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-[#2EBD59]/20 rounded-xl flex items-center justify-center text-xl shadow-inner shadow-[#2EBD59]/10">
                                👑
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold text-sm leading-tight">Go Pro</h3>
                                <p className="text-gray-400 text-[10px] uppercase tracking-wider font-medium">Unlock Analysis</p>
                            </div>
                        </div>
                        <Link
                            href="/pricing"
                            className="block w-full py-2.5 bg-[#2EBD59] hover:bg-[#26a34d] text-white rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all shadow-lg shadow-[#2EBD59]/20 hover:shadow-[#2EBD59]/40 hover:-translate-y-0.5"
                        >
                            Upgrade Now
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    );
}
