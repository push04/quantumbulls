"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "qb_cookie_consent";

/**
 * Cookie Consent Banner
 * GDPR-compliant cookie consent with remember functionality
 */
export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Check if consent was already given
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) {
            // Show banner after slight delay for better UX
            setTimeout(() => setVisible(true), 1000);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
            accepted: true,
            timestamp: new Date().toISOString(),
            essential: true,
            analytics: true,
            marketing: false,
        }));
        setVisible(false);
    };

    const acceptEssentialOnly = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
            accepted: true,
            timestamp: new Date().toISOString(),
            essential: true,
            analytics: false,
            marketing: false,
        }));
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-slide-up">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🍪</span>
                            <h3 className="font-semibold text-gray-900">Cookie Preferences</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            We use cookies to improve your experience and analyze usage.
                            By clicking &quot;Accept All&quot;, you consent to our use of cookies.{" "}
                            <Link href="/privacy" className="text-[#2EBD59] hover:underline">
                                Learn more
                            </Link>
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={acceptEssentialOnly}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Essential Only
                        </button>
                        <button
                            onClick={acceptCookies}
                            className="px-6 py-2 text-sm font-medium text-white bg-[#2EBD59] rounded-lg hover:bg-[#26a34d] transition-colors"
                        >
                            Accept All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Check if user has consented to a specific cookie type
 */
export function hasConsent(type: "essential" | "analytics" | "marketing"): boolean {
    if (typeof window === "undefined") return false;

    try {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (!consent) return false;

        const parsed = JSON.parse(consent);
        return parsed[type] === true;
    } catch {
        return false;
    }
}

/**
 * Clear cookie consent (for testing or user request)
 */
export function clearConsent(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(COOKIE_CONSENT_KEY);
}

// Add to global CSS:
// @keyframes slide-up {
//   from { transform: translateY(100%); opacity: 0; }
//   to { transform: translateY(0); opacity: 1; }
// }
// .animate-slide-up { animation: slide-up 0.3s ease-out; }
