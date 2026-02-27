import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminForumPage() {
    const supabase = await createClient();
    const { data: categories } = await supabase.from("forum_categories").select("*").order("name");

    async function createCategory(formData: FormData) {
        "use server";
        const supabase = await createClient();
        
        const name = formData.get("name") as string;
        const slug = (formData.get("slug") as string) || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        const description = formData.get("description") as string;
        const icon = formData.get("icon") as string;
        const color = formData.get("color") as string || "#2EBD59";
        const is_active = formData.get("is_active") === "on";

        if (!name) throw new Error("Category name is required");

        const { error } = await supabase.from("forum_categories").insert({
            name,
            slug,
            description,
            icon,
            color,
            is_active
        });

        if (error) throw new Error(error.message);
        revalidatePath("/admin/forum");
        redirect("/admin/forum");
    }

    async function deleteCategory(id: string) {
        "use server";
        const supabase = await createClient();
        const { error } = await supabase.from("forum_categories").delete().eq("id", id);
        if (error) throw new Error(error.message);
        revalidatePath("/admin/forum");
    }

    async function toggleActive(id: string, isActive: boolean) {
        "use server";
        const supabase = await createClient();
        await supabase.from("forum_categories").update({ is_active: !isActive }).eq("id", id);
        revalidatePath("/admin/forum");
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Forum Categories</h1>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Add New Category</h2>
                </div>
                <form action={createCategory} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input name="name" required className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                            <input name="slug" className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="auto-generated" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                            <input name="icon" className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="chat" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input name="color" type="color" defaultValue="#2EBD59" className="w-full h-10 border border-gray-200 rounded-lg" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                    </div>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="is_active" defaultChecked className="rounded" />
                        <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <button type="submit" className="px-4 py-2 bg-[#2EBD59] text-white rounded-lg hover:bg-[#26a34d]">Create Category</button>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Slug</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {!categories || categories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No categories found.</td>
                            </tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                            <span className="font-medium text-gray-900">{cat.name}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{cat.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{cat.slug}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {cat.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <form action={async () => { "use server"; await toggleActive(cat.id, cat.is_active); }}>
                                                <button className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">
                                                    {cat.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </form>
                                            <form action={async () => { "use server"; await deleteCategory(cat.id); }}>
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
