import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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
        <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Trading Courses</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        From beginner basics to advanced strategies, start your journey to profitable trading.
                    </p>
                </div>

                {!courses || courses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <h3 className="text-xl font-medium text-gray-600">No active courses found.</h3>
                        <p className="text-gray-500 mt-2">Please check back later or contact support.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>📚</span>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${course.difficulty === 'beginner' ? 'text-blue-600 bg-blue-50' :
                                                course.difficulty === 'intermediate' ? 'text-[#2EBD59] bg-green-50' :
                                                    'text-purple-600 bg-purple-50'
                                            }`}>
                                            {course.difficulty ? course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1) : 'Beginner'}
                                        </span>
                                        <span className="text-sm text-gray-500">{course.estimated_hours ? `${course.estimated_hours} Hours` : 'Online'}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 flex-1">
                                        {course.description || "Learn trading strategies."}
                                    </p>
                                    <Link
                                        href={user ? `/dashboard/courses/${course.slug}` : "/signup"}
                                        className={`block w-full text-center px-4 py-2 text-white rounded-lg transition-colors ${course.difficulty === 'beginner' ? 'bg-blue-600 hover:bg-blue-700' :
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
