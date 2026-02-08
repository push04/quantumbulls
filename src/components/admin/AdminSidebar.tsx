"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Users", href: "/admin/users", icon: "👥" },
    { name: "Courses", href: "/admin/courses", icon: "📚" },
    { name: "News", href: "/admin/news", icon: "📰" },
    { name: "Analysis", href: "/admin/analysis", icon: "📈" },
    { name: "Testimonials", href: "/admin/testimonials", icon: "💬" },
    { name: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed top-0 left-0 pt-20 hidden md:block z-40">
            <div className="px-6 pb-6">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Admin Console</h2>
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? "bg-[#2EBD59]/10 text-[#2EBD59]"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    System Online
                </div>
            </div>
        </aside>
    );
}
