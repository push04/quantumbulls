"use client";

import { useState } from "react";

interface TestimonialFormProps {
    courseId?: string;
    courseName?: string;
    onSubmit: (data: { content: string; rating: number }) => void;
    onCancel: () => void;
}

/**
 * Testimonial Submission Form
 */
export default function TestimonialForm({
    courseId,
    courseName,
    onSubmit,
    onCancel
}: TestimonialFormProps) {
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || rating === 0) return;

        setIsSubmitting(true);
        await onSubmit({ content: content.trim(), rating });
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Share Your Experience
            </h3>
            {courseName && (
                <p className="text-sm text-gray-500 mb-4">
                    Reviewing: <span className="font-medium">{courseName}</span>
                </p>
            )}

            <form onSubmit={handleSubmit}>
                {/* Star Rating */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating
                    </label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                            >
                                {star <= (hoveredRating || rating) ? '⭐' : '☆'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Review Text */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your learning experience..."
                        className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                        rows={4}
                        maxLength={500}
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                        {content.length}/500
                    </div>
                </div>

                {/* Note */}
                <p className="text-xs text-gray-500 mb-4">
                    Your review will be visible after approval by our team.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!content.trim() || rating === 0 || isSubmitting}
                        className="flex-1 py-2.5 px-4 bg-[#2EBD59] text-white font-medium rounded-xl hover:bg-[#26a34d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        </div>
    );
}
