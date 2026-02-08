import { createClient } from "@/lib/supabase/server";
import AnalysisForm from "../AnalysisForm";
import { notFound } from "next/navigation";

export default async function EditAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: analysis } = await supabase.from("market_analysis").select("*").eq("id", id).single();

    if (!analysis) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Market Analysis</h1>
            <AnalysisForm analysisHelper={analysis} isEditing={true} />
        </div>
    );
}
