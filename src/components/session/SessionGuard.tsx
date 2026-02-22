"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validateSession, clearLocalSession } from "@/lib/session";

interface SessionGuardProps {
    children: React.ReactNode;
    checkInterval?: number; // milliseconds
}

/**
 * SessionGuard Component
 * Validates session on mount and periodically
 * Redirects to login if session is invalid (logged in elsewhere)
 */
export default function SessionGuard({
    children,
    checkInterval = 30000 // 30 seconds default
}: SessionGuardProps) {
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();

        const checkSession = async () => {
            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    // Not logged in, redirect to signin
                    router.push("/signin");
                    return;
                }

                // Validate session
                const { valid, conflictSession } = await validateSession(user.id);

                if (!valid) {
                    // Session invalid - logged in elsewhere
                    clearLocalSession();
                    await supabase.auth.signOut();

                    // Redirect with conflict info
                    const message = conflictSession
                        ? `You were logged out because someone logged in from ${conflictSession.device_name}`
                        : "Your session expired. Please log in again.";
                    
                    router.push(`/signin?message=${encodeURIComponent(message)}`);
                }
            } catch (error) {
                console.error("Session check failed:", error);
            }
        };

        const intervalId: NodeJS.Timeout = setInterval(checkSession, checkInterval);

        // Initial check
        checkSession();

        // Cleanup
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [router, checkInterval]);

    return <>{children}</>;
}
