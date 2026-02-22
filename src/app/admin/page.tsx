import { createClient } from "@/lib/supabase/server";
import Icon from "@/components/ui/Icon";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch key metrics
    const [users, courses, revenue, pendingReports] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'pro'),
        supabase.from('user_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    // Fetch recent activity
    const [
        { data: recentUsers },
        { data: recentCourses },
        { data: recentTestimonials }
    ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('courses').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }).limit(3)
    ]);

    const stats = [
        { label: "Total Users", value: users.count || 0, icon: "users" as const, change: "+12%", color: "blue" },
        { label: "Active Courses", value: courses.count || 0, icon: "book" as const, change: "+2", color: "purple" },
        { label: "Est. Revenue", value: `Rs.${((revenue.count || 0) * 999).toLocaleString()}`, icon: "rupee" as const, change: "+8%", color: "green" },
        { label: "Pending Reports", value: pendingReports.count || 0, icon: "alert" as const, change: "-5", color: "amber" },
    ];

    // Combine and sort activities
    const activities = [
        ...(recentUsers?.map(u => ({
            type: 'user',
            title: 'New user registration',
            desc: u.full_name || 'Anonymous User',
            time: u.created_at,
            icon: 'user-plus' as const,
            color: 'blue'
        })) || []),
        ...(recentCourses?.map(c => ({
            type: 'course',
            title: 'New course added',
            desc: c.title,
            time: c.created_at,
            icon: 'book' as const,
            color: 'purple'
        })) || []),
        ...(recentTestimonials?.map(t => ({
            type: 'testimonial',
            title: 'New testimonial',
            desc: `${t.author_name} - ${t.status}`,
            time: t.created_at,
            icon: 'star' as const,
            color: 'green'
        })) || [])
    ].sort((a, b) => new Date(b.time || '').getTime() - new Date(a.time || '').getTime()).slice(0, 5);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                                <Icon name={stat.icon} size={20} className={`text-${stat.color}-600`} />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-3 sm:space-y-4">
                    {activities.length === 0 ? (
                        <div className="text-center py-8">
                            <Icon name="activity" size={32} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No recent activity.</p>
                        </div>
                    ) : (
                        activities.map((activity, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                                <div className={`w-10 h-10 rounded-full bg-${activity.color}-100 flex items-center justify-center flex-shrink-0`}>
                                    <Icon name={activity.icon} size={18} className={`text-${activity.color}-600`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{activity.desc} - {new Date(activity.time || '').toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
