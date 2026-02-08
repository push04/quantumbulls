import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import SessionGuard from "@/components/SessionGuard";
import { formatDuration } from "@/lib/learning/progressCalculator";
import SmartVideoPlayer from "@/components/content/SmartVideoPlayer";

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonSlug: string }> }) {
    const { slug, lessonSlug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/signin");

    // Fetch Lesson and Course with robust join
    const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select(`
            *,
            course:courses!inner(
                id,
                title,
                slug,
                tier,
                lessons(
                    id,
                    title,
                    slug,
                    duration_seconds,
                    is_free_preview,
                    order_index
                )
            )
        `)
        .eq("slug", lessonSlug)
        .eq("course.slug", slug)
        .single();

    if (lessonError || !lesson) {
        console.error("Lesson fetch error:", lessonError);
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-white lg:pl-72">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Lesson Not Found</h1>
                    <p className="text-gray-400">The lesson you are looking for does not exist or you don't have access.</p>
                    <Link href={`/dashboard/courses/${slug}`} className="inline-flex px-6 py-3 bg-[#2EBD59] text-white rounded-xl font-bold hover:bg-[#26a34d] transition-all shadow-lg shadow-[#2EBD59]/20">
                        Back to Course
                    </Link>
                </div>
            </div>
        );
    }

    const course = lesson.course;

    // Check Access
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userTier = profile?.role || "free";
    const tierHierarchy: Record<string, number> = { free: 0, basic: 1, pro: 2, mentor: 3, admin: 4 };

    // Allow access if lesson is free preview OR user has tier access
    const hasTierAccess = tierHierarchy[userTier] >= tierHierarchy[course.tier || 'free'];
    const canView = lesson.is_free_preview || hasTierAccess;

    if (!canView) {
        redirect(`/dashboard/courses/${course.slug}`);
    }

    // Sort lessons
    const lessons = course.lessons?.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)) || [];
    const currentIndex = lessons.findIndex((l: any) => l.slug === lessonSlug);
    const nextLesson = lessons[currentIndex + 1];
    const prevLesson = lessons[currentIndex - 1];

    return (
        <SessionGuard userId={user.id}>
            <div className="min-h-screen bg-[#06090F] text-white flex flex-col h-screen overflow-hidden font-sans">
                {/* Header (Mobile only) */}
                <header className="lg:hidden bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/5 p-4 sticky top-0 z-20 flex items-center gap-3">
                    <Link href={`/dashboard/courses/${slug}`} className="text-gray-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <h1 className="font-semibold truncate text-sm">{lesson.title}</h1>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                    {/* Background Ambience */}
                    <div className="absolute inset-0 bg-[#06090F]" />
                    <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#1a1f2e] to-transparent opacity-60 pointer-events-none" />
                    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#2EBD59] opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative z-10 scroll-smooth bg-[#06090F]">

                        {/* Video Section - Cinema Style - Full Width Force */}
                        <div className="w-full bg-black relative border-b border-white/5 z-30 group">
                            <div className="w-full aspect-video max-h-[80vh] mx-auto bg-black relative shadow-2xl">
                                {lesson.video_url ? (
                                    <SmartVideoPlayer url={lesson.video_url} />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0F19] text-gray-500">
                                        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p className="font-light tracking-wide">No Video Content</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="w-full mx-auto px-6 lg:px-12 py-8 lg:py-12 flex-1 max-w-[1600px]">

                            {/* Header Section */}
                            <div className="flex flex-col xl:flex-row xl:items-start gap-8 mb-12 border-b border-white/5 pb-8">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase text-[#2EBD59]/80">
                                        <Link href={`/dashboard/courses/${slug}`} className="hover:text-[#2EBD59] transition-colors">
                                            {course.title}
                                        </Link>
                                        <span className="text-gray-700">/</span>
                                        <span className="text-gray-400">Lesson {currentIndex + 1}</span>
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-2">
                                        {lesson.title}
                                    </h1>
                                </div>

                                <div className="flex items-center gap-4 flex-wrap">
                                    <button className="flex items-center gap-2 px-6 py-3 bg-[#2EBD59] hover:bg-[#26a34d] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#2EBD59]/20 transition-all transform hover:scale-105 active:scale-95">
                                        <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                        </div>
                                        Mark Complete
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                                {/* Left Column: Description & Tabs */}
                                <div className="xl:col-span-8 space-y-12">

                                    {/* Tabs */}
                                    <div>
                                        <div className="flex gap-8 border-b border-white/5 pb-0.5">
                                            {['Overview', 'Resources', 'Discussion'].map((tab) => (
                                                <button key={tab} className={`pb-4 px-2 text-sm font-bold tracking-wide uppercase transition-all relative ${tab === 'Overview' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                                                    {tab}
                                                    {tab === 'Overview' && (
                                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#2EBD59] to-[#00D4FF] shadow-[0_0_15px_#2EBD59]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Content Block */}
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        {lesson.description && (
                                            <div className="text-lg md:text-xl text-gray-300 leading-relaxed font-light border-l-4 border-[#2EBD59] pl-6 py-1 bg-gradient-to-r from-[#2EBD59]/5 to-transparent rounded-r-xl">
                                                {lesson.description}
                                            </div>
                                        )}

                                        <div className="prose prose-invert prose-lg max-w-none prose-p:text-gray-400 prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#2EBD59] prose-code:text-[#2EBD59] prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-strong:text-white">
                                            {lesson.content ? (
                                                <div className="whitespace-pre-wrap font-sans">
                                                    {lesson.content}
                                                </div>
                                            ) : (
                                                <div className="py-12 px-8 border border-dashed border-white/10 rounded-2xl bg-white/[0.02] text-center flex flex-col items-center justify-center gap-3">
                                                    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    <p className="text-gray-500 font-medium">No additional text content.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Next/Prev Navigation */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 pt-8 border-t border-white/5">
                                        <Link
                                            href={prevLesson ? `/dashboard/courses/${slug}/lessons/${prevLesson.slug}` : "#"}
                                            className={`group relative p-6 rounded-2xl border transition-all overflow-hidden ${prevLesson
                                                ? 'border-white/5 bg-[#0F1422] hover:border-white/10 hover:shadow-2xl hover:shadow-[#2EBD59]/5 cursor-pointer'
                                                : 'border-transparent opacity-40 cursor-not-allowed bg-black/20'}`}
                                            aria-disabled={!prevLesson}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#2EBD59]/0 to-[#2EBD59]/0 group-hover:from-[#2EBD59]/5 transition-all duration-500" />
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 group-hover:text-[#2EBD59] transition-colors">
                                                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                                    Previous Unit
                                                </div>
                                                <div className="text-lg font-bold text-white transition-colors">
                                                    {prevLesson?.title || "Start"}
                                                </div>
                                            </div>
                                        </Link>

                                        <Link
                                            href={nextLesson ? `/dashboard/courses/${slug}/lessons/${nextLesson.slug}` : "#"}
                                            className={`group relative p-6 rounded-2xl border text-right transition-all overflow-hidden ${nextLesson
                                                ? 'border-white/5 bg-[#0F1422] hover:border-white/10 hover:shadow-2xl hover:shadow-[#2EBD59]/5 cursor-pointer'
                                                : 'border-transparent opacity-40 cursor-not-allowed bg-black/20'}`}
                                            aria-disabled={!nextLesson}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-l from-[#2EBD59]/0 to-[#2EBD59]/0 group-hover:from-[#2EBD59]/5 transition-all duration-500" />
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-end gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest mb-3 group-hover:text-[#2EBD59] transition-colors">
                                                    Next Unit
                                                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                </div>
                                                <div className="text-lg font-bold text-white transition-colors">
                                                    {nextLesson?.title || "Finish"}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>

                                {/* Right Column: Instructor / Details / Upsell */}
                                <div className="xl:col-span-4 space-y-6">
                                    {/* Instructor Card */}
                                    <div className="bg-[#0F1422] border border-white/5 rounded-2xl p-6 md:p-8 hover:border-white/10 transition-colors">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Your Instructor</h3>
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ring-2 ring-white/5">
                                                QB
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-lg">Quantum Bull</div>
                                                <div className="text-sm text-[#2EBD59] font-medium">Master Trader</div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed mb-6 border-t border-white/5 pt-6">
                                            Expert guidance on technical analysis and market psychology. Follow the course structure for best results.
                                        </p>
                                    </div>

                                    {/* Resource Card (Placeholder) */}
                                    <div className="bg-[#0F1422] border border-white/5 rounded-2xl p-6 md:p-8 hover:border-white/10 transition-colors group">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-white font-bold">Resources</h3>
                                            <svg className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4">Download supplementary materials for this lesson.</p>
                                        <button className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            Download PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar Playlist (Enhanced) */}
                    <div className="hidden lg:flex w-[380px] bg-[#080C14] border-l border-white/5 flex-col h-full z-20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="p-6 border-b border-white/5 bg-[#080C14] flex flex-col gap-4">
                            <h2 className="font-bold text-white text-lg tracking-tight">Course Syllabus</h2>

                            {/* Progress Card */}
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center justify-between text-xs text-gray-300 font-medium mb-2">
                                    <span>Progress</span>
                                    <span>{Math.round(((currentIndex + 1) / lessons.length) * 100)}%</span>
                                </div>
                                <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-[#2EBD59] to-[#00D4FF] h-full rounded-full transition-all duration-700 shadow-[0_0_10px_#2EBD59]"
                                        style={{ width: `${((currentIndex + 1) / lessons.length) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="mt-2 text-[10px] text-gray-500 uppercase tracking-wider text-right">
                                    {currentIndex + 1} of {lessons.length} Completed
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                            {lessons.map((l: any, i: number) => {
                                const isActive = l.slug === lessonSlug;
                                const isCompleted = i < currentIndex;

                                return (
                                    <Link
                                        key={l.id}
                                        href={`/dashboard/courses/${slug}/lessons/${l.slug}`}
                                        className={`group relative flex items-center gap-4 p-5 border-b border-white/5 transition-all text-left ${isActive
                                            ? 'bg-[#2EBD59]/5'
                                            : 'hover:bg-white/[0.02]'
                                            }`}
                                    >
                                        {/* Active Indicator Line */}
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2EBD59] shadow-[0_0_15px_#2EBD59]" />}

                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${isActive
                                            ? 'bg-[#2EBD59] text-white shadow-lg shadow-[#2EBD59]/30 scale-110'
                                            : isCompleted
                                                ? 'bg-[#2EBD59]/10 text-[#2EBD59]'
                                                : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-gray-300'
                                            }`}>
                                            {isActive ? (
                                                <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            ) : isCompleted ? (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                            ) : (
                                                i + 1
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-semibold mb-1 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                                                }`}>
                                                {l.title}
                                            </h4>
                                            <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider text-gray-600">
                                                <span className="flex items-center gap-1 group-hover:text-gray-500 transition-colors">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {Math.floor((l.duration_seconds || 0) / 60)} MIN
                                                </span>
                                                {l.is_free_preview && <span className="bg-[#2EBD59]/10 text-[#2EBD59] px-1.5 py-0.5 rounded-sm">Free</span>}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </SessionGuard>
    );
}
