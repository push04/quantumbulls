import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { deleteSession } from "./actions";

export default async function AdminSessionsPage() {
    const supabase = await createClient();
    const { data: sessions } = await supabase
        .from("live_sessions")
        .select("*, instructor:profiles(full_name)")
        .order("scheduled_at", { ascending: true });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Manage Live Sessions</h1>
                <Link
                    href="/admin/sessions/create"
                    className="px-4 py-2 bg-[#2EBD59] text-white rounded-lg hover:bg-[#26a34d] transition-colors flex items-center gap-2"
                >
                    <span>+</span> New Session
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Instructor</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Scheduled</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {!sessions || sessions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No live sessions found.
                                </td>
                            </tr>
                        ) : (
                            sessions.map((session) => (
                                <tr key={session.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{session.title}</div>
                                        <div className="text-xs text-gray-500">{session.duration_minutes} min</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {session.instructor?.full_name || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            session.status === 'live' ? 'bg-green-100 text-green-700' :
                                            session.status === 'ended' ? 'bg-gray-100 text-gray-700' :
                                            session.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {session.status?.toUpperCase() || 'SCHEDULED'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/sessions/${session.id}`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                ✏️
                                            </Link>
                                            <form action={async () => {
                                                "use server";
                                                await deleteSession(session.id);
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
