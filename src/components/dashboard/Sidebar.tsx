"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";

const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" as const },
    { name: "My Learning", href: "/dashboard/progress", icon: "target" as const },
    { name: "All Courses", href: "/dashboard/courses", icon: "book" as const },
    { name: "Live Sessions", href: "/dashboard/live", icon: "video" as const },
    { name: "Community", href: "/community", icon: "users" as const },
    { name: "Settings", href: "/dashboard/settings", icon: "settings" as const },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-72 bg-white border-r border-slate-100 h-screen fixed top-0 left-0 pt-0 hidden lg:flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.03)]">
            <div className="h-20 flex items-center px-6 border-b border-slate-50">
                <Link href="/" className="flex items-center gap-2.5">
                    <img src="/logo.svg" alt="Quantum Bull" className="h-9 w-auto" />
                    <span className="font-bold text-lg tracking-tight text-slate-900">QUANTUM <span className="text-emerald-500">BULL</span></span>
                </Link>
            </div>

            <div className="flex-1 px-4 py-6 overflow-y-auto">
                <div className="mb-6">
                    <h2 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Menu</h2>
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                        ? "bg-emerald-50 text-emerald-700 shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    <Icon name={item.icon} size={20} className={isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500 transition-colors"} />
                                    {item.name}
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            <div className="p-4 border-t border-slate-100 pb-6">
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 bg-emerald-500/20 rounded-xl flex items-center justify-center shadow-inner shadow-emerald-500/10">
                                <Icon name="crown" size={22} className="text-emerald-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold text-sm leading-tight">Go Pro</h3>
                                <p className="text-slate-400 text-[10px] uppercase tracking-wider font-medium">Unlock Analysis</p>
                            </div>
                        </div>
                        <Link
                            href="/pricing"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                        >
                            Upgrade Now
                            <Icon name="arrow-right" size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    );
}
