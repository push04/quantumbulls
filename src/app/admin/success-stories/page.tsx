import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminSuccessStoriesPage() {
    const supabase = await createClient();
    const { data: stories } = await supabase.from("success_stories").select("*").order("created_at", { ascending: false });

    async function createStory(formData: FormData) {
        "use server";
        const supabase = await createClient();
        
        const author_name = formData.get("author_name") as string;
        const author_title = formData.get("author_title") as string;
        const content = formData.get("content") as string;
        const avatar_url = formData.get("avatar_url") as string;
        const profit_percentage = parseInt(formData.get("profit_percentage") as string) || 0;
        const status = formData.get("status") as string || "pending";

        if (!author_name || !content) throw new Error("Author name and content are required");

        const { error } = await supabase.from("success_stories").insert({
            author_name,
            author_title,
            content,
            avatar_url,
            profit_percentage,
            status
        });

        if (error) throw new Error(error.message);
        revalidatePath("/admin/success-stories");
        redirect("/admin/success-stories");
    }

    async function deleteStory(id: string) {
        "use server";
        const supabase = await createClient();
        const { error } = await supabase.from("success_stories").delete().eq("id", id);
        if (error) throw new Error(error.message);
        revalidatePath("/admin/success-stories");
    }

    async function updateStatus(id: string, status: string) {
        "use server";
        const supabase = await createClient();
        await supabase.from("success_stories").update({ status }).eq("id", id);
        revalidatePath("/admin/success-stories");
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Success Stories</h1>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Add New Success Story</h2>
                </div>
                <form action={createStory} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Author Name *</label>
                            <input name="author_name" required className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Author Title</label>
                            <input name="author_title" className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="e.g., Pro Trader" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profit %</label>
                            <input name="profit_percentage" type="number" className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="e.g., 150" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select name="status" className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                        <input name="avatar_url" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                        <textarea name="content" required rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-[#2EBD59] text-white rounded-lg hover:bg-[#26a34d]">Create Story</button>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Author</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Story</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Profit</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {!stories || stories.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No success stories found.</td>
                            </tr>
                        ) : (
                            stories.map((story) => (
                                <tr key={story.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{story.author_name}</div>
                                        <div className="text-xs text-gray-500">{story.author_title}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">{story.content}</td>
                                    <td className="px-6 py-4 text-green-600 font-medium">{story.profit_percentage}%</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            story.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            story.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {story.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {story.status !== 'approved' && (
                                                <form action={async () => { "use server"; await updateStatus(story.id, 'approved'); }}>
                                                    <button className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded">Approve</button>
                                                </form>
                                            )}
                                            {story.status !== 'rejected' && (
                                                <form action={async () => { "use server"; await updateStatus(story.id, 'rejected'); }}>
                                                    <button className="text-xs text-yellow-600 hover:bg-yellow-50 px-2 py-1 rounded">Reject</button>
                                                </form>
                                            )}
                                            <form action={async () => { "use server"; await deleteStory(story.id); }}>
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
