import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch key metrics
    const [users, courses, revenue, pendingReports] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_active', true),
        // Revenue is mocked for now as we don't have payments table yet, or use subscription_plans count?
        // Let's assume we count pro users * plan price roughly
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
        { label: "Total Users", value: users.count || 0, icon: "👥", change: "+12%" },
        { label: "Active Courses", value: courses.count || 0, icon: "📚", change: "+2" },
        { label: "Est. Revenue", value: `₹${(revenue.count || 0) * 999}`, icon: "💰", change: "+8%" },
        { label: "Pending Reports", value: pendingReports.count || 0, icon: "⚠️", change: "-5" },
    ];

    // Combine and sort activities
    const activities = [
        ...(recentUsers?.map(u => ({
            type: 'user',
            title: 'New user registration',
            desc: u.full_name || 'Anonymous User',
            time: u.created_at,
            icon: '👤',
            color: 'blue'
        })) || []),
        ...(recentCourses?.map(c => ({
            type: 'course',
            title: 'New course added',
            desc: c.title,
            time: c.created_at,
            icon: '📚',
            color: 'purple'
        })) || []),
        ...(recentTestimonials?.map(t => ({
            type: 'testimonial',
            title: 'New testimonial',
            desc: `${t.author_name} - ${t.status}`,
            time: t.created_at,
            icon: '📝',
            color: 'green'
        })) || [])
    ].sort((a, b) => new Date(b.time || '').getTime() - new Date(a.time || '').getTime()).slice(0, 5);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl">{stat.icon}</span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {activities.length === 0 ? (
                        <p className="text-gray-500 text-sm">No recent activity.</p>
                    ) : (
                        activities.map((activity, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                                <div className={`w-10 h-10 rounded-full bg-${activity.color}-100 flex items-center justify-center text-${activity.color}-600`}>
                                    {activity.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                    <p className="text-xs text-gray-500">{activity.desc} • {new Date(activity.time || '').toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
