import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CreateSessionPage() {
    const supabase = await createClient();

    async function createSession(formData: FormData) {
        "use server";
        const supabase = await createClient();

        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const scheduled_at = formData.get("scheduled_at") as string;
        const duration_minutes = parseInt(formData.get("duration_minutes") as string) || 60;
        const min_tier = formData.get("min_tier") as string || "free";

        if (!title || !scheduled_at) {
            throw new Error("Title and schedule are required");
        }

        const { error } = await supabase.from("live_sessions").insert({
            title,
            description,
            scheduled_at,
            duration_minutes,
            min_tier,
            status: 'scheduled',
        });

        if (error) {
            console.error("Error creating session:", error);
            throw new Error(error.message);
        }

        redirect("/admin/sessions");
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create Live Session</h1>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <form action={createSession} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Session Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                            placeholder="e.g., Weekly Market Analysis"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                            placeholder="What will be covered in this session?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Scheduled Date & Time *
                            </label>
                            <input
                                type="datetime-local"
                                name="scheduled_at"
                                required
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                name="duration_minutes"
                                defaultValue={60}
                                min={15}
                                max={180}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Tier Required
                        </label>
                        <select
                            name="min_tier"
                            defaultValue="free"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                        >
                            <option value="free">All Users (Free)</option>
                            <option value="basic">Basic</option>
                            <option value="medium">Medium</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#2EBD59] text-white rounded-lg hover:bg-[#26a34d] transition-colors"
                        >
                            Create Session
                        </button>
                        <a
                            href="/admin/sessions"
                            className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
