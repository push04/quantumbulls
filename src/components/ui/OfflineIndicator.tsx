"use client";

import { useEffect, useState } from "react";

/**
 * Offline Indicator Component
 * Shows banner when user loses connection
 */
export default function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check initial state
        setIsOffline(!navigator.onLine);

        const handleOnline = () => {
            setIsOffline(false);
            // Show briefly then hide
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = () => {
            setIsOffline(true);
            setShowBanner(true);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!showBanner && !isOffline) return null;

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[100] transition-transform duration-300 ${showBanner || isOffline ? "translate-y-0" : "-translate-y-full"
                }`}
        >
            <div
                className={`px-4 py-2 text-center text-sm font-medium ${isOffline
                        ? "bg-amber-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
            >
                {isOffline ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                        </svg>
                        You&apos;re offline. Some features may not work.
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Back online!
                    </span>
                )}
            </div>
        </div>
    );
}

/**
 * Offline Page Content
 * Shown when user navigates offline
 */
export function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    You&apos;re Offline
                </h1>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    Connect to the internet to watch videos and access your courses.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full max-w-xs mx-auto px-6 py-3 bg-[#2EBD59] text-white font-medium rounded-lg hover:bg-[#26a34d] transition-colors"
                    >
                        Try Again
                    </button>

                    <p className="text-sm text-gray-400">
                        Your progress is saved locally and will sync when you&apos;re back online.
                    </p>
                </div>
            </div>
        </div>
    );
}
