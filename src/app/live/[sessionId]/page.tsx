import { notFound } from "next/navigation";
import { getSession, isUserRegistered, registerForSession } from "@/lib/live";
import { LivePlayer, LivePolls } from "@/components/live";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface PageProps {
    params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: PageProps) {
    const { sessionId } = await params;
    const session = await getSession(sessionId);

    if (!session) {
        notFound();
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Redirect to login
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in Required</h1>
                    <p className="text-gray-600 mb-6">Please sign in to access live sessions</p>
                    <Link
                        href="/auth/login"
                        className="px-6 py-3 bg-[#2EBD59] text-white font-medium rounded-lg"
                    >
                        Sign In
                    </Link>
                </div>
            </main>
        );
    }

    // Get user profile for tier
    const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier, role")
        .eq("id", user.id)
        .single();

    const userTier = profile?.subscription_tier || "free";
    const isAdmin = profile?.role === "admin";

    // Check tier access
    const tierOrder = ["free", "basic", "medium", "advanced"];
    const userTierIndex = tierOrder.indexOf(userTier);
    const requiredTierIndex = tierOrder.indexOf(session.min_tier);
    const hasAccess = isAdmin || userTierIndex >= requiredTierIndex;

    if (!hasAccess) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Required</h1>
                    <p className="text-gray-600 mb-6">
                        This session requires <span className="font-semibold capitalize">{session.min_tier}</span> tier or higher
                    </p>
                    <Link
                        href="/pricing"
                        className="px-6 py-3 bg-[#2EBD59] text-white font-medium rounded-lg"
                    >
                        Upgrade Now
                    </Link>
                </div>
            </main>
        );
    }

    // Check/create registration
    const isRegistered = await isUserRegistered(session.id, user.id);
    if (!isRegistered) {
        await registerForSession(session.id, user.id);
    }

    return (
        <main className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <nav className="mb-4">
                    <Link href="/live" className="text-sm text-[#2EBD59] hover:underline">
                        ← Back to Live Sessions
                    </Link>
                </nav>

                {/* Live Player */}
                <LivePlayer
                    session={session}
                    userId={user.id}
                    userTier={userTier}
                    isAdmin={isAdmin}
                />

                {/* Polls Section (below player on mobile) */}
                {session.status === "live" && (
                    <div className="mt-6 lg:hidden">
                        <LivePolls
                            sessionId={session.id}
                            userId={user.id}
                            isAdmin={isAdmin}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
