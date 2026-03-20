import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function NewsArticlePage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: article, error } = await supabase
        .from('market_news')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !article) {
        notFound();
    }

    const publishedDate = new Date(article.published_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto pt-8">
                    {/* Breadcrumb */}
                    <nav className="mb-6 text-sm text-gray-500">
                        <Link href="/news" className="text-emerald-600 hover:underline">News</Link>
                        <span className="mx-2">→</span>
                        <span className="truncate">{article.title}</span>
                    </nav>

                    <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Hero image */}
                        {article.image_url && (
                            <div className="relative h-64 sm:h-80 w-full bg-gray-100">
                                <Image
                                    src={article.image_url}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                    priority
                                />
                            </div>
                        )}

                        <div className="p-6 sm:p-8">
                            {/* Source + date */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded uppercase tracking-wide">
                                    {article.source || "Market Update"}
                                </span>
                                <span className="text-sm text-gray-400">{publishedDate}</span>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-6">
                                {article.title}
                            </h1>

                            {/* Body */}
                            {article.summary ? (
                                <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                                    {article.summary}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No content available for this article.</p>
                            )}

                            {/* External link */}
                            {article.url && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors"
                                    >
                                        Read Original Article
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            )}
                        </div>
                    </article>

                    {/* Back link */}
                    <div className="mt-6">
                        <Link href="/news" className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to News
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
