"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { IconName } from "@/components/ui/Icon";

const menuItems: { name: string; href: string; icon: IconName }[] = [
    { name: "Dashboard", href: "/admin", icon: "dashboard" },
    { name: "Users", href: "/admin/users", icon: "users" },
    { name: "Courses", href: "/admin/courses", icon: "book" },
    { name: "News", href: "/admin/news", icon: "file" },
    { name: "Analysis", href: "/admin/analysis", icon: "trending" },
    { name: "Testimonials", href: "/admin/testimonials", icon: "star" },
    { name: "Orders", href: "/admin/orders", icon: "card" },
    { name: "Security", href: "/admin/security", icon: "shield" },
    { name: "Settings", href: "/admin/settings", icon: "settings" },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-slate-100 min-h-screen fixed top-0 left-0 pt-0 hidden md:block z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="h-20 flex items-center px-6 border-b border-slate-50">
                <Link href="/" className="flex items-center gap-2.5">
                    <img src="/logo.svg" alt="Quantum Bull" className="h-9 w-auto" />
                    <span className="font-bold text-lg tracking-tight text-slate-900">QUANTUM <span className="text-emerald-500">BULL</span></span>
                </Link>
            </div>

            <div className="px-4 py-6">
                <h2 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Admin Console</h2>
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <Icon name={item.icon} size={20} className={isActive ? "text-emerald-600" : "text-slate-400"} />
                                {item.name}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="absolute bottom-0 w-full p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-500 bg-slate-50 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-medium">System Online</span>
                </div>
            </div>
        </aside>
    );
}
