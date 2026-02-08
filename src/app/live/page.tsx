import { UpcomingSessions, SessionCalendar, PastSessions } from "@/components/live";
import Link from "next/link";

export const metadata = {
    title: "Live Sessions | Quantum Bull",
    description: "Watch and join live trading sessions with expert instructors",
};

export default function LivePage() {
    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Sessions</h1>
                    <p className="text-gray-600">
                        Join live webinars, Q&A sessions, and real-time market analysis
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Upcoming Sessions */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
                            </div>
                            <UpcomingSessions />
                        </section>

                        {/* Past Sessions */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Past Recordings</h2>
                                <Link
                                    href="/live/archive"
                                    className="text-sm text-[#2EBD59] hover:underline"
                                >
                                    View All →
                                </Link>
                            </div>
                            <PastSessions />
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Calendar */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
                            <SessionCalendar />
                        </section>

                        {/* Info Card */}
                        <div className="bg-gradient-to-br from-[#2EBD59] to-[#1a8d3e] rounded-xl p-6 text-white">
                            <h3 className="font-semibold mb-2">Stay Updated</h3>
                            <p className="text-sm text-white/80 mb-4">
                                Get notified when live sessions are about to start
                            </p>
                            <button className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                                Enable Notifications
                            </button>
                        </div>

                        {/* Tier Benefits */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Tier Benefits</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-medium">B</span>
                                    <span className="text-gray-600">Basic: Watch-only access</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-medium">M</span>
                                    <span className="text-gray-600">Medium: Chat + polls participation</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-medium">A</span>
                                    <span className="text-gray-600">Advanced: Raise hand + priority Q&A</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
