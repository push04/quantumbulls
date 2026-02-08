import { createClient } from "@/lib/supabase/server";

export const metadata = {
    title: "Daily Analysis | Quantum Bull",
    description: "Daily market analysis and trading insights",
};

export default async function AnalysisPage() {
    const supabase = await createClient();
    const { data: analyses } = await supabase
        .from('market_analysis')
        .select(`
            *,
            author:author_id(full_name)
        `)
        .order('published_at', { ascending: false });

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Market Analysis</h1>
                    <p className="text-xl text-gray-600">
                        Stay ahead of the market with our daily breakdown of key levels and trends.
                    </p>
                </div>

                {!analyses || analyses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                        <h3 className="text-xl font-medium text-gray-600">No analysis posts available yet.</h3>
                        <p className="text-gray-500 mt-2">Check back later for market updates.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {analyses.map((post) => (
                            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <span className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${post.is_premium ? 'text-purple-600' : 'text-[#2EBD59]'
                                    }`}>
                                    {post.is_premium ? 'Premium Analysis' : 'Daily Update'}
                                </span>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h2>
                                <p className="text-gray-600 mb-4">
                                    {post.summary || post.content.substring(0, 150) + "..."}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>{new Date(post.published_at).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>By {post.author?.full_name || 'Quantum Bull Team'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
