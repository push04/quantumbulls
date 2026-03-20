import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
    title: "News | Quantum Bull",
    description: "Latest market news and updates",
};

function truncateWords(text: string, wordLimit: number): string {
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "…";
}

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    if (diffHrs < 1) return "Just now";
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function NewsPage() {
    const supabase = await createClient();
    const { data: newsItems } = await supabase
        .from('market_news')
        .select('*')
        .order('published_at', { ascending: false });

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto pt-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Market News</h1>
                        <p className="text-gray-500">Latest updates from the financial world</p>
                    </div>

                    {!newsItems || newsItems.length === 0 ? (
                        <div className="p-8 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                                📰
                            </div>
                            <p className="text-gray-500">No news updates available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {newsItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/news/${item.id}`}
                                    className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden flex flex-col"
                                >
                                    {/* Thumbnail */}
                                    {item.image_url ? (
                                        <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                                            <Image
                                                src={item.image_url}
                                                alt={item.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-44 w-full bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
                                            <span className="text-4xl opacity-30">📈</span>
                                        </div>
                                    )}

                                    {/* Card body */}
                                    <div className="flex flex-col flex-1 p-4">
                                        {/* Source + time row */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded uppercase tracking-wide">
                                                {item.source || "Market Update"}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {timeAgo(item.published_at)}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-base font-semibold text-gray-900 leading-snug mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                                            {item.title}
                                        </h2>

                                        {/* Excerpt */}
                                        {item.summary && (
                                            <p className="text-sm text-gray-500 leading-relaxed flex-1">
                                                {truncateWords(item.summary, 60)}
                                            </p>
                                        )}

                                        {/* Read more */}
                                        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center text-xs font-medium text-emerald-600 group-hover:text-emerald-700">
                                            Read more
                                            <svg className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
