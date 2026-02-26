"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Icon from "@/components/ui/Icon";
import type { User } from "@supabase/supabase-js";

interface Profile {
    full_name: string | null;
    username: string | null;
}

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
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

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Courses", href: "/courses" },
        { name: "Community", href: "/community" },
        { name: "Analysis", href: "/analysis" },
        { name: "Pricing", href: "/pricing" },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-slate-200/50' : 'shadow-sm'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20 sm:h-24">
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                        <img src="/logo.svg" alt="Quantum Bull" className="h-16 sm:h-20 w-auto" />
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

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

            {isMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white">
                    <div className="px-4 py-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block px-4 py-3 text-slate-700 font-semibold hover:bg-slate-50 rounded-xl"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
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
