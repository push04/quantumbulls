"use client";

import { Component, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log to error service
        console.error("Error Boundary caught:", error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-6 bg-red-100 rounded-xl border border-red-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-800">Something went wrong</h3>
                            <p className="text-sm text-red-600">This component failed to load</p>
                        </div>
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Async Error Boundary for Suspense
 */
export function AsyncErrorBoundary({
    children,
    fallback
}: {
    children: ReactNode;
    fallback?: ReactNode
}) {
    return (
        <ErrorBoundary fallback={fallback}>
            {children}
        </ErrorBoundary>
    );
}

/**
 * Video Error Fallback
 */
export function VideoErrorFallback({ onRetry }: { onRetry?: () => void }) {
    return (
        <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
            <div className="text-center text-white">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 mb-3">Video failed to load</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}

/**
 * Payment Error Fallback
 */
export function PaymentErrorFallback() {
    return (
        <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-semibold text-amber-800">Payment Failed</h3>
                    <p className="text-sm text-amber-600">Your card was declined</p>
                </div>
            </div>
            <a
                href="/settings/billing"
                className="inline-block px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
                Update Payment Method
            </a>
        </div>
    );
}
