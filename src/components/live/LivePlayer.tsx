"use client";

import { useState, useEffect } from "react";
import { type LiveSession, getViewerCount, markUserJoined, markUserLeft } from "@/lib/live";
import LiveChat from "./LiveChat";

interface LivePlayerProps {
    session: LiveSession;
    userId: string;
    userTier: string;
    isAdmin?: boolean;
}

/**
 * Live Video Player Component
 * Embeds stream with viewer count and chat sidebar
 */
export default function LivePlayer({ session, userId, userTier, isAdmin }: LivePlayerProps) {
    const [viewerCount, setViewerCount] = useState(0);
    const [showChat, setShowChat] = useState(true);
    const [timeToStart, setTimeToStart] = useState<number | null>(null);

    const isLive = session.status === "live";
    const scheduledTime = new Date(session.scheduled_at).getTime();

    // Track viewer count
    useEffect(() => {
        if (!isLive) return;

        // Mark user as joined
        markUserJoined(session.id, userId);

        const interval = setInterval(async () => {
            const count = await getViewerCount(session.id);
            setViewerCount(count);
        }, 10000); // Update every 10 seconds

        // Initial fetch
        getViewerCount(session.id).then(setViewerCount);

        // Cleanup: mark user as left
        return () => {
            clearInterval(interval);
            markUserLeft(session.id, userId);
        };
    }, [session.id, userId, isLive]);

    // Countdown timer for waiting room
    useEffect(() => {
        if (isLive) {
            setTimeToStart(null);
            return;
        }

        const updateCountdown = () => {
            const diff = scheduledTime - Date.now();
            setTimeToStart(diff > 0 ? diff : null);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [scheduledTime, isLive]);

    // Format countdown
    const formatCountdown = (ms: number) => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        }
        return `${minutes}m ${seconds}s`;
    };

    // Get embed URL based on platform
    const getEmbedUrl = () => {
        if (!session.stream_url) return null;

        if (session.stream_platform === "youtube") {
            // Extract video ID from YouTube URL
            const match = session.stream_url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|live\/))([^&\s]+)/);
            if (match) {
                return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
            }
        }

        if (session.stream_platform === "zoom") {
            return session.stream_url; // Zoom embed URL directly
        }

        return session.stream_url;
    };

    const embedUrl = getEmbedUrl();

    return (
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">
            {/* Video Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Live Badge & Viewer Count */}
                {isLive && (
                    <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            LIVE
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {viewerCount} watching
                        </span>
                    </div>
                )}

                {/* Video Player or Waiting Room */}
                <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden relative">
                    {isLive && embedUrl ? (
                        <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <WaitingRoom
                            session={session}
                            timeToStart={timeToStart}
                            formatCountdown={formatCountdown}
                        />
                    )}
                </div>

                {/* Session Info */}
                <div className="mt-4">
                    <h1 className="text-xl font-bold text-gray-900">{session.title}</h1>
                    {session.description && (
                        <p className="text-gray-600 mt-1">{session.description}</p>
                    )}
                    {session.host_name && (
                        <p className="text-sm text-gray-500 mt-2">
                            Hosted by <span className="font-medium">{session.host_name}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Chat Sidebar */}
            <div className={`lg:w-80 flex-shrink-0 ${showChat ? "" : "hidden lg:hidden"}`}>
                <div className="h-full lg:h-[calc(100vh-200px)]">
                    <LiveChat
                        session={session}
                        userId={userId}
                        userTier={userTier}
                        isAdmin={isAdmin}
                    />
                </div>
            </div>

            {/* Toggle Chat Button (Mobile) */}
            <button
                onClick={() => setShowChat(!showChat)}
                className="fixed bottom-20 right-4 lg:hidden z-50 w-12 h-12 bg-[#2EBD59] text-white rounded-full shadow-lg flex items-center justify-center"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
        </div>
    );
}

function WaitingRoom({
    session,
    timeToStart,
    formatCountdown,
}: {
    session: LiveSession;
    timeToStart: number | null;
    formatCountdown: (ms: number) => string;
}) {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="text-center text-white px-4">
                {session.thumbnail_url && (
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white/20">
                        <img
                            src={session.thumbnail_url}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <h2 className="text-2xl font-bold mb-2">{session.title}</h2>

                {session.host_name && (
                    <p className="text-white/70 mb-6">with {session.host_name}</p>
                )}

                {timeToStart !== null ? (
                    <>
                        <p className="text-white/60 text-sm mb-2">Starting in</p>
                        <div className="text-4xl font-mono font-bold text-[#2EBD59]">
                            {formatCountdown(timeToStart)}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center gap-2 text-white/70">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Waiting for host to start...</span>
                    </div>
                )}

                <div className="mt-8 text-sm text-white/50">
                    Scheduled for {new Date(session.scheduled_at).toLocaleString()}
                </div>
            </div>
        </div>
    );
}
