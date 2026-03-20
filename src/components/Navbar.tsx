"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Icon from "@/components/ui/Icon";
import type { User } from "@supabase/supabase-js";

interface Profile {
    full_name: string | null;
    username: string | null;
}

interface DropdownItem {
    name: string;
    href: string;
    description?: string;
}

interface NavItemConfig {
    name: string;
    href: string;
    dropdown?: DropdownItem[];
}

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
    const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name, username")
                    .eq("id", user.id)
                    .single();
                setProfile(profile);
            }
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session?.user) {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        router.refresh();
    };

    const handleMouseEnter = (name: string) => {
        if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
        setActiveDropdown(name);
    };

    const handleMouseLeave = () => {
        dropdownTimeout.current = setTimeout(() => {
            setActiveDropdown(null);
        }, 120);
    };

    const navItems: NavItemConfig[] = [
        { name: "Home", href: "/" },
        { name: "News", href: "/news" },
        { name: "Analysis", href: "/analysis" },
        {
            name: "Courses",
            href: "/courses",
            dropdown: [
                { name: "All Courses", href: "/courses", description: "Browse all trading courses" },
                { name: "Careers", href: "/careers", description: "Join our team" },
            ],
        },
        { name: "Calendar", href: "/calendar" },
        {
            name: "Community",
            href: "/community",
            dropdown: [
                { name: "Community", href: "/community", description: "Connect with traders" },
                { name: "Market News", href: "/news", description: "Latest market updates" },
            ],
        },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-slate-200/50' : 'shadow-sm'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24 sm:h-28">
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                        <Image src="/logo.svg" alt="Quantum Bull" width={160} height={48} className="h-12 sm:h-14 w-auto" priority />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) =>
                            item.dropdown ? (
                                <div
                                    key={item.name}
                                    className="relative"
                                    onMouseEnter={() => handleMouseEnter(item.name)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <Link
                                        href={item.href}
                                        className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-xl transition-all ${activeDropdown === item.name
                                            ? 'text-emerald-600 bg-emerald-50'
                                            : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                                            }`}
                                    >
                                        {item.name}
                                        <svg
                                            className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180 text-emerald-600' : ''}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </Link>

                                    {/* Dropdown Panel */}
                                    <div
                                        className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 ${activeDropdown === item.name
                                            ? 'opacity-100 translate-y-0 pointer-events-auto'
                                            : 'opacity-0 -translate-y-2 pointer-events-none'
                                            }`}
                                        onMouseEnter={() => handleMouseEnter(item.name)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div className="py-1.5">
                                            {item.dropdown.map((sub) => (
                                                <Link
                                                    key={sub.href}
                                                    href={sub.href}
                                                    onClick={() => setActiveDropdown(null)}
                                                    className="flex flex-col px-4 py-3 hover:bg-emerald-50 transition-colors group"
                                                >
                                                    <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                                                        {sub.name}
                                                    </span>
                                                    {sub.description && (
                                                        <span className="text-xs text-slate-400 mt-0.5">{sub.description}</span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                >
                                    {item.name}
                                </Link>
                            )
                        )}
                    </div>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                    {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                                </div>
                                {profile?.full_name || profile?.username || user.email?.split('@')[0]}
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/signin"
                                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        className="md:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <Icon name={isMenuOpen ? "close" : "menu"} size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white">
                    <div className="px-4 py-4 space-y-1">
                        {navItems.map((item) =>
                            item.dropdown ? (
                                <div key={item.name}>
                                    <button
                                        onClick={() => setMobileExpanded(mobileExpanded === item.name ? null : item.name)}
                                        className="flex items-center justify-between w-full px-4 py-3 text-slate-700 font-semibold hover:bg-slate-50 rounded-xl"
                                    >
                                        <span>{item.name}</span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${mobileExpanded === item.name ? 'rotate-180' : ''}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {mobileExpanded === item.name && (
                                        <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-emerald-100 pl-3">
                                            {item.dropdown.map((sub) => (
                                                <Link
                                                    key={sub.href}
                                                    href={sub.href}
                                                    className="block px-3 py-2.5 text-slate-600 font-medium hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm"
                                                    onClick={() => { setIsMenuOpen(false); setMobileExpanded(null); }}
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block px-4 py-3 text-slate-700 font-semibold hover:bg-slate-50 rounded-xl"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            )
                        )}
                        <div className="pt-4 border-t border-slate-100 space-y-2">
                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-3 px-4 py-3 text-slate-700 font-semibold hover:bg-slate-50 rounded-xl"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                            {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                                        </div>
                                        {profile?.full_name || profile?.username || user.email?.split('@')[0]}
                                    </Link>
                                    <button
                                        onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-slate-700 font-semibold hover:bg-slate-50 rounded-xl"
                                    >
                                        <Icon name="logout" size={20} />
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/signin"
                                        className="block px-4 py-3 text-slate-700 font-semibold text-center hover:bg-slate-50 rounded-xl"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/signup"
                                        className="block px-4 py-3 bg-emerald-500 text-white font-semibold text-center rounded-xl"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
