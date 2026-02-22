import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProgressPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/signin");

    // 1. Fetch all active courses
    const { data: courses } = await supabase
        .from("courses")
        .select("id, title, slug, thumbnail_url, description, tier")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

    if (!courses) return <div>No courses found.</div>;

    // 2. Calculate progress for each
    const coursesWithProgress = await Promise.all(
        courses.map(async (course) => {
            const { data: progress } = await supabase.rpc("get_course_progress", {
                p_user_id: user.id,
                p_course_id: course.id
            });
            return { ...course, progress: progress || 0 };
        })
    );

    const inProgress = coursesWithProgress.filter(c => c.progress > 0 && c.progress < 100);
    const completed = coursesWithProgress.filter(c => c.progress === 100);
    const notStarted = coursesWithProgress.filter(c => c.progress === 0);

    const mostRecent = inProgress[0] || notStarted[0] || null;

    return (
        <div className="space-y-10 pb-12 p-6 lg:p-10 max-w-7xl mx-auto">

            {/* Hero Section - Compact "One Line" Style */}
            {mostRecent && (
                <div className="relative overflow-hidden rounded-2xl bg-gray-900 text-white shadow-xl group border border-white/10">
                    {/* Background Glows (Subtler) */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-[#0B0F19] to-black opacity-90" />
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#2EBD59] rounded-full blur-[100px] opacity-10 translate-x-1/3 -translate-y-1/3"></div>
                    </div>

                    {/* Content - Horizontal Layout */}
                    <div className="relative z-10 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Left: Checkmark & Title */}
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-[#2EBD59]/20 flex items-center justify-center border border-[#2EBD59]/30 shrink-0">
                                {mostRecent.progress > 0 ? (
                                    <svg className="w-5 h-5 text-[#2EBD59]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                ) : (
                                    <span className="text-xl">🚀</span>
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold leading-tight text-white mb-1">
                                    {mostRecent.title}
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span className="text-[#2EBD59] font-bold">{mostRecent.progress}% Completed</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                    <span className="line-clamp-1 max-w-md">{mostRecent.description}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                            <Link
                                href={`/dashboard/courses/${mostRecent.slug}`}
                                className="px-6 py-2.5 bg-[#2EBD59] hover:bg-[#26a34d] text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-[#2EBD59]/20 flex items-center gap-2"
                            >
                                {mostRecent.progress > 0 ? 'Resume' : 'Start'}
                            </Link>
                            <button className="p-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all" title="Add to Playlist">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Courses Enrolled", value: coursesWithProgress.length, icon: "📚", color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "In Progress", value: inProgress.length, icon: "🔥", color: "text-orange-500", bg: "bg-orange-500/10" },
                    { label: "Completed", value: completed.length, icon: "✅", color: "text-[#2EBD59]", bg: "bg-[#2EBD59]/10" },
                    { label: "Certificates", value: completed.length, icon: "🏆", color: "text-yellow-500", bg: "bg-yellow-500/10" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center text-xl`}>
                                {stat.icon}
                            </div>
                            <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                        </div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* In Progress Grid */}
            {inProgress.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Keep Going</h2>
                        <div className="h-1 flex-1 bg-gray-100 ml-6 rounded-full overflow-hidden max-w-xs hidden md:block">
                            <div className="h-full bg-gray-300 w-1/3 rounded-full"></div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {inProgress.map(course => (
                            <CourseProgressCard key={course.id} course={course} />
                        ))}
                    </div>
                </section>
            )}

            {/* Not Started / Explore */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Up Next</h2>
                    <Link href="/dashboard/courses" className="text-sm font-bold text-[#2EBD59] hover:underline">Browse Library &rarr;</Link>
                </div>
                {notStarted.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {notStarted.slice(0, 4).map(course => (
                            <Link key={course.id} href={`/dashboard/courses/${course.slug}`} className="group relative block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="h-40 bg-gray-200 relative overflow-hidden">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-800 text-white/20">📚</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        </div>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                            {course.tier?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 leading-relaxed group-hover:text-[#2EBD59] transition-colors">{course.title}</h3>
                                    <p className="text-xs text-gray-400 font-medium">Click to Start</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                        <p className="text-gray-500">You&apos;re up to date! Check the course library for more.</p>
                    </div>
                )}
            </section>
        </div>
    );
}


interface Course {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    description: string | null;
    tier: string;
    progress: number;
}

function CourseProgressCard({ course, completed = false }: { course: Course, completed?: boolean }) {
    return (
        <Link href={`/dashboard/courses/${course.slug}`} className="group block bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1">
            <div className="h-48 relative overflow-hidden bg-gray-900">
                {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-white/20">📚</div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                <div className="absolute bottom-4 left-6 right-6">
                    <span className="text-[10px] font-bold text-[#2EBD59] uppercase tracking-wider mb-2 block animate-pulse">
                        {completed ? 'Completed' : 'In Progress'}
                    </span>
                    <h3 className="text-xl font-bold text-white leading-tight mb-0 group-hover:text-[#2EBD59] transition-colors">
                        {course.title}
                    </h3>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-6">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${completed ? 'bg-orange-500' : 'bg-[#2EBD59]'}`}
                        style={{ width: `${Math.max(course.progress, 5)}%` }}
                    />
                </div>

                <div className="flex items-center text-sm font-bold text-gray-900 group-hover:text-[#2EBD59] transition-colors gap-2">
                    Resume Course
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
            </div>
        </Link>
    );
}
