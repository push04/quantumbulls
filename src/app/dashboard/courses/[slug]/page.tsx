import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SessionGuard from "@/components/SessionGuard";
import PlanPaymentButton from "@/components/payment/PlanPaymentButton";
import Link from "next/link";
import { formatDuration } from "@/lib/learning/progressCalculator";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect(`/signup?next=/dashboard/courses/${slug}`);

    // Fetch Course
    const { data: course } = await supabase
        .from("courses")
        .select("*, lessons(*)")
        .eq("slug", slug)
        .single();

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 lg:pl-72">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Course Not Found</h1>
                    <Link href="/dashboard/courses" className="text-[#2EBD59] hover:underline mt-4 block">Back to Courses</Link>
                </div>
            </div>
        );
    }

    // Check Access
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const userTier = profile?.role || "free";
    const tierHierarchy: Record<string, number> = { free: 0, basic: 1, pro: 2, mentor: 3, admin: 4 };

    const userLevel = tierHierarchy[userTier] || 0;
    const courseLevel = tierHierarchy[course.tier || 'free'] || 0;
    const hasAccess = userLevel >= courseLevel;

    // Fetch Plan info if locked (to show price)
    let requiredPlan = null;
    if (!hasAccess) {
        const { data: plan } = await supabase
            .from("subscription_plans")
            .select("*")
            .eq("tier", course.tier)
            .single();
        requiredPlan = plan;
    }

    // Calculated Stats
    const lessonCount = course.lessons?.length || 0;
    const totalDuration = course.lessons?.reduce((acc: number, l: { duration_seconds: number }) => acc + (l.duration_seconds || 0), 0) || 0;
    const durationHours = Math.ceil(totalDuration / 3600);

    return (
        <SessionGuard userId={user.id}>
            <div className="min-h-screen bg-gray-50 font-sans">
                {/* Hero Section */}
                <div className="bg-[#0B0F19] text-white relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="url(#grad)" />
                            <defs>
                                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: "#2EBD59", stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: "#000000", stopOpacity: 1 }} />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">
                        <div className="flex flex-col md:flex-row gap-10 items-start">
                            {/* Text Content */}
                            <div className="flex-1">
                                <Link href="/dashboard/courses" className="text-gray-400 hover:text-[#2EBD59] text-sm mb-6 inline-flex items-center gap-2 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    Back to Courses
                                </Link>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${course.tier === 'free' ? 'bg-green-500/20 text-green-400' :
                                        course.tier === 'pro' ? 'bg-purple-500/20 text-purple-400' :
                                            course.tier === 'mentor' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {course.tier}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs font-semibold uppercase tracking-wider">
                                        {course.difficulty}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{course.title}</h1>
                                <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">{course.description}</p>

                                <div className="flex flex-wrap items-center gap-8 text-sm text-gray-400 border-t border-gray-800 pt-6">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-[#2EBD59]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                        <span>{lessonCount} Lessons</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-[#2EBD59]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>~{course.estimated_hours || durationHours} Hours</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-[#2EBD59]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                        <span>English</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Card (Desktop) */}
                            <div className="w-full md:w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 hidden md:block transform translate-y-8">
                                <div className="aspect-video bg-gray-200 relative">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    {hasAccess ? (
                                        <Link
                                            href={course.lessons && course.lessons.length > 0 ? `/dashboard/courses/${slug}/lessons/${course.lessons[0].slug}` : "#"}
                                            className="block w-full text-center py-3 bg-[#2EBD59] hover:bg-[#26a34d] text-white rounded-xl font-bold shadow-lg shadow-[#2EBD59]/20 transition-all transform hover:scale-105"
                                        >
                                            Start Learning
                                        </Link>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="text-center">
                                                <p className="text-gray-500 text-sm mb-1">Get instant access with</p>
                                                <h3 className="text-xl font-bold text-gray-900">{course.tier?.toUpperCase()} Plan</h3>
                                            </div>
                                            {requiredPlan ? (
                                                <PlanPaymentButton plan={requiredPlan} user={user} className="w-full bg-[#2EBD59] hover:bg-[#26a34d] text-white py-3 rounded-xl font-bold shadow-lg shadow-[#2EBD59]/20 transition-all" />
                                            ) : (
                                                <button disabled className="w-full py-3 bg-gray-300 text-gray-500 rounded-xl font-bold cursor-not-allowed">Plan Unavailable</button>
                                            )}
                                            <p className="text-xs text-center text-gray-400">30-day money-back guarantee</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Thumbnail */}
                <div className="md:hidden -mt-10 mx-6 relative z-20 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-2">
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
                            {course.thumbnail_url ? (
                                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                            ) : null}
                            {!hasAccess && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 px-2 pb-2">
                            {hasAccess ? (
                                <Link
                                    href={course.lessons && course.lessons.length > 0 ? `/dashboard/courses/${slug}/lessons/${course.lessons[0].slug}` : "#"}
                                    className="block w-full text-center py-3 bg-[#2EBD59] text-white rounded-lg font-bold"
                                >
                                    Start Learning
                                </Link>
                            ) : requiredPlan ? (
                                <PlanPaymentButton plan={requiredPlan} user={user} className="w-full bg-[#2EBD59] text-white py-3 rounded-lg font-bold" />
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row gap-12">
                    <div className="flex-1 space-y-12">

                        {/* What you'll learn */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">What you&apos;ll learn</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['Master foundational concepts', 'Analyze real-world market scenarios', 'Develop a profitable trading strategy', 'Risk management best practices', 'Psychology of a winning trader'].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-[#2EBD59] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span className="text-gray-600">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Course Content */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-sm text-gray-500">
                                    <span>{lessonCount} Lessons</span>
                                    <span>Total Duration: ~{course.estimated_hours || durationHours}h</span>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {course.lessons && course.lessons.length > 0 ? (
                                        course.lessons
                                            .sort((a: { order_index: number }, b: { order_index: number }) => (a.order_index || 0) - (b.order_index || 0))
                                            .map((lesson: { id: string; title: string; slug: string; duration_seconds: number; is_free_preview: boolean }, index: number) => (
                                                <div key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-sm font-medium">
                                                            {index + 1}
                                                        </span>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-gray-900 font-medium group-hover:text-[#2EBD59] transition-colors">{lesson.title}</h4>
                                                                {!hasAccess && !lesson.is_free_preview && (
                                                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500">{lesson.is_free_preview ? <span className="text-[#2EBD59] font-semibold">Free Preview</span> : null} &middot; {Math.floor((lesson.duration_seconds || 0) / 60)} mins</p>
                                                        </div>
                                                    </div>
                                                    {hasAccess || lesson.is_free_preview ? (
                                                        <Link
                                                            href={`/dashboard/courses/${slug}/lessons/${lesson.slug}`}
                                                            className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
                                                        >
                                                            Play
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-300">Locked</span>
                                                    )}
                                                </div>
                                            ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500">No lessons available yet.</div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Instructor */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Instructor</h2>
                            <div className="flex items-start gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2EBD59] to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                    QB
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">Quantum Bull Team</h3>
                                    <p className="text-[#2EBD59] text-sm font-medium mb-3">Professional Traders & Analysts</p>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Our team consists of seasoned market veterans with decades of combined experience in stocks, commodities, and derivatives. We simplify complex market dynamics into actionable strategies.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar (Desktop only right side) */}
                    <div className="w-full md:w-80 hidden md:block">
                        <div className="sticky top-24 space-y-8">
                            {/* Requirements */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">Requirements</h3>
                                <ul className="space-y-3 text-sm text-gray-600">
                                    <li className="flex gap-2"><span className="text-[#2EBD59]">&bull;</span> Basic understanding of math</li>
                                    <li className="flex gap-2"><span className="text-[#2EBD59]">&bull;</span> Access to a computer/charts</li>
                                    <li className="flex gap-2"><span className="text-[#2EBD59]">&bull;</span> Willingness to learn</li>
                                </ul>
                            </div>

                            {/* Tags */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Trading', 'Finance', 'Stocks', 'Technical Analysis', 'Investing'].map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SessionGuard>
    );
}
