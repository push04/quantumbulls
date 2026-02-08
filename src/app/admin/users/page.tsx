import { createClient } from "@/lib/supabase/server";
import { updateUserRole } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    const supabase = await createClient();
    const { data: users, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching users:", error);
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">User Management</h1>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {error ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-red-500">
                                    Error loading users: {error.message}
                                </td>
                            </tr>
                        ) : !users || users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                                                {user.full_name ? user.full_name.substring(0, 2) : "UO"}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.full_name || "Unknown User"}</div>
                                                <div className="text-xs text-gray-500">{user.email || "No email visible"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'pro' ? 'bg-green-100 text-green-700' :
                                                user.role === 'banned' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {user.role ? user.role.toUpperCase() : "USER"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <form className="inline-flex gap-2">
                                            {user.role !== 'admin' && (
                                                <button
                                                    formAction={async () => {
                                                        "use server";
                                                        await updateUserRole(user.id, "admin");
                                                    }}
                                                    className="text-xs text-purple-600 hover:text-purple-800 font-medium px-2 py-1 hover:bg-purple-50 rounded transition-colors"
                                                >
                                                    Promote
                                                </button>
                                            )}
                                            {user.role !== 'banned' ? (
                                                <button
                                                    formAction={async () => {
                                                        "use server";
                                                        await updateUserRole(user.id, "banned");
                                                    }}
                                                    className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-100 rounded transition-colors"
                                                >
                                                    Ban
                                                </button>
                                            ) : (
                                                <button
                                                    formAction={async () => {
                                                        "use server";
                                                        await updateUserRole(user.id, "user");
                                                    }}
                                                    className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 hover:bg-green-50 rounded transition-colors"
                                                >
                                                    Unban
                                                </button>
                                            )}
                                        </form>
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
