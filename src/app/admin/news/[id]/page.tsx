import { createClient } from "@/lib/supabase/server";
import NewsForm from "../NewsForm";
import { notFound } from "next/navigation";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: news } = await supabase.from("market_news").select("*").eq("id", id).single();

    if (!news) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit News Item</h1>
            <NewsForm newsHelper={news} isEditing={true} />
        </div>
    );
}
