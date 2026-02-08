import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SessionGuard from "@/components/SessionGuard";

export default async function EnrolledCoursesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/signin");

    // Fetch available courses
    const { data: courses } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

    // Fetch user profile for tier access
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userTier = profile?.role || "free";

    const tierHierarchy = { free: 0, basic: 1, pro: 2, mentor: 3 };
    const getTierValue = (t: string) => tierHierarchy[t as keyof typeof tierHierarchy] || 0;

    // Calculate progress for each course to show "Start" vs "Continue"
    const coursesWithStatus = await Promise.all(
        (courses || []).map(async (course) => {
            const { data: progress } = await supabase.rpc("get_course_progress", {
                p_user_id: user.id,
                p_course_id: course.id
            });
            return { ...course, progress: progress || 0 };
        })
    );

    return (
        <div className="space-y-10 pb-12 p-6 lg:p-10 max-w-7xl mx-auto">
            <header className="relative bg-white rounded-3xl p-8 md:p-12 overflow-hidden border border-gray-100 shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Explore Courses</h1>
                    <p className="text-lg text-gray-500 leading-relaxed">
                        Master trading with our structured learning paths. From beginner basics to advanced algorithmic strategies.
                    </p>
                </div>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {coursesWithStatus.map(course => {
                    const isLocked = getTierValue(userTier) < getTierValue(course.tier || 'free');
                    const progress = course.progress;
                    const isStarted = progress > 0;

                    return (
                        <Link
                            href={isLocked ? '/pricing' : `/dashboard/courses/${course.slug}`}
                            key={course.id}
                            className="block group h-full"
                        >
                            <div className={`h-full bg-white rounded-[2rem] overflow-hidden transition-all duration-500 flex flex-col border border-gray-100 ${isLocked ? 'hover:shadow-lg' : 'hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2'
                                }`}>
                                {/* Thumbnail Container */}
                                <div className="h-60 relative overflow-hidden bg-gray-100">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isLocked ? 'grayscale-[0.5]' : ''}`}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                            <span className="text-6xl opacity-20">📊</span>
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className={`absolute inset-0 transition-opacity duration-300 ${isLocked ? 'bg-black/40' : 'bg-black/0 group-hover:bg-black/10'}`} />

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-900 shadow-sm border border-white/50">
                                            {course.difficulty}
                                        </span>
                                    </div>

                                    {/* Lock Overlay */}
                                    {isLocked && (
                                        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
                                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-2xl">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content Details */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${course.tier === 'free' ? 'text-[#2EBD59]' :
                                                course.tier === 'pro' ? 'text-purple-600' : 'text-amber-500'
                                                }`}>
                                                {course.tier === 'free' ? 'Free Course' : `${course.tier} Plan`}
                                            </span>
                                            {isStarted && !isLocked && (
                                                <span className="text-xs font-bold text-gray-400">{progress}% Complete</span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-[#2EBD59] transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                            {course.description}
                                        </p>
                                    </div>

                                    <div className="mt-auto">
                                        {isLocked ? (
                                            <button className="w-full py-3.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-bold text-sm hover:border-[#2EBD59] hover:text-[#2EBD59] hover:bg-[#2EBD59]/5 transition-all flex items-center justify-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                Upgrade to Unlock
                                            </button>
                                        ) : (
                                            <div>
                                                {isStarted ? (
                                                    <div className="space-y-3">
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                            <div className="bg-[#2EBD59] h-full rounded-full" style={{ width: `${progress}%` }} />
                                                        </div>
                                                        <button className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                                                            Resume Learning
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button className="w-full py-3.5 bg-gray-50 text-gray-900 rounded-xl font-bold text-sm hover:bg-[#2EBD59] hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-[#2EBD59]/20 flex items-center justify-center gap-2 group-hover:bg-[#2EBD59] group-hover:text-white">
                                                        Start Course
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
