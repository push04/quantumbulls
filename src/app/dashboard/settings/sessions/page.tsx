"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    getActiveSessions,
    terminateSession,
    terminateAllOtherSessions,
    type Session
} from "@/lib/session";
import { getDeviceEmoji } from "@/lib/session/deviceDetection";

export default function ActiveSessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [terminatingId, setTerminatingId] = useState<string | null>(null);
    const [terminatingAll, setTerminatingAll] = useState(false);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const activeSessions = await getActiveSessions(user.id);
                setSessions(activeSessions);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleTerminate = async (sessionId: string) => {
        setTerminatingId(sessionId);
        try {
            await terminateSession(sessionId);
            await fetchSessions();
        } catch (error) {
            console.error('Error terminating session:', error);
        } finally {
            setTerminatingId(null);
        }
    };

    const handleTerminateAll = async () => {
        setTerminatingAll(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                await terminateAllOtherSessions(user.id);
                await fetchSessions();
            }
        } catch (error) {
            console.error('Error terminating all sessions:', error);
        } finally {
            setTerminatingAll(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Active Sessions
                    </h1>
                    <p className="text-gray-600">
                        Manage your logged-in devices. For security, only one device can be active at a time.
                    </p>
                </div>

                {/* Sessions List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-600">No active sessions found</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 mb-6">
                            {sessions.map(session => (
                                <div
                                    key={session.id}
                                    className={`bg-white rounded-xl border p-6 transition-all ${session.is_current
                                        ? 'border-[#2EBD59] ring-2 ring-[#2EBD59]/20'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            {/* Device Icon */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${session.is_current
                                                ? 'bg-[#2EBD59]/10'
                                                : 'bg-gray-100'
                                                }`}>
                                                {getDeviceEmoji(session.device_type as 'desktop' | 'mobile' | 'tablet' | 'unknown')}
                                            </div>

                                            {/* Session Info */}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900">
                                                        {session.device_name}
                                                    </span>
                                                    {session.is_current && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-[#2EBD59]/10 text-[#2EBD59] rounded-full">
                                                            This device
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-1 space-y-1">
                                                    {session.location_city && session.location_country && (
                                                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            </svg>
                                                            {session.location_city}, {session.location_country}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Last active: {formatDate(session.last_active)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {!session.is_current && (
                                            <button
                                                onClick={() => handleTerminate(session.id)}
                                                disabled={terminatingId === session.id}
                                                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {terminatingId === session.id ? (
                                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                ) : (
                                                    'Log out'
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Log out all button */}
                        {sessions.filter(s => !s.is_current).length > 0 && (
                            <button
                                onClick={handleTerminateAll}
                                disabled={terminatingAll}
                                className="w-full py-3 px-4 text-red-600 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 rounded-xl transition-all disabled:opacity-50"
                            >
                                {terminatingAll ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Logging out all devices...
                                    </span>
                                ) : (
                                    'Log out all other devices'
                                )}
                            </button>
                        )}
                    </>
                )}

                {/* Security tip */}
                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-blue-900">Security Tip</p>
                            <p className="text-sm text-blue-700 mt-1">
                                If you see a device you don't recognize, log it out immediately and change your password.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
