import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";

export const metadata = {
    title: "Admin Dashboard | Quantum Bull",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50">
                <AdminSidebar />
                <div className="md:ml-64 pt-6 px-6 pb-12">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}
