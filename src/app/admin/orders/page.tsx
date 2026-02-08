import { createClient } from "@/lib/supabase/server";
import { approveOrder, rejectOrder } from "./actions";

export default async function AdminOrdersPage() {
    const supabase = await createClient();

    // Fetch orders with user details
    const { data: orders, error } = await supabase
        .from("payment_orders")
        .select("*, user:profiles(full_name, email)")
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Payment Orders</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders?.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{order.user?.full_name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">{order.user?.email}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-900">{order.description}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    ₹{(order.amount / 100).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {order.status === 'manual_verification_pending' && (
                                        <div className="flex items-center justify-end gap-2">
                                            <form action={async () => {
                                                "use server";
                                                await approveOrder(order.id, order.user_id, order.metadata);
                                            }}>
                                                <button className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded hover:bg-green-100 transition-colors">
                                                    Approve
                                                </button>
                                            </form>
                                            <form action={async () => {
                                                "use server";
                                                await rejectOrder(order.id);
                                            }}>
                                                <button className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded hover:bg-red-100 transition-colors">
                                                    Reject
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {(!orders || orders.length === 0) && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        paid: "bg-green-100 text-green-700",
        created: "bg-gray-100 text-gray-700",
        failed: "bg-red-100 text-red-700",
        manual_verification_pending: "bg-yellow-100 text-yellow-700",
        rejected: "bg-red-100 text-red-700 line-through"
    };

    const labels = {
        paid: "Paid",
        created: "Initiated",
        failed: "Failed",
        manual_verification_pending: "Approval Pending",
        rejected: "Rejected"
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700"}`}>
            {labels[status as keyof typeof labels] || status}
        </span>
    );
}
