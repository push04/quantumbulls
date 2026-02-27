import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminPlansPage() {
    const supabase = await createClient();
    const { data: plans } = await supabase.from("subscription_plans").select("*").order("price", { ascending: true });

    async function createPlan(formData: FormData) {
        "use server";
        const supabase = await createClient();
        
        const name = formData.get("name") as string;
        const price = parseFloat(formData.get("price") as string) || 0;
        const interval = formData.get("interval") as string || "month";
        const interval_value = parseInt(formData.get("interval_value") as string) || 1;
        const features = (formData.get("features") as string).split("\n").filter(f => f.trim());
        const cta_text = formData.get("cta_text") as string;
        const is_popular = formData.get("is_popular") === "on";
        const is_active = formData.get("is_active") === "on";

        if (!name) throw new Error("Plan name is required");

        const { error } = await supabase.from("subscription_plans").insert({
            name,
            price,
            interval,
            interval_value,
            features,
            cta_text,
            is_popular,
            is_active
        });

        if (error) throw new Error(error.message);
        revalidatePath("/admin/plans");
        redirect("/admin/plans");
    }

    async function deletePlan(id: string) {
        "use server";
        const supabase = await createClient();
        const { error } = await supabase.from("subscription_plans").delete().eq("id", id);
        if (error) throw new Error(error.message);
        revalidatePath("/admin/plans");
    }

    async function togglePopular(id: string, isPopular: boolean) {
        "use server";
        const supabase = await createClient();
        await supabase.from("subscription_plans").update({ is_popular: !isPopular }).eq("id", id);
        revalidatePath("/admin/plans");
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Create New Plan</h2>
                </div>
                <form action={createPlan} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                            <input name="name" required className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="e.g., Pro" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)</label>
                            <input name="price" type="number" step="0.01" defaultValue="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                            <select name="interval" className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                                <option value="day">Daily</option>
                                <option value="week">Weekly</option>
                                <option value="month" selected>Monthly</option>
                                <option value="year">Yearly</option>
                                <option value="lifetime">Lifetime</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Interval Value</label>
                            <input name="interval_value" type="number" defaultValue="1" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                            <input name="cta_text" className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="e.g., Get Started" />
                        </div>
                        <div className="flex items-center gap-6 pt-6">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="is_popular" className="rounded" />
                                <span className="text-sm text-gray-700">Popular</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" name="is_active" defaultChecked className="rounded" />
                                <span className="text-sm text-gray-700">Active</span>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                        <textarea name="features" rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Feature 1&#10;Feature 2&#10;Feature 3" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-[#2EBD59] text-white rounded-lg hover:bg-[#26a34d]">Create Plan</button>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Interval</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {!plans || plans.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No plans found.</td>
                            </tr>
                        ) : (
                            plans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{plan.name}</span>
                                            {plan.is_popular && <span className="px-2 py-0.5 bg-[#2EBD59] text-white text-xs rounded-full">Popular</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">Rs.{plan.price}</td>
                                    <td className="px-6 py-4 text-gray-600">{plan.interval_value} {plan.interval}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {plan.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <form action={async () => {
                                                "use server";
                                                await togglePopular(plan.id, plan.is_popular);
                                            }}>
                                                <button className="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">
                                                    {plan.is_popular ? 'Remove Popular' : 'Make Popular'}
                                                </button>
                                            </form>
                                            <form action={async () => {
                                                "use server";
                                                await deletePlan(plan.id);
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
