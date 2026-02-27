import { ThreadDetail } from "@/components/forum";
import { getThread } from "@/lib/community";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PageProps {
    params: Promise<{ threadId: string }>;
}

export default async function ThreadPage({ params }: PageProps) {
    const { threadId } = await params;
    const supabase = await createClient();

    // Get thread
    const thread = await getThread(threadId);
    if (!thread) {
        notFound();
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Check if user is thread author or admin
    let isAuthor = false;
    let isAdmin = false;

    if (user) {
        isAuthor = user.id === thread.author_id;
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
        isAdmin = profile?.role === "admin";
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <ThreadDetail
                    threadId={threadId}
                    userId={user?.id}
                    isAuthor={isAuthor}
                    isAdmin={isAdmin}
                />
            </div>
            </div>
            <Footer />
        </main>
    );
}
