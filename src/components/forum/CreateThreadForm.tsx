"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createThread } from "@/lib/community";
import { containsProfanity, cleanProfanity, containsSpam, canUserPost } from "@/lib/community";

interface CreateThreadFormProps {
    categoryId: string;
    categorySlug: string;
    userId: string;
}

/**
 * Create Thread Form
 * Form for creating new discussion threads
 */
export function CreateThreadForm({ categoryId, categorySlug, userId }: CreateThreadFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim() || !content.trim()) {
            setError("Please fill in both title and content");
            return;
        }

        // Check rate limiting
        const { allowed, reason } = await canUserPost(userId);
        if (!allowed) {
            setError(reason || "You cannot post right now");
            return;
        }

        // Check for spam
        const spamCheck = containsSpam(content);
        if (spamCheck.isSpam) {
            setError(`Post flagged: ${spamCheck.reason}. Please modify your post.`);
            return;
        }

        // Clean profanity
        const cleanTitle = containsProfanity(title) ? cleanProfanity(title) : title;
        const cleanContent = containsProfanity(content) ? cleanProfanity(content) : content;

        setSubmitting(true);
        try {
            const thread = await createThread(categoryId, cleanTitle, cleanContent, imageUrl || undefined);
            router.push(`/community/thread/${thread.id}`);
        } catch (error) {
            console.error("Failed to create thread:", error);
            setError("Failed to create thread. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Start a New Discussion</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What's your question or topic?"
                        maxLength={255}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">{title.length}/255</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe your question or start your discussion..."
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Add a chart screenshot or relevant image</p>
                </div>

                {/* Community Guidelines */}
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                    <h3 className="font-medium text-gray-900 mb-2">Community Guidelines</h3>
                    <ul className="space-y-1 list-disc list-inside">
                        <li>Be respectful and constructive</li>
                        <li>No spam or self-promotion</li>
                        <li>Educational discussion only - no financial advice</li>
                        <li>Do not share account credentials</li>
                    </ul>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => router.push(`/community/${categorySlug}`)}
                        className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !title.trim() || !content.trim()}
                        className="flex-1 px-4 py-2 bg-[#2EBD59] text-white font-medium rounded-lg hover:bg-[#26a34d] disabled:opacity-50 transition-colors"
                    >
                        {submitting ? "Posting..." : "Post Thread"}
                    </button>
                </div>
            </div>
        </form>
    );
}
