import { createClient } from "@/lib/supabase/server";

export const metadata = {
    title: "News | Quantum Bull",
    description: "Latest market news and updates",
};

export default async function NewsPage() {
    const supabase = await createClient();
    const { data: newsItems } = await supabase
        .from('market_news')
        .select('*')
        .order('published_at', { ascending: false });

    return (
        <main className="min-h-screen bg-white pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6">Market News</h1>
                <p className="text-gray-600 mb-8">Latest updates from the financial world.</p>

                {!newsItems || newsItems.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-xl">
                        <p className="text-gray-500">No news updates available at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {newsItems.map((item) => (
                            <div key={item.id} className="py-6 border-b border-gray-100 last:border-0">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-blue-600 uppercase">
                                        {item.source || 'Market Update'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(item.published_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    {item.url ? (
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                                            {item.title}
                                        </a>
                                    ) : (
                                        item.title
                                    )}
                                </h3>
                                {item.summary && (
                                    <p className="text-gray-600 text-sm leading-relaxed">{item.summary}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
