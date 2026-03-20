import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Icon from "@/components/ui/Icon";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata = {
    title: "Courses | Quantum Bull",
    description: "Master trading with our comprehensive courses",
};

export default async function CoursesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />
            <div className="pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto pt-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Trading Courses</h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                        From beginner basics to advanced strategies, start your journey to profitable trading.
                    </p>
                </div>

                {!courses || courses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Icon name="book" size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-600">No active courses found.</h3>
                        <p className="text-gray-500 mt-2">Please check back later or contact support.</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {courses.map((course, index) => (
                            <div 
                                key={course.id} 
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="h-48 relative bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white overflow-hidden">
                                    {course.thumbnail_url ? (
                                        <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />
                                    ) : (
                                        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${
                                            course.difficulty === 'beginner'
                                                ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                                                : course.difficulty === 'intermediate'
                                                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                                                    : 'bg-gradient-to-br from-purple-400 to-purple-600'
                                        }`}>
                                            <svg className="w-12 h-12 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            <span className="text-white/60 text-sm font-medium">Course</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${course.difficulty === 'beginner' ? 'text-blue-600 bg-blue-50' :
                                                course.difficulty === 'intermediate' ? 'text-[#2EBD59] bg-green-50' :
                                                    'text-purple-600 bg-purple-50'
                                            }`}>
                                            {course.difficulty ? course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1) : 'Beginner'}
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <Icon name="clock" size={14} className="text-gray-400" />
                                            {course.estimated_hours ? `${course.estimated_hours} Hours` : 'Online'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">
                                        {course.description || "Learn trading strategies."}
                                    </p>
                                    <Link
                                        href={user ? `/dashboard/courses/${course.slug}` : "/signup"}
                                        className={`block w-full text-center px-4 py-3 text-white rounded-xl font-semibold transition-all duration-200 active:scale-95 ${course.difficulty === 'beginner' ? 'bg-blue-600 hover:bg-blue-700' :
                                                course.difficulty === 'intermediate' ? 'bg-[#2EBD59] hover:bg-[#26a34d]' :
                                                    'bg-purple-600 hover:bg-purple-700'
                                            }`}
                                    >
                                        {user ? "Start Learning" : "Enroll Now"}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </div>
            <Footer />
        </main>
    );
}
