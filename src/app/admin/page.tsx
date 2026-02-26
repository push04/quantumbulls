import { createClient } from "@/lib/supabase/server";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

export default async function AdminDashboard() {
    const supabase = await createClient();

    const [users, courses, revenue, pendingReports] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'pro'),
        supabase.from('user_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

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
        { label: "Total Users", value: users.count || 0, icon: "users" as const, change: "+12%", color: "blue", bg: "bg-blue-50", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
        { label: "Active Courses", value: courses.count || 0, icon: "book" as const, change: "+2", color: "violet", bg: "bg-violet-50", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
        { label: "Est. Revenue", value: `Rs.${((revenue.count || 0) * 999).toLocaleString()}`, icon: "rupee" as const, change: "+8%", color: "emerald", bg: "bg-emerald-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
        { label: "Pending Reports", value: pendingReports.count || 0, icon: "alert" as const, change: "-5", color: "amber", bg: "bg-amber-50", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
    ];

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
            color: 'violet'
        })) || []),
        ...(recentTestimonials?.map(t => ({
            type: 'testimonial',
            title: 'New testimonial',
            desc: `${t.author_name} - ${t.status}`,
            time: t.created_at,
            icon: 'star' as const,
            color: 'emerald'
        })) || [])
    ].sort((a, b) => new Date(b.time || '').getTime() - new Date(a.time || '').getTime()).slice(0, 5);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
                </div>
                <Link href="/admin/courses/create" className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25">
                    <Icon name="plus" size={18} />
                    Add Course
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                                <Icon name={stat.icon} size={24} className={stat.iconColor} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : stat.color === 'violet' ? 'bg-violet-50 text-violet-600' : 'bg-amber-50 text-amber-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                    <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View All</button>
                </div>
                <div className="divide-y divide-slate-50">
                    {activities.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Icon name="activity" size={28} className="text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium">No recent activity.</p>
                            <p className="text-slate-400 text-sm mt-1">Start adding content to see activity here.</p>
                        </div>
                    ) : (
                        activities.map((activity, i) => (
                            <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    activity.color === 'blue' ? 'bg-blue-50' : 
                                    activity.color === 'violet' ? 'bg-violet-50' : 'bg-emerald-50'
                                }`}>
                                    <Icon name={activity.icon} size={20} className={
                                        activity.color === 'blue' ? 'text-blue-600' : 
                                        activity.color === 'violet' ? 'text-violet-600' : 'text-emerald-600'
                                    } />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{activity.title}</p>
                                    <p className="text-xs text-slate-500 truncate">{activity.desc}</p>
                                </div>
                                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                    {activity.time ? new Date(activity.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
