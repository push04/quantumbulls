import { createClient } from "@/lib/supabase/server";
import Icon from "@/components/ui/Icon";

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
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Market News</h1>
                <p className="text-gray-600 mb-8">Latest updates from the financial world.</p>

                {!newsItems || newsItems.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Icon name="file" size={24} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500">No news updates available at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        {newsItems.map((item, index) => (
                            <div 
                                key={item.id} 
                                className="py-4 sm:py-6 border-b border-gray-100 last:border-0 animate-fade-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-blue-600 uppercase">
                                        {item.source || 'Market Update'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(item.published_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                                    {item.url ? (
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors flex items-center gap-2">
                                            {item.title}
                                            <Icon name="external" size={14} className="text-gray-400" />
                                        </a>
                                    ) : (
                                        item.title
                                    )}
                                </h3>
                                {item.summary && (
                                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{item.summary}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
