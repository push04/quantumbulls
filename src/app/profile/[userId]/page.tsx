import { CommunityProfile } from "@/components/community";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { userId } = await params;
    const supabase = await createClient();
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).single();

    return {
        title: `${profile?.full_name || "User"} | Quantum Bull Profile`,
    };
}

export default async function ProfilePage({ params }: PageProps) {
    const { userId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if user exists
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", userId).single();
    if (!profile) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <CommunityProfile
                    userId={userId}
                    currentUserId={user?.id}
                />
            </div>
        </main>
    );
}
