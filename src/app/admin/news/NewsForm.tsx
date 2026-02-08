"use client";

import { useState } from "react";
import { createNews, updateNews } from "./actions";

import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";

interface NewsFormProps {
    newsHelper?: {
        id: string;
        title: string;
        summary: string | null;
        source: string | null;
        url: string | null;
        image_url?: string | null;
    };
    isEditing?: boolean;
}

export default function NewsForm({ newsHelper, isEditing = false }: NewsFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string>(newsHelper?.image_url || "");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        // Validation check if critical fields are missing if needed, but actions handle it too

        let result;
        if (isEditing && newsHelper) {
            result = await updateNews(newsHelper.id, formData);
        } else {
            result = await createNews(formData);
        }

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
        // Redirect happens in action
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                        name="title"
                        defaultValue={newsHelper?.title || ""}
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                        placeholder="Analysis: Market hits all-time high"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                    <input
                        name="source"
                        defaultValue={newsHelper?.source || ""}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                        placeholder="Bloomberg, Reuters, Internal"
                    />
                </div>

                <div>
                    <ImageUpload
                        label="News Image"
                        value={imageUrl}
                        onChange={setImageUrl}
                    />
                    <input type="hidden" name="image_url" value={imageUrl} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">External URL (Optional)</label>
                    <input
                        name="url"
                        defaultValue={newsHelper?.url || ""}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                        placeholder="https://..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Summary / Content</label>
                    <textarea
                        name="summary"
                        defaultValue={newsHelper?.summary || ""}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                        placeholder="Brief summary of the news item..."
                    />
                </div>

                <div className="pt-4 flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-[#2EBD59] text-white rounded-lg hover:bg-[#26a34d] transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Saving..." : isEditing ? "Update News" : "Publish News"}
                    </button>
                </div>
            </div>
        </form>
    );
}
