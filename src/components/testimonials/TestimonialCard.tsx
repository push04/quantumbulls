"use client";

interface Testimonial {
    id: string;
    authorName: string;
    authorTitle?: string;
    avatarUrl?: string;
    content: string;
    rating: number;
    courseName?: string;
    createdAt: string;
}

interface TestimonialCardProps {
    testimonial: Testimonial;
    variant?: 'default' | 'featured';
}

/**
 * Testimonial Card Display
 */
export default function TestimonialCard({
    testimonial,
    variant = 'default'
}: TestimonialCardProps) {
    const isFeatured = variant === 'featured';

    return (
        <div className={`rounded-2xl p-6 ${isFeatured
                ? 'bg-gradient-to-br from-[#2EBD59]/5 to-emerald-50 border-2 border-[#2EBD59]/20'
                : 'bg-white border border-gray-200'
            }`}>
            {/* Quote icon */}
            <div className={`text-3xl mb-4 ${isFeatured ? 'text-[#2EBD59]' : 'text-gray-300'}`}>
                "
            </div>

            {/* Content */}
            <p className="text-gray-700 leading-relaxed mb-4">
                {testimonial.content}
            </p>

            {/* Rating */}
            <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={star <= testimonial.rating ? 'text-amber-400' : 'text-gray-200'}
                    >
                        ★
                    </span>
                ))}
            </div>

            {/* Author */}
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${isFeatured ? 'bg-[#2EBD59]' : 'bg-gray-400'
                    }`}>
                    {testimonial.avatarUrl ? (
                        <img
                            src={testimonial.avatarUrl}
                            alt={testimonial.authorName}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        testimonial.authorName.charAt(0).toUpperCase()
                    )}
                </div>
                <div>
                    <div className="font-semibold text-gray-900">
                        {testimonial.authorName}
                    </div>
                    {testimonial.authorTitle && (
                        <div className="text-sm text-gray-500">
                            {testimonial.authorTitle}
                        </div>
                    )}
                    {testimonial.courseName && (
                        <div className="text-xs text-[#2EBD59]">
                            Completed: {testimonial.courseName}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
