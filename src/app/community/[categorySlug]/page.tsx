import { ThreadList } from "@/components/forum";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PageProps {
    params: Promise<{ categorySlug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { categorySlug } = await params;
    const supabase = await createClient();

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
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <nav className="mb-4 text-sm">
                    <Link href="/community" className="text-[#2EBD59] hover:underline">
                        ← Back to Community
                    </Link>
                </nav>

                {/* Thread List */}
                <ThreadList
                    categoryId={category.id}
                    categorySlug={category.slug}
                    categoryName={`${category.icon || ""} ${category.name}`}
                />
            </div>
            </div>
            <Footer />
        </main>
    );
}
