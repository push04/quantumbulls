"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUpcomingSessions, getCurrentLiveSession, type LiveSession } from "@/lib/live";

/**
 * Upcoming Live Sessions Component
 * Shows scheduled and live sessions with registration
 */
export default function UpcomingSessions() {
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [upcoming, live] = await Promise.all([
                    getUpcomingSessions(5),
                    getCurrentLiveSession(),
                ]);
                setSessions(upcoming);
                setLiveSession(live);
            } catch (error) {
                console.error("Failed to load sessions:", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Live Now Banner */}
            {liveSession && (
                <Link
                    href={`/live/${liveSession.id}`}
                    className="block bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white hover:from-red-600 hover:to-red-700 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wide">Live Now</span>
                        </span>
                    </div>
                    <h3 className="text-lg font-bold mt-2">{liveSession.title}</h3>
                    <p className="text-white/80 text-sm">Click to join the live session</p>
                </Link>
            )}

            {/* Upcoming Sessions */}
            {sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No upcoming sessions scheduled</p>
                </div>
            ) : (
                sessions.map((session) => (
                    <SessionCard key={session.id} session={session} />
                ))
            )}
        </div>
    );
}

function SessionCard({ session }: { session: LiveSession }) {
    const date = new Date(session.scheduled_at);
    const isToday = new Date().toDateString() === date.toDateString();
    const isTomorrow = new Date(Date.now() + 86400000).toDateString() === date.toDateString();

    const tierColors: Record<string, string> = {
        free: "bg-gray-100 text-gray-700",
        basic: "bg-blue-100 text-blue-700",
        medium: "bg-purple-100 text-purple-700",
        advanced: "bg-amber-100 text-amber-700",
    };

    return (
        <Link
            href={`/live/${session.id}`}
            className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-[#2EBD59] hover:shadow-md transition-all"
        >
            <div className="flex gap-4">
                {/* Date Badge */}
                <div className="flex-shrink-0 w-16 text-center">
                    <div className="bg-[#2EBD59]/10 rounded-lg py-2">
                        <div className="text-xs text-[#2EBD59] font-medium uppercase">
                            {isToday ? "Today" : isTomorrow ? "Tomorrow" : date.toLocaleDateString("en", { weekday: "short" })}
                        </div>
                        <div className="text-2xl font-bold text-[#2EBD59]">
                            {date.getDate()}
                        </div>
                        <div className="text-xs text-gray-500">
                            {date.toLocaleDateString("en", { month: "short" })}
                        </div>
                    </div>
                </div>

                {/* Session Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{session.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                            {date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span>•</span>
                        <span>{session.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${tierColors[session.min_tier]}`}>
                            {session.min_tier === "free" ? "All Users" : `${session.min_tier}+`}
                        </span>
                        {session.host_name && (
                            <span className="text-xs text-gray-500">
                                with {session.host_name}
                            </span>
                        )}
                    </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 flex items-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
