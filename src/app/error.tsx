"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log error to monitoring service
        console.error("Application Error:", error);

        // TODO: Send to error tracking service (Sentry, etc.)
        // logErrorToService(error);
    }, [error]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-md">
                {/* Error Illustration */}
                <div className="relative w-48 h-48 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-full" />
                    <div className="absolute inset-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <svg className="w-20 h-20 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Something Went Wrong
                </h1>
                <p className="text-gray-600 mb-8">
                    We&apos;ve been notified and are working to fix it. Please try again.
                </p>

                {/* Error Details (hidden in production) */}
                {process.env.NODE_ENV === "development" && (
                    <div className="mb-6 p-4 bg-red-100 rounded-lg text-left">
                        <p className="text-xs text-red-800 font-mono break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-red-600 mt-2">
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={reset}
                        className="block w-full px-6 py-3 bg-[#2EBD59] text-white font-medium rounded-lg hover:bg-[#26a34d] transition-colors"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="block w-full px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Go Home
                    </Link>
                </div>

                <p className="mt-8 text-sm text-gray-400">
                    Error persisting?{" "}
                    <Link href="/contact" className="text-[#2EBD59] hover:underline">
                        Contact Support
                    </Link>
                </p>
            </div>
        </main>
    );
}
