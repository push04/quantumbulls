"use client";

import { useEffect, useState } from "react";
import {
    getConnectionMonitor,
    type ConnectionState
} from "@/lib/video/connectionMonitor";

interface ConnectionOverlayProps {
    onRetry?: () => void;
}

/**
 * Overlay shown when connection is lost during video playback
 */
export default function ConnectionOverlay({ onRetry }: ConnectionOverlayProps) {
    const [connectionState, setConnectionState] = useState<ConnectionState>({
        status: 'online',
        retryCount: 0,
        retryIn: 0,
    });

    useEffect(() => {
        const monitor = getConnectionMonitor();
        const unsubscribe = monitor.subscribe(setConnectionState);

        return () => {
            unsubscribe();
        };
    }, []);

    // Don't show if online
    if (connectionState.status === 'online') {
        return null;
    }

    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-center text-white p-6">
                {/* Status Icon */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                    {connectionState.status === 'offline' ? (
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                        </svg>
                    ) : (
                        <svg className="w-8 h-8 text-yellow-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    )}
                </div>

                {/* Message */}
                <h3 className="text-lg font-semibold mb-2">
                    {connectionState.status === 'offline'
                        ? 'Connection Lost'
                        : 'Reconnecting...'}
                </h3>

                <p className="text-gray-300 mb-4">
                    {connectionState.status === 'reconnecting' && connectionState.retryIn > 0 ? (
                        <>Retrying in <span className="font-mono">{Math.ceil(connectionState.retryIn)}</span> seconds...</>
                    ) : connectionState.status === 'offline' ? (
                        'Please check your internet connection'
                    ) : (
                        'Attempting to reconnect...'
                    )}
                </p>

                {/* Retry count */}
                {connectionState.retryCount > 0 && (
                    <p className="text-sm text-gray-400 mb-4">
                        Retry attempt {connectionState.retryCount} of 5
                    </p>
                )}

                {/* Manual retry button */}
                {connectionState.status === 'offline' && (
                    <button
                        onClick={onRetry}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}
