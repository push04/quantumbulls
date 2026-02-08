import { MessageInbox } from "@/components/community";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Messages | Quantum Bull",
    description: "Your private messages",
};

export default async function MessagesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login?redirect=/messages");
    }

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <MessageInbox userId={user.id} />
            </div>
        </main>
    );
}
