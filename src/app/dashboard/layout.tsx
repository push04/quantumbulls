import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import SessionGuard from "@/components/SessionGuard";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/signin");
    }

    return (
        <SessionGuard userId={user.id}>
            <div className="min-h-screen bg-[#F8FAFC]">
                <Sidebar />
                <main className="lg:pl-72 transition-all duration-300">
                    {children}
                </main>
            </div>
        </SessionGuard>
    );
}
