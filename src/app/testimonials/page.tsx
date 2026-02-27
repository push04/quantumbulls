import { createClient } from "@/lib/supabase/server";
import Icon from "@/components/ui/Icon";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

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
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />
            <div className="pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Our Traders Say</h1>
                <p className="text-lg sm:text-xl text-gray-600 mb-10 sm:mb-12 max-w-2xl mx-auto">
                    Hear from our community of successful traders who have transformed their journey with Quantum Bull.
                </p>

                {!testimonials || testimonials.length === 0 ? (
                    <div className="p-8 sm:p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Icon name="star" size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 italic">Be the first to share your success story!</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
                        {testimonials.map((testimonial, index) => (
                            <div 
                                key={testimonial.id} 
                                className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex items-center gap-4 mb-4 sm:mb-6">
                                    {testimonial.avatar_url ? (
                                        <img src={testimonial.avatar_url} alt={testimonial.author_name} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2EBD59] to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
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

                                <div className="flex mb-3 sm:mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Icon
                                            key={i}
                                            name="star"
                                            size={18}
                                            className={i < (testimonial.rating || 5) ? "text-yellow-400" : "text-gray-300"}
                                        />
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
            </div>
            <Footer />
        </main>
    );
}
