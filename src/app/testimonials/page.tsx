import { createClient } from "@/lib/supabase/server";

export const metadata = {
    title: "Testimonials | Quantum Bull",
};

export default async function TestimonialsPage() {
    const supabase = await createClient();
    const { data: testimonials } = await supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

    return (
        <main className="min-h-screen bg-white pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4">What Our Traders Say</h1>
                <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                    Hear from our community of successful traders who have transformed their journey with Quantum Bull.
                </p>

                {!testimonials || testimonials.length === 0 ? (
                    <div className="p-12 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-gray-500 italic">"Be the first to share your success story!"</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow relative">
                                {/* Quote Icon */}
                                <div className="absolute top-6 right-8 text-4xl text-gray-200 font-serif">"</div>

                                <div className="flex items-center gap-4 mb-6">
                                    {testimonial.avatar_url ? (
                                        <img src={testimonial.avatar_url} alt={testimonial.author_name} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                            {testimonial.author_name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-gray-900">{testimonial.author_name}</h3>
                                        {testimonial.author_title && (
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">{testimonial.author_title}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-5 h-5 ${i < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>

                                <p className="text-gray-700 leading-relaxed">
                                    {testimonial.content}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
