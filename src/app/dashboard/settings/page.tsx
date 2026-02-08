import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/signin");

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-12 p-6 lg:p-10">

            {/* Header */}
            <header className="relative bg-white rounded-[2rem] p-10 overflow-hidden border border-gray-100 shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Account Settings</h1>
                    <p className="text-lg text-gray-500">Manage your profile securely.</p>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Profile Section */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
                            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                            <p className="text-sm text-gray-500 mt-1">Update your personal details here.</p>
                        </div>
                        <div className="p-8 md:p-10">
                            <form className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Full Name</label>
                                        <input
                                            type="text"
                                            defaultValue={profile?.full_name || ""}
                                            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#2EBD59]/10 focus:border-[#2EBD59] transition-all bg-gray-50/30 focus:bg-white text-gray-900 font-medium"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Email Address</label>
                                        <input
                                            type="email"
                                            defaultValue={user.email}
                                            disabled
                                            className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed font-medium"
                                        />
                                        <p className="text-xs text-gray-400 font-medium">Email cannot be changed.</p>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button className="px-8 py-4 bg-[#0B0F19] text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
                            <h2 className="text-xl font-bold text-gray-900">Security & Password</h2>
                            <p className="text-sm text-gray-500 mt-1">Manage your account security.</p>
                        </div>
                        <div className="p-8 md:p-10">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Password</h3>
                                    <p className="text-sm text-gray-500 mt-1">Last changed 3 months ago</p>
                                </div>
                                <button className="px-6 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-[2rem] border border-red-100 bg-red-100/30 overflow-hidden">
                        <div className="p-8 md:p-10 flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-red-600 mb-1">Delete Account</h2>
                                <p className="text-sm text-red-400">Permanently delete your account and all of your content.</p>
                            </div>
                            <button className="px-6 py-3 bg-white text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition-all shadow-sm">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
