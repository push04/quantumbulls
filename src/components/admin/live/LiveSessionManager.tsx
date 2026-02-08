"use client";

import { useState, useEffect } from "react";
import {
    getUpcomingSessions,
    createSession,
    updateSession,
    startSession,
    endSession,
    publishRecording,
    type LiveSession
} from "@/lib/live";

/**
 * Admin Live Session Manager
 * Create, edit, and control live sessions
 */
export default function LiveSessionManager() {
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSession, setEditingSession] = useState<LiveSession | null>(null);

    const loadSessions = async () => {
        try {
            const data = await getUpcomingSessions(20);
            setSessions(data);
        } catch (error) {
            console.error("Failed to load sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    const handleCreate = async (data: Partial<LiveSession>) => {
        await createSession(data);
        setShowForm(false);
        loadSessions();
    };

    const handleUpdate = async (id: string, data: Partial<LiveSession>) => {
        await updateSession(id, data);
        setEditingSession(null);
        loadSessions();
    };

    const handleStartSession = async (id: string) => {
        if (confirm("Start this live session now?")) {
            await startSession(id);
            loadSessions();
        }
    };

    const handleEndSession = async (id: string) => {
        if (confirm("End this live session?")) {
            await endSession(id);
            loadSessions();
        }
    };

    const handlePublish = async (id: string, url: string) => {
        await publishRecording(id, url);
        loadSessions();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Live Sessions</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-[#2EBD59] text-white font-medium rounded-lg hover:bg-[#26a34d] transition-colors"
                >
                    + Schedule Session
                </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => {
                        setEditingSession({
                            title: "Quick Live Update",
                            scheduled_at: new Date().toISOString(),
                            duration_minutes: 15,
                            min_tier: "free",
                            stream_platform: "youtube",
                        } as LiveSession);
                        setShowForm(true);
                    }}
                    className="p-4 bg-red-100 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Go Live Now</h3>
                            <p className="text-xs text-gray-500">Quick market update</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Session Form Modal */}
            {(showForm || editingSession) && (
                <SessionForm
                    session={editingSession}
                    onSubmit={editingSession?.id
                        ? (data) => handleUpdate(editingSession.id, data)
                        : handleCreate
                    }
                    onClose={() => {
                        setShowForm(false);
                        setEditingSession(null);
                    }}
                />
            )}

            {/* Sessions List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24" />
                    ))}
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No sessions scheduled
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <SessionRow
                            key={session.id}
                            session={session}
                            onEdit={() => setEditingSession(session)}
                            onStart={() => handleStartSession(session.id)}
                            onEnd={() => handleEndSession(session.id)}
                            onPublish={(url) => handlePublish(session.id, url)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function SessionRow({
    session,
    onEdit,
    onStart,
    onEnd,
    onPublish,
}: {
    session: LiveSession;
    onEdit: () => void;
    onStart: () => void;
    onEnd: () => void;
    onPublish: (url: string) => void;
}) {
    const [recordingUrl, setRecordingUrl] = useState("");
    const [showPublish, setShowPublish] = useState(false);

    const date = new Date(session.scheduled_at);
    const isLive = session.status === "live";
    const isEnded = session.status === "ended";

    const statusColors: Record<string, string> = {
        scheduled: "bg-blue-100 text-blue-700",
        live: "bg-red-100 text-red-700",
        ended: "bg-gray-100 text-gray-700",
        cancelled: "bg-gray-100 text-gray-500",
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{session.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[session.status]}`}>
                            {session.status === "live" && "🔴 "}{session.status.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        {date.toLocaleDateString()} at {date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                        {" • "}{session.duration_minutes} min
                        {" • "}{session.min_tier}+ tier
                    </p>
                    {session.stream_url && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                            {session.stream_url}
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    {session.status === "scheduled" && (
                        <>
                            <button
                                onClick={onEdit}
                                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Edit
                            </button>
                            <button
                                onClick={onStart}
                                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Go Live
                            </button>
                        </>
                    )}

                    {isLive && (
                        <button
                            onClick={onEnd}
                            className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                        >
                            End Session
                        </button>
                    )}

                    {isEnded && !session.recording_published && (
                        <button
                            onClick={() => setShowPublish(true)}
                            className="px-3 py-1.5 text-sm bg-[#2EBD59] text-white rounded-lg hover:bg-[#26a34d]"
                        >
                            Publish Recording
                        </button>
                    )}

                    {session.recording_published && (
                        <span className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg">
                            ✓ Published
                        </span>
                    )}
                </div>
            </div>

            {/* Publish Recording Form */}
            {showPublish && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={recordingUrl}
                            onChange={(e) => setRecordingUrl(e.target.value)}
                            placeholder="Recording URL (YouTube, Vimeo, etc.)"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                        <button
                            onClick={() => {
                                onPublish(recordingUrl);
                                setShowPublish(false);
                            }}
                            disabled={!recordingUrl}
                            className="px-4 py-2 bg-[#2EBD59] text-white rounded-lg disabled:opacity-50"
                        >
                            Publish
                        </button>
                        <button
                            onClick={() => setShowPublish(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function SessionForm({
    session,
    onSubmit,
    onClose,
}: {
    session: LiveSession | null;
    onSubmit: (data: Partial<LiveSession>) => void;
    onClose: () => void;
}) {
    const [formData, setFormData] = useState({
        title: session?.title || "",
        description: session?.description || "",
        scheduled_at: session?.scheduled_at
            ? new Date(session.scheduled_at).toISOString().slice(0, 16)
            : new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        duration_minutes: session?.duration_minutes || 60,
        stream_url: session?.stream_url || "",
        stream_platform: session?.stream_platform || "youtube",
        min_tier: session?.min_tier || "free",
        host_name: session?.host_name || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            scheduled_at: new Date(formData.scheduled_at).toISOString(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {session?.id ? "Edit Session" : "Schedule New Session"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.scheduled_at}
                                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                                <input
                                    type="number"
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                    min={15}
                                    max={180}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stream URL</label>
                            <input
                                type="url"
                                value={formData.stream_url}
                                onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                placeholder="https://youtube.com/live/..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                                <select
                                    value={formData.stream_platform}
                                    onChange={(e) => setFormData({ ...formData, stream_platform: e.target.value as "youtube" | "zoom" | "streamyard" })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                >
                                    <option value="youtube">YouTube Live</option>
                                    <option value="zoom">Zoom</option>
                                    <option value="streamyard">StreamYard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Tier</label>
                                <select
                                    value={formData.min_tier}
                                    onChange={(e) => setFormData({ ...formData, min_tier: e.target.value as "free" | "basic" | "medium" | "advanced" })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                >
                                    <option value="free">Free (All Users)</option>
                                    <option value="basic">Basic+</option>
                                    <option value="medium">Medium+</option>
                                    <option value="advanced">Advanced Only</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Host Name</label>
                            <input
                                type="text"
                                value={formData.host_name}
                                onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                placeholder="e.g., Quantum Bull"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-[#2EBD59] text-white rounded-lg hover:bg-[#26a34d]"
                            >
                                {session?.id ? "Update" : "Schedule"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
