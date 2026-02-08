"use client";

import { useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { createAnalysis, updateAnalysis } from "./actions";

interface AnalysisFormProps {
    analysisHelper?: {
        id: string;
        title: string;
        summary: string | null;
        content: string;
        image_url: string | null;
        is_premium: boolean | null;
    };
    isEditing?: boolean;
}

export default function AnalysisForm({ analysisHelper, isEditing = false }: AnalysisFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState(analysisHelper?.image_url || "");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        let result;
        if (isEditing && analysisHelper) {
            result = await updateAnalysis(analysisHelper.id, formData);
        } else {
            result = await createAnalysis(formData);
        }

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                            name="title"
                            defaultValue={analysisHelper?.title || ""}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                            placeholder="Weekly Market Outlook"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                        <textarea
                            name="summary"
                            defaultValue={analysisHelper?.summary || ""}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                            placeholder="Brief overview..."
                        />
                    </div>

                    <div>
                        <ImageUpload
                            label="Analysis Image"
                            value={imageUrl}
                            onChange={setImageUrl}
                        />
                        <input type="hidden" name="image_url" value={imageUrl} />
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            name="is_premium"
                            id="is_premium"
                            defaultChecked={analysisHelper?.is_premium || false}
                            className="w-5 h-5 text-[#2EBD59] rounded focus:ring-[#2EBD59]"
                        />
                        <label htmlFor="is_premium" className="text-sm font-medium text-gray-700">
                            Premium Content (Pro/Mentor only)
                        </label>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content (Markdown supported)</label>
                        <textarea
                            name="content"
                            defaultValue={analysisHelper?.content || ""}
                            required
                            rows={15}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59] font-mono text-sm"
                            placeholder="# Market Analysis\n\nDetailed breakdown here..."
                        />
                    </div>
                </div>
            </div>

            <div className="pt-8 flex items-center justify-end gap-4 border-t border-gray-50 mt-8">
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
                    {isLoading ? "Saving..." : isEditing ? "Update Analysis" : "Publish Analysis"}
                </button>
            </div>
        </form>
    );
}
