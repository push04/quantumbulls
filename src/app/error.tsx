"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ErrorProps {
    error: Error & { digest?: string; stack?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    const [expanded, setExpanded] = useState(false);
    
    useEffect(() => {
        console.error("Application Error:", error);
    }, [error]);

    const errorMessage = error?.message || "An unknown error occurred";
    const errorStack = error?.stack || "";
    const errorDigest = error?.digest || "";

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
            <div className="text-center max-w-2xl w-full">
                <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-full" />
                    <div className="absolute inset-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Something Went Wrong
                </h1>
                <p className="text-gray-600 mb-6">
                    An error occurred while loading this page.
                </p>

                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-left">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-red-800">Error Message:</p>
                        <button 
                            onClick={() => setExpanded(!expanded)}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                        >
                            {expanded ? "Hide Details" : "Show Details"}
                        </button>
                    </div>
                    <p className="text-sm text-red-700 font-mono break-all bg-white p-3 rounded-lg border border-red-100">
                        {errorMessage}
                    </p>
                    
                    {expanded && errorStack && (
                        <div className="mt-3">
                            <p className="text-xs font-semibold text-red-800 mb-1">Stack Trace:</p>
                            <pre className="text-xs text-red-600 bg-white p-3 rounded-lg border border-red-100 overflow-x-auto max-h-64">
                                {errorStack}
                            </pre>
                        </div>
                    )}
                    
                    {errorDigest && (
                        <p className="text-xs text-red-600 mt-2">
                            Error ID: {errorDigest}
                        </p>
                    )}
                </div>

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
