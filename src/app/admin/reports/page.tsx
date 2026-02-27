import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function AdminReportsPage() {
    const supabase = await createClient();
    const { data: reports } = await supabase.from("user_reports").select("*").order("created_at", { ascending: false });

    async function updateReportStatus(id: string, status: string) {
        "use server";
        const supabase = await createClient();
        await supabase.from("user_reports").update({ status }).eq("id", id);
        revalidatePath("/admin/reports");
    }

    async function deleteReport(id: string) {
        "use server";
        const supabase = await createClient();
        await supabase.from("user_reports").delete().eq("id", id);
        revalidatePath("/admin/reports");
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">User Reports</h1>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Reporter</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Content</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {!reports || reports.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No reports found.</td>
                            </tr>
                        ) : (
                            reports.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{report.reporter_id || 'Anonymous'}</div>
                                        <div className="text-xs text-gray-500">{new Date(report.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                            {report.report_type || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                                        {report.reason || report.content}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                            report.status === 'dismissed' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {report.status?.toUpperCase() || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {report.status !== 'resolved' && (
                                                <form action={async () => { "use server"; await updateReportStatus(report.id, 'resolved'); }}>
                                                    <button className="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded">Resolve</button>
                                                </form>
                                            )}
                                            {report.status !== 'dismissed' && (
                                                <form action={async () => { "use server"; await updateReportStatus(report.id, 'dismissed'); }}>
                                                    <button className="text-xs text-gray-600 hover:bg-gray-50 px-2 py-1 rounded">Dismiss</button>
                                                </form>
                                            )}
                                            <form action={async () => { "use server"; await deleteReport(report.id); }}>
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
