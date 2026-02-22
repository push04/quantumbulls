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
    { name: "Settings", href: "/admin/settings", icon: "settings" },
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
                                <Icon name={item.icon} size={20} className={isActive ? "text-[#2EBD59]" : "text-gray-400"} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    System Online
                </div>
            </div>
        </aside>
    );
}
