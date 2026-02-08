import { createClient } from "@/lib/supabase/server";
import { updateTestimonialStatus, deleteTestimonial } from "./actions";

export default async function AdminTestimonialsPage() {
    const supabase = await createClient();
    const { data: testimonials } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Testimonials</h1>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Author</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Content</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {!testimonials || testimonials.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No testimonials found.
                                </td>
                            </tr>
                        ) : (
                            testimonials.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {t.avatar_url && (
                                                <img src={t.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">{t.author_name}</div>
                                                <div className="text-xs text-gray-500">{t.author_title}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                                        {t.content}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {t.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="inline-flex gap-2">
                                            {t.status !== 'approved' && (
                                                <form action={async () => {
                                                    "use server";
                                                    await updateTestimonialStatus(t.id, 'approved');
                                                }}>
                                                    <button className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded">Approve</button>
                                                </form>
                                            )}
                                            {t.status !== 'rejected' && (
                                                <form action={async () => {
                                                    "use server";
                                                    await updateTestimonialStatus(t.id, 'rejected');
                                                }}>
                                                    <button className="text-xs text-yellow-600 hover:bg-yellow-50 px-2 py-1 rounded">Reject</button>
                                                </form>
                                            )}
                                            <form action={async () => {
                                                "use server";
                                                await deleteTestimonial(t.id);
                                            }}>
                                                <button className="text-xs text-red-600 hover:bg-red-100 px-2 py-1 rounded">Delete</button>
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
