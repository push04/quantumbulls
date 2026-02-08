import { CreateThreadForm } from "@/components/forum";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
    params: Promise<{ categorySlug: string }>;
}

export default async function NewThreadPage({ params }: PageProps) {
    const { categorySlug } = await params;
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/auth/login?redirect=/community/" + categorySlug + "/new");
    }

    // Get category info
    const { data: category, error } = await supabase
        .from("forum_categories")
        .select("*")
        .eq("slug", categorySlug)
        .single();

    if (error || !category) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Breadcrumb */}
                <nav className="mb-4 text-sm text-gray-500">
                    <Link href="/community" className="text-[#2EBD59] hover:underline">Community</Link>
                    <span className="mx-2">→</span>
                    <Link href={`/community/${categorySlug}`} className="text-[#2EBD59] hover:underline">
                        {category.name}
                    </Link>
                    <span className="mx-2">→</span>
                    <span>New Thread</span>
                </nav>

                <CreateThreadForm
                    categoryId={category.id}
                    categorySlug={categorySlug}
                    userId={user.id}
                />
            </div>
        </main>
    );
}
