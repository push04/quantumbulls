"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SessionGuardProps {
    children: React.ReactNode;
    userId: string;
}

export default function SessionGuard({ children, userId }: SessionGuardProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isValid, setIsValid] = useState(true);
    const [showWarning, setShowWarning] = useState(false);
    const hasValidatedRef = useRef(false);

    useEffect(() => {
        // Skip if already validated on first render
        if (hasValidatedRef.current) return;
        hasValidatedRef.current = true;

        const validateSession = async () => {
            const localSessionId = localStorage.getItem("session_id");

            if (!localSessionId) {
                // No local session, force logout
                await supabase.auth.signOut();
                router.push("/signin?error=session_expired");
                return;
            }

            // Fetch active session from database
            const { data: profile, error } = await supabase
                .from("profiles")
                .select("active_session_id")
                .eq("id", userId)
                .single();

            if (error) {
                console.error("Session validation error:", error);
                return;
            }

            if (profile && profile.active_session_id !== localSessionId) {
                // Session mismatch - another device logged in
                setShowWarning(true);
                setIsValid(false);

                // Wait 3 seconds to show message, then logout
                setTimeout(async () => {
                    localStorage.removeItem("session_id");
                    await supabase.auth.signOut();
                    router.push("/signin?error=session_conflict");
                }, 3000);
            }
        };

        // Run initial validation
        validateSession();

        // Set up interval for periodic validation
        const interval = setInterval(() => {
            const localSessionId = localStorage.getItem("session_id");

            if (!localSessionId) {
                supabase.auth.signOut();
                router.push("/signin?error=session_expired");
                return;
            }

            supabase
                .from("profiles")
                .select("active_session_id")
                .eq("id", userId)
                .single()
                .then(({ data: profile, error }) => {
                    if (error) {
                        console.error("Session validation error:", error);
                        return;
                    }

                    if (profile && profile.active_session_id !== localSessionId) {
                        setShowWarning(true);
                        setIsValid(false);
                        setTimeout(async () => {
                            localStorage.removeItem("session_id");
                            await supabase.auth.signOut();
                            router.push("/signin?error=session_conflict");
                        }, 3000);
                    }
                });
        }, 30000);

        // Set up realtime subscription for instant detection
        const channel = supabase
            .channel("session-changes")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "profiles",
                    filter: `id=eq.${userId}`,
                },
                (payload) => {
                    const localSessionId = localStorage.getItem("session_id");
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if ((payload.new as any).active_session_id !== localSessionId) {
                        setShowWarning(true);
                        setIsValid(false);
                        setTimeout(async () => {
                            localStorage.removeItem("session_id");
                            await supabase.auth.signOut();
                            router.push("/signin?error=session_conflict");
                        }, 3000);
                    }
                }
            )
            .subscribe();

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
        };
    }, [userId, supabase, router]);

    if (showWarning || !isValid) {
        return (
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl animate-fade-in">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
                        <svg
                            className="h-8 w-8 text-amber-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Session Ended
                    </h3>
                    <p className="text-gray-600 mb-4">
                        You&apos;ve been logged out because you logged in from another device.
                    </p>
                    <p className="text-sm text-gray-400">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
