"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    getThread,
    getReplies,
    createReply,
    vote,
    markAsSolution,
    getUserVote,
    type ForumThread,
    type ForumReply
} from "@/lib/community";
import { getReputationBadge, reportContent } from "@/lib/community";

interface ThreadDetailProps {
    threadId: string;
    userId?: string;
    isAuthor?: boolean;
    isAdmin?: boolean;
}

/**
 * Thread Detail Component
 * Shows thread with nested replies and voting
 */
export function ThreadDetail({ threadId, userId, isAuthor, isAdmin }: ThreadDetailProps) {
    const [thread, setThread] = useState<ForumThread | null>(null);
    const [replies, setReplies] = useState<ForumReply[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [userVote, setUserVote] = useState(0);

    useEffect(() => {
        async function load() {
            try {
                const [threadData, repliesData, voteData] = await Promise.all([
                    getThread(threadId),
                    getReplies(threadId),
                    userId ? getUserVote("thread", threadId) : Promise.resolve(0),
                ]);
                setThread(threadData);
                setReplies(repliesData);
                setUserVote(voteData);
            } catch (error) {
                console.error("Failed to load thread:", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [threadId, userId]);

    const handleVote = async (value: 1 | -1) => {
        if (!userId) return;
        try {
            await vote("thread", threadId, value);
            setUserVote((prev) => (prev === value ? 0 : value));
            setThread((prev) => prev ? {
                ...prev,
                vote_score: prev.vote_score + (userVote === value ? -value : value - userVote),
            } : null);
        } catch (error) {
            console.error("Failed to vote:", error);
        }
    };

    const handleSubmitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || submitting) return;

        setSubmitting(true);
        try {
            await createReply(threadId, replyContent);
            setReplyContent("");
            // Reload replies
            const newReplies = await getReplies(threadId);
            setReplies(newReplies);
        } catch (error) {
            console.error("Failed to post reply:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse bg-gray-100 rounded-xl h-48" />
                <div className="animate-pulse bg-gray-100 rounded-xl h-32" />
            </div>
        );
    }

    if (!thread) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Thread not found</p>
            </div>
        );
    }

    const badge = getReputationBadge(thread.author?.reputation_score || 0);

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500">
                <Link href="/community" className="hover:text-[#2EBD59]">Community</Link>
                <span className="mx-2">→</span>
                <Link href={`/community/${thread.category?.slug}`} className="hover:text-[#2EBD59]">
                    {thread.category?.name}
                </Link>
            </nav>

            {/* Thread */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex gap-4">
                    {/* Voting */}
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => handleVote(1)}
                            disabled={!userId}
                            className={`p-2 rounded-lg transition-colors ${userVote === 1 ? "text-[#2EBD59] bg-green-50" : "text-gray-400 hover:bg-gray-100"
                                }`}
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 3a1 1 0 01.707.293l6 6a1 1 0 01-1.414 1.414L10 5.414 4.707 10.707a1 1 0 01-1.414-1.414l6-6A1 1 0 0110 3z" />
                            </svg>
                        </button>
                        <span className="text-lg font-semibold text-gray-900">{thread.vote_score}</span>
                        <button
                            onClick={() => handleVote(-1)}
                            disabled={!userId}
                            className={`p-2 rounded-lg transition-colors ${userVote === -1 ? "text-red-500 bg-red-100" : "text-gray-400 hover:bg-gray-100"
                                }`}
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 17a1 1 0 01-.707-.293l-6-6a1 1 0 011.414-1.414L10 14.586l5.293-5.293a1 1 0 011.414 1.414l-6 6A1 1 0 0110 17z" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <span className={badge.color}>{badge.icon} {badge.name}</span>
                            <span>•</span>
                            <span>{thread.author?.full_name || "Anonymous"}</span>
                            <span>•</span>
                            <span>{new Date(thread.created_at).toLocaleString()}</span>
                        </div>
                        <div className="mt-4 prose prose-gray max-w-none">
                            <p className="whitespace-pre-wrap">{thread.content}</p>
                        </div>
                        {thread.image_url && (
                            <div className="relative mt-4 h-96 w-full max-w-2xl">
                                <Image
                                    src={thread.image_url}
                                    alt="Thread attachment"
                                    fill
                                    className="rounded-lg object-cover"
                                    unoptimized
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => reportContent("thread", thread.id, "Inappropriate content", thread.author_id)}
                                className="text-sm text-gray-500 hover:text-red-500"
                            >
                                Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Replies */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
                </h2>

                {replies.map((reply) => (
                    <ReplyCard
                        key={reply.id}
                        reply={reply}
                        threadId={threadId}
                        userId={userId}
                        isThreadAuthor={isAuthor}
                        isAdmin={isAdmin}
                        onUpdate={async () => {
                            const newReplies = await getReplies(threadId);
                            setReplies(newReplies);
                        }}
                    />
                ))}

                {/* Reply Form */}
                {userId && !thread.is_locked ? (
                    <form onSubmit={handleSubmitReply} className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="font-medium text-gray-900 mb-3">Your Reply</h3>
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                            rows={4}
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                type="submit"
                                disabled={!replyContent.trim() || submitting}
                                className="px-4 py-2 bg-[#2EBD59] text-white font-medium rounded-lg hover:bg-[#26a34d] disabled:opacity-50 transition-colors"
                            >
                                {submitting ? "Posting..." : "Post Reply"}
                            </button>
                        </div>
                    </form>
                ) : thread.is_locked ? (
                    <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
                        🔒 This thread is locked and no longer accepting replies.
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <Link href="/auth/login" className="text-[#2EBD59] hover:underline">
                            Sign in to reply
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function ReplyCard({
    reply,
    threadId,
    userId,
    isThreadAuthor,
    isAdmin,
    onUpdate,
    depth = 0,
}: {
    reply: ForumReply;
    threadId: string;
    userId?: string;
    isThreadAuthor?: boolean;
    isAdmin?: boolean;
    onUpdate: () => void;
    depth?: number;
}) {
    const [userVote, setUserVote] = useState(0);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const badge = getReputationBadge(reply.author?.reputation_score || 0);

    useEffect(() => {
        if (userId) {
            getUserVote("reply", reply.id).then(setUserVote);
        }
    }, [reply.id, userId]);

    const handleVote = async (value: 1 | -1) => {
        if (!userId) return;
        await vote("reply", reply.id, value);
        setUserVote((prev) => (prev === value ? 0 : value));
        onUpdate();
    };

    const handleMarkSolution = async () => {
        await markAsSolution(reply.id, threadId);
        onUpdate();
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        await createReply(threadId, replyContent, reply.id);
        setReplyContent("");
        setShowReplyForm(false);
        onUpdate();
    };

    return (
        <div className={`${depth > 0 ? "ml-8 border-l-2 border-gray-100 pl-4" : ""}`}>
            <div className={`bg-white rounded-xl border p-4 ${reply.is_solution ? "border-[#2EBD59] bg-green-50" : "border-gray-200"}`}>
                {reply.is_solution && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-[#2EBD59] font-medium">
                        ✓ Marked as Solution
                    </div>
                )}
                <div className="flex gap-4">
                    {/* Voting */}
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => handleVote(1)}
                            disabled={!userId}
                            className={`p-1 rounded ${userVote === 1 ? "text-[#2EBD59]" : "text-gray-400"}`}
                        >
                            ▲
                        </button>
                        <span className="text-sm font-medium">{reply.vote_score}</span>
                        <button
                            onClick={() => handleVote(-1)}
                            disabled={!userId}
                            className={`p-1 rounded ${userVote === -1 ? "text-red-500" : "text-gray-400"}`}
                        >
                            ▼
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className={badge.color}>{badge.icon}</span>
                            <span>{reply.author?.full_name || "Anonymous"}</span>
                            <span>•</span>
                            <span>{new Date(reply.created_at).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-gray-700">{reply.content}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-3 text-sm">
                            {userId && (
                                <button
                                    onClick={() => setShowReplyForm(!showReplyForm)}
                                    className="text-gray-500 hover:text-[#2EBD59]"
                                >
                                    Reply
                                </button>
                            )}
                            {(isThreadAuthor || isAdmin) && !reply.is_solution && (
                                <button
                                    onClick={handleMarkSolution}
                                    className="text-[#2EBD59] hover:underline"
                                >
                                    Mark as Solution
                                </button>
                            )}
                            <button
                                onClick={() => reportContent("reply", reply.id, "Inappropriate content", reply.author_id)}
                                className="text-gray-500 hover:text-red-500"
                            >
                                Report
                            </button>
                        </div>

                        {/* Reply Form */}
                        {showReplyForm && (
                            <form onSubmit={handleReply} className="mt-3">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Your reply..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                                    rows={2}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowReplyForm(false)}
                                        className="px-3 py-1 text-sm text-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 py-1 text-sm bg-[#2EBD59] text-white rounded-lg"
                                    >
                                        Post
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Nested Replies */}
            {reply.replies && reply.replies.length > 0 && depth < 3 && (
                <div className="mt-3 space-y-3">
                    {reply.replies.map((child) => (
                        <ReplyCard
                            key={child.id}
                            reply={child}
                            threadId={threadId}
                            userId={userId}
                            isThreadAuthor={isThreadAuthor}
                            isAdmin={isAdmin}
                            onUpdate={onUpdate}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
