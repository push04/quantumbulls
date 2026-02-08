"use client";

import { useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { createCourse, updateCourse } from "./actions";

interface CourseFormProps {
    courseHelper?: {
        id: string;
        title: string;
        description: string | null;
        thumbnail_url: string | null;
        difficulty: string | null; // beginner, intermediate, advanced
        tier: string | null; // free, pro, mentor
        is_active: boolean | null;
        order_index: number | null;
    };
    isEditing?: boolean;
}

export default function CourseForm({ courseHelper, isEditing = false }: CourseFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState(courseHelper?.thumbnail_url || "");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        let result;
        if (isEditing && courseHelper) {
            result = await updateCourse(courseHelper.id, formData);
        } else {
            result = await createCourse(formData);
        }

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Course Details</h2>

            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                    <input
                        name="title"
                        defaultValue={courseHelper?.title || ""}
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                        placeholder="e.g. Price Action Mastery"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        defaultValue={courseHelper?.description || ""}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                        placeholder="What will students learn?"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                        name="difficulty"
                        defaultValue={courseHelper?.difficulty || "beginner"}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                    >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Access Tier</label>
                    <select
                        name="tier"
                        defaultValue={courseHelper?.tier || "free"}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                    >
                        <option value="free">Free</option>
                        <option value="pro">Pro (Paid)</option>
                        <option value="mentor">Mentorship (Exclusive)</option>
                    </select>
                </div>

                <div className="col-span-2">
                    <ImageUpload
                        label="Course Thumbnail"
                        value={thumbnailUrl}
                        onChange={setThumbnailUrl}
                    />
                    <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Index</label>
                    <input
                        type="number"
                        name="order_index"
                        defaultValue={courseHelper?.order_index || 0}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                    />
                </div>

                <div className="flex items-center gap-3 pt-6">
                    <input
                        type="checkbox"
                        name="is_active"
                        id="is_active"
                        defaultChecked={courseHelper?.is_active ?? true}
                        className="w-5 h-5 text-[#2EBD59] rounded focus:ring-[#2EBD59]"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                        Is Active (Visible to users)
                    </label>
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
                    {isLoading ? "Saving..." : isEditing ? "Update Course" : "Create Course"}
                </button>
            </div>
        </form>
    );
}
