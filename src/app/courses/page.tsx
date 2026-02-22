import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Icon from "@/components/ui/Icon";

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
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
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
                                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white relative overflow-hidden">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                                            <Icon name="book" size={32} className="text-white" />
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
        </main>
    );
}
