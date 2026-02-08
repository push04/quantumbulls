import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";

export const metadata = {
    title: "Admin Dashboard | Quantum Bull",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="md:ml-64 pt-24 px-8 pb-12">
                    {children}
                </div>
            </div>
        </AdminGuard>
    );
}
