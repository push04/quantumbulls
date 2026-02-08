"use client";

import { useState } from "react";
import type { Session } from "@/lib/session";
import { getDeviceEmoji } from "@/lib/session/deviceDetection";
import { formatLocation } from "@/lib/session/geoLocation";

interface DeviceConflictModalProps {
    existingSession: Session;
    onContinue: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

/**
 * Modal shown when user tries to log in from a new device
 * while already logged in elsewhere
 */
export default function DeviceConflictModal({
    existingSession,
    onContinue,
    onCancel,
    isLoading = false,
}: DeviceConflictModalProps) {
    const deviceEmoji = getDeviceEmoji(existingSession.device_type as 'desktop' | 'mobile' | 'tablet' | 'unknown');
    const location = formatLocation({
        country: existingSession.location_country || '',
        countryCode: '',
        city: existingSession.location_city || '',
        region: '',
        timezone: '',
        isp: '',
    });

    const lastActive = new Date(existingSession.last_active);
    const timeAgo = getTimeAgo(lastActive);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
                {/* Warning Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                    Already Logged In
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-center mb-6">
                    You're currently logged in on another device
                </p>

                {/* Session Info Card */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">{deviceEmoji}</div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-900">
                                {existingSession.device_name}
                            </div>
                            <div className="text-sm text-gray-500">
                                {location !== 'Unknown location' && (
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {location}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                                Active {timeAgo}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onContinue}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-[#2EBD59] hover:bg-[#26a34d] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Logging out other device...
                            </span>
                        ) : (
                            "Log out there and continue here"
                        )}
                    </button>

                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="w-full py-3 px-4 text-gray-600 hover:text-gray-900 font-medium rounded-xl transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>

                {/* Help text */}
                <p className="text-xs text-gray-400 text-center mt-6">
                    For security, only one device can be logged in at a time.
                </p>
            </div>
        </div>
    );
}

/**
 * Get human-readable time ago string
 */
function getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return date.toLocaleDateString();
}
