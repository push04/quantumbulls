import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUpcomingSessions, getPastSessions } from "@/lib/live/liveSession";
import Link from "next/link";

export default async function LiveSessionsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/signin");

    // Fetch data
    const upcomingSessions = await getUpcomingSessions(10);
    const { sessions: pastSessions } = await getPastSessions(1, 5);

    return (
        <div className="space-y-12 pb-12 p-6 lg:p-10 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Live Sessions</h1>
                <p className="text-gray-500 mt-2 text-lg">Join expert traders for live market analysis and Q&A.</p>
            </div>

            {/* Upcoming Sessions */}
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
                </div>

                {upcomingSessions.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcomingSessions.map((session, index) => (
                            <div key={session.id} className={`group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${index === 0 ? 'md:col-span-2 lg:col-span-2' : ''}`}>
                                <div className={`relative ${index === 0 ? 'h-64' : 'h-48'} overflow-hidden`}>
                                    {session.thumbnail_url ? (
                                        <img src={session.thumbnail_url} alt={session.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-5xl">🎥</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    <div className="absolute top-4 left-4">
                                        <span className="bg-[#2EBD59] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-[#2EBD59]/20 backdrop-blur-md">
                                            UPCOMING
                                        </span>
                                    </div>

                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider opacity-90 mb-2">
                                            <div className="flex items-center gap-1.5">
                                                <span>📅</span>
                                                {new Date(session.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span>⏰</span>
                                                {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <h3 className={`${index === 0 ? 'text-2xl' : 'text-lg'} font-bold leading-tight group-hover:text-[#2EBD59] transition-colors`}>
                                            {session.title}
                                        </h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2">{session.description}</p>
                                    <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                                        Register for Session
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-3xl border border-dashed border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-3xl">
                            📅
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No upcoming sessions</h3>
                        <p className="text-gray-500">Check back later for new scheduled streams.</p>
                    </div>
                )}
            </section>

            {/* Past Sessions */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Past Recordings</h2>
                    <button className="text-sm font-bold text-[#2EBD59] hover:underline">View All Archive</button>
                </div>

                {pastSessions.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {pastSessions.map((session) => (
                            <div key={session.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <div className="h-40 bg-gray-100 relative overflow-hidden">
                                    {session.thumbnail_url ? (
                                        <img src={session.thumbnail_url} alt={session.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300 bg-gray-50">📼</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-[#2EBD59] transform scale-50 group-hover:scale-100 transition-transform">
                                            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md">
                                        REPLAY
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-1 text-sm line-clamp-2 leading-snug group-hover:text-[#2EBD59] transition-colors">{session.title}</h3>
                                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                        <span>📅</span>
                                        {new Date(session.scheduled_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm italic">No recordings available yet.</p>
                )}
            </section>
        </div>
    );
}
