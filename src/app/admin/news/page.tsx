import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { deleteNews } from "./actions";

export default async function AdminNewsPage() {
    const supabase = await createClient();
    const { data: news } = await supabase.from("market_news").select("*").order("published_at", { ascending: false });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Manage News</h1>
                <Link
                    href="/admin/news/create"
                    className="px-4 py-2 bg-[#2EBD59] text-white rounded-lg hover:bg-[#26a34d] transition-colors flex items-center gap-2"
                >
                    <span>+</span> Add News
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Source</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {!news || news.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No news items found.
                                </td>
                            </tr>
                        ) : (
                            news.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 truncate max-w-xs">{item.title}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.source || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(item.published_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/news/${item.id}`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                ✏️
                                            </Link>
                                            <form action={async () => {
                                                "use server";
                                                await deleteNews(item.id);
                                            }}>
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
