"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPastSessions, type LiveSession } from "@/lib/live";

/**
 * Past Sessions Archive
 * Shows recorded live sessions with tier indicators
 */
export default function PastSessions() {
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const limit = 12;

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const { sessions: data, total: count } = await getPastSessions(page, limit);
                setSessions(data);
                setTotal(count);
            } catch (error) {
                console.error("Failed to load past sessions:", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [page]);

    const totalPages = Math.ceil(total / limit);

    if (loading && page === 1) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-200 rounded-xl aspect-video" />
                ))}
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Recordings Yet</h3>
                <p className="text-gray-500">Past live sessions will appear here</p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                    <RecordingCard key={session.id} session={session} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

function RecordingCard({ session }: { session: LiveSession }) {
    const date = new Date(session.ended_at || session.scheduled_at);

    const tierColors: Record<string, string> = {
        free: "bg-gray-100 text-gray-700",
        basic: "bg-blue-100 text-blue-700",
        medium: "bg-purple-100 text-purple-700",
        advanced: "bg-amber-100 text-amber-700",
    };

    return (
        <Link
            href={`/live/${session.id}`}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[#2EBD59] hover:shadow-md transition-all"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-100">
                {session.thumbnail_url ? (
                    <img
                        src={session.thumbnail_url}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                )}

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {session.duration_minutes} min
                </div>

                {/* Play overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
                        <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#2EBD59] transition-colors">
                    {session.title}
                </h3>

                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <span>{date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
                    {session.host_name && (
                        <>
                            <span>•</span>
                            <span>{session.host_name}</span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tierColors[session.min_tier]}`}>
                        {session.min_tier === "free" ? "Free" : `${session.min_tier}+`}
                    </span>
                    {session.total_unique_viewers > 0 && (
                        <span className="text-xs text-gray-400">
                            {session.total_unique_viewers} views
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
