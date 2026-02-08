"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Courses", href: "/courses" },
        { name: "Analysis", href: "/analysis" },
        { name: "Pricing", href: "/pricing" },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${isScrolled
                ? "border-b border-gray-100 shadow-sm"
                : ""
                }`}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-28 md:h-36">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <img
                            src="/logo.svg"
                            alt="Quantum Bull"
                            className="h-20 md:h-32 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons - Desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            href="/signin"
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="px-5 py-2.5 bg-[#2EBD59] hover:bg-[#26a34d] text-white rounded-lg font-semibold text-sm transition-all hover:shadow-lg hover:shadow-[#2EBD59]/25"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-700"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu - Full screen overlay */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 top-16 bg-white z-50">
                    <div className="px-4 py-6 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block px-4 py-4 text-gray-800 hover:bg-gray-50 rounded-lg font-medium text-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="pt-6 border-t border-gray-100 space-y-3">
                            <Link
                                href="/signin"
                                className="block text-center py-4 text-gray-700 font-medium text-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="block text-center py-4 bg-[#2EBD59] text-white rounded-xl font-semibold text-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Get Started Free
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
