import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default async function HomeTestimonials() {
    const supabase = await createClient();
    const { data: testimonials } = await supabase
        .from("testimonials")
        .select("id, author_name, author_title, avatar_url, content, rating")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(3);

    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
                    <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full mb-4 uppercase tracking-wider">
                        Success Stories
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        What Our Traders <span className="text-[#2EBD59]">Say</span>
                    </h2>
                    <p className="text-lg text-gray-500">
                        Real results from real traders who transformed their journey with Quantum Bull.
                    </p>
                </div>

                {/* Testimonial Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {testimonials.map((t, index) => (
                        <div
                            key={t.id}
                            className={`relative rounded-2xl p-6 lg:p-8 border transition-all duration-300 hover:shadow-xl ${
                                index === 1
                                    ? "bg-gradient-to-br from-[#2EBD59] to-emerald-600 border-transparent text-white"
                                    : "bg-white border-gray-100 hover:border-[#2EBD59]/30"
                            }`}
                        >
                            {/* Quote mark */}
                            <div className={`text-5xl font-serif leading-none mb-4 ${index === 1 ? "text-white/30" : "text-[#2EBD59]/20"}`}>
                                &ldquo;
                            </div>

                            {/* Content */}
                            <p className={`leading-relaxed mb-6 text-sm sm:text-base ${index === 1 ? "text-white/90" : "text-gray-600"}`}>
                                {t.content}
                            </p>

                            {/* Stars */}
                            <div className="flex gap-0.5 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Icon
                                        key={star}
                                        name="star"
                                        size={16}
                                        className={star <= (t.rating || 5)
                                            ? index === 1 ? "text-amber-300" : "text-amber-400"
                                            : index === 1 ? "text-white/20" : "text-gray-200"
                                        }
                                    />
                                ))}
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                {t.avatar_url ? (
                                    <Image
                                        src={t.avatar_url}
                                        alt={t.author_name}
                                        width={44}
                                        height={44}
                                        className="w-11 h-11 rounded-full object-cover ring-2 ring-white/20"
                                    />
                                ) : (
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold ${
                                        index === 1
                                            ? "bg-white/20 text-white"
                                            : "bg-[#2EBD59]/10 text-[#2EBD59]"
                                    }`}>
                                        {t.author_name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className={`font-semibold ${index === 1 ? "text-white" : "text-gray-900"}`}>
                                        {t.author_name}
                                    </p>
                                    {t.author_title && (
                                        <p className={`text-xs ${index === 1 ? "text-white/70" : "text-gray-400"}`}>
                                            {t.author_title}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-10">
                    <Link
                        href="/testimonials"
                        className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#2EBD59] text-[#2EBD59] hover:bg-[#2EBD59] hover:text-white font-semibold rounded-xl transition-all"
                    >
                        View All Stories
                        <Icon name="arrow-right" size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
