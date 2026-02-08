"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getThreads, type ForumThread } from "@/lib/community";
import { getReputationBadge } from "@/lib/community/reputation";

interface ThreadListProps {
    categoryId: string;
    categorySlug: string;
    categoryName: string;
}

/**
 * Thread List Component
 * Displays threads in a category with pagination
 */
export function ThreadList({ categoryId, categorySlug, categoryName }: ThreadListProps) {
    const [threads, setThreads] = useState<ForumThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState<"latest" | "popular" | "unanswered">("latest");
    const limit = 20;

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const { threads: data, total: count } = await getThreads(categoryId, page, limit, sortBy);
                setThreads(data);
                setTotal(count);
            } catch (error) {
                console.error("Failed to load threads:", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [categoryId, page, sortBy]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{categoryName}</h1>
                    <p className="text-sm text-gray-500">{total} threads</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    >
                        <option value="latest">Latest Activity</option>
                        <option value="popular">Most Popular</option>
                        <option value="unanswered">Unanswered</option>
                    </select>
                    <Link
                        href={`/community/${categorySlug}/new`}
                        className="px-4 py-2 bg-[#2EBD59] text-white font-medium rounded-lg hover:bg-[#26a34d] transition-colors"
                    >
                        New Thread
                    </Link>
                </div>
            </div>

            {/* Thread List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24" />
                    ))}
                </div>
            ) : threads.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">No threads yet. Be the first to start a discussion!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {threads.map((thread) => (
                        <ThreadCard key={thread.id} thread={thread} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

function ThreadCard({ thread }: { thread: ForumThread }) {
    const badge = getReputationBadge(thread.author?.reputation_score || 0);
    const date = new Date(thread.created_at);

    return (
        <Link
            href={`/community/thread/${thread.id}`}
            className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-[#2EBD59] transition-colors"
        >
            <div className="flex items-start gap-4">
                {/* Vote Score */}
                <div className="text-center min-w-[50px]">
                    <div className="text-lg font-semibold text-gray-900">{thread.vote_score}</div>
                    <div className="text-xs text-gray-500">votes</div>
                </div>

                {/* Replies */}
                <div className="text-center min-w-[50px]">
                    <div className={`text-lg font-semibold ${thread.reply_count > 0 ? "text-[#2EBD59]" : "text-gray-400"}`}>
                        {thread.reply_count}
                    </div>
                    <div className="text-xs text-gray-500">replies</div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        {thread.is_pinned && (
                            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">📌 Pinned</span>
                        )}
                        {thread.is_locked && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">🔒 Locked</span>
                        )}
                    </div>
                    <h3 className="font-semibold text-gray-900 hover:text-[#2EBD59] transition-colors line-clamp-1">
                        {thread.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <span className={badge.color}>{badge.icon}</span>
                        <span>{thread.author?.full_name || "Anonymous"}</span>
                        <span>•</span>
                        <span>{date.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{thread.view_count} views</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
