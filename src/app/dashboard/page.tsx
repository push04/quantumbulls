import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/signin");
    }

    // Fetch user profile + stats in parallel
    const [profileResult, progressResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
            .from("user_lesson_progress")
            .select("lesson_id, completed, watch_time_seconds")
            .eq("user_id", user.id),
    ]);

    const profile = profileResult.data;
    const progressRows = progressResult.data || [];

    const completedLessons = progressRows.filter((r) => r.completed).length;
    const totalWatchSeconds = progressRows.reduce(
        (sum, r) => sum + (r.watch_time_seconds || 0),
        0
    );
    const watchHours = Math.round(totalWatchSeconds / 3600);

    // Unique course IDs enrolled = lessons with any progress
    const enrolledCourses = 0; // will be overridden once course-level join is available

    const stats = {
        completedLessons,
        watchHours,
        enrolledCourses,
    };

    return (
        <DashboardClient
            user={user}
            profile={profile}
            stats={stats}
        />
    );
}

