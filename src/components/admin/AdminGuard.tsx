"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/signin?redirect=/admin");
                return;
            }

            // Check role in profiles table
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role === "admin" || profile?.role === "superadmin") {
                setIsAuthorized(true);
            } else {
                router.replace("/dashboard"); // Redirect non-admins
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [router, supabase]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EBD59]"></div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return <>{children}</>;
}
