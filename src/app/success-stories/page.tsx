import { createClient } from "@/lib/supabase/server";
import TestimonialCard from "@/components/testimonials/TestimonialCard";
import Icon from "@/components/ui/Icon";

interface SuccessStory {
    id: string;
    title: string;
    content: string;
    beforeStory?: string;
    afterStory?: string;
    imageUrl?: string;
    authorName: string;
    createdAt: string;
}

export default async function SuccessStoriesPage() {
    const supabase = await createClient();

    // Fetch approved stories
    const { data: stories } = await supabase
        .from('success_stories')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

    // Fetch featured testimonials
    const { data: testimonials } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'approved')
        .eq('featured', true)
        .limit(6);

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-[#2EBD59] to-emerald-600 text-white py-16 md:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        Success Stories
                    </h1>
                    <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
                        Real traders, real results. See how Quantum Bull has transformed
                        the trading journey of our students.
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                {/* Featured Testimonials */}
                {testimonials && testimonials.length > 0 && (
                    <section className="mb-12 md:mb-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            What Our Students Say
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {testimonials.map((t) => (
                                <TestimonialCard
                                    key={t.id}
                                    testimonial={{
                                        id: t.id,
                                        authorName: t.author_name,
                                        authorTitle: t.author_title,
                                        avatarUrl: t.avatar_url,
                                        content: t.content,
                                        rating: t.rating,
                                        createdAt: t.created_at,
                                    }}
                                    variant="featured"
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Success Stories */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Transformation Stories
                    </h2>

                    {!stories || stories.length === 0 ? (
                        <div className="text-center py-12 md:py-16 bg-white rounded-2xl border border-gray-200">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <Icon name="book" size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No stories yet
                            </h3>
                            <p className="text-gray-500">
                                Be the first to share your success story!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 sm:space-y-8">
                            {stories.map((story: SuccessStory) => (
                                <article
                                    key={story.id}
                                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                                >
                                    {story.imageUrl && (
                                        <div className="h-48 sm:h-64 bg-gray-200">
                                            <img
                                                src={story.imageUrl}
                                                alt={story.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="p-5 sm:p-8">
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                                            {story.title}
                                        </h3>

                                        {/* Before/After */}
                                        {(story.beforeStory || story.afterStory) && (
                                            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                                                {story.beforeStory && (
                                                    <div className="p-4 bg-red-100 rounded-xl border border-red-100">
                                                        <div className="text-sm font-medium text-red-600 mb-2">
                                                            Before Quantum Bull
                                                        </div>
                                                        <p className="text-gray-700">
                                                            {story.beforeStory}
                                                        </p>
                                                    </div>
                                                )}
                                                {story.afterStory && (
                                                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                                        <div className="text-sm font-medium text-green-600 mb-2">
                                                            After Quantum Bull
                                                        </div>
                                                        <p className="text-gray-700">
                                                            {story.afterStory}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="prose prose-gray max-w-none">
                                            <p>{story.content}</p>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#2EBD59] flex items-center justify-center text-white font-bold">
                                                    {story.authorName.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {story.authorName}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {new Date(story.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* CTA */}
                <section className="mt-12 md:mt-16 text-center">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 text-white">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4">
                            Ready to Write Your Success Story?
                        </h2>
                        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
                            Join thousands of traders who have transformed their
                            trading with Quantum Bull education.
                        </p>
                        <a
                            href="/pricing"
                            className="inline-block px-6 sm:px-8 py-3 bg-[#2EBD59] hover:bg-[#26a34d] text-white font-semibold rounded-xl transition-all active:scale-95"
                        >
                            Start Learning Today
                        </a>
                    </div>
                </section>
            </div>
        </main>
    );
}
