import { createClient } from "@/lib/supabase/server";
import Icon from "@/components/ui/Icon";

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
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Market Analysis</h1>
                    <p className="text-lg sm:text-xl text-gray-600">
                        Stay ahead of the market with our daily breakdown of key levels and trends.
                    </p>
                </div>

                {!analyses || analyses.length === 0 ? (
                    <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Icon name="trending" size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-600">No analysis posts available yet.</h3>
                        <p className="text-gray-500 mt-2">Check back later for market updates.</p>
                    </div>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        {analyses.map((post, index) => (
                            <div 
                                key={post.id} 
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-md transition-all animate-fade-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${post.is_premium ? 'bg-purple-100 text-purple-600' : 'bg-[#2EBD59]/10 text-[#2EBD59]'
                                        }`}>
                                        {post.is_premium ? 'Premium Analysis' : 'Daily Update'}
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{post.title}</h2>
                                <p className="text-gray-600 mb-4">
                                    {post.summary || post.content.substring(0, 150) + "..."}
                                </p>
                                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Icon name="calendar" size={14} className="text-gray-400" />
                                        {new Date(post.published_at).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Icon name="users" size={14} className="text-gray-400" />
                                        By {post.author?.full_name || 'Quantum Bull Team'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
