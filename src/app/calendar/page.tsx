import { SessionCalendar, UpcomingSessions } from "@/components/live";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
    title: "Calendar | Quantum Bull",
    description: "View all upcoming live trading sessions and events on the Quantum Bull calendar.",
};

export default function CalendarPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 sm:pt-28 pb-12 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto pt-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <Link href="/" className="hover:text-[#2EBD59] transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">Calendar</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                            Session Calendar
                        </h1>
                        <p className="text-gray-500 text-lg">
                            All upcoming live sessions, webinars, and market analysis events — in one place.
                        </p>
                    </div>

                    {/* Market Status Legend */}
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                            <span className="text-sm">🟢</span>
                            <span className="text-xs font-medium text-green-700">Market Open</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
                            <span className="text-sm">🔴</span>
                            <span className="text-xs font-medium text-red-600">NSE Holiday / Weekend</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
                            <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 inline-block" />
                            <span className="text-xs font-medium text-red-600">Holiday</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200">
                            <span className="w-3 h-3 rounded-sm bg-orange-100 border border-orange-300 inline-block" />
                            <span className="text-xs font-medium text-orange-600">Weekend</span>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Full Calendar */}
                        <div className="xl:col-span-2">
                            <SessionCalendar />
                        </div>

                        {/* Sidebar — upcoming sessions list */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
                                <UpcomingSessions />
                            </div>

                            {/* CTA card */}
                            <div className="bg-gradient-to-br from-[#2EBD59] to-emerald-700 rounded-2xl p-6 text-white">
                                <h3 className="font-bold text-lg mb-2">Never Miss a Session</h3>
                                <p className="text-sm text-white/80 mb-4">
                                    Live sessions are where the real learning happens. Join us for real-time market analysis every week.
                                </p>
                                <Link
                                    href="/live"
                                    className="block text-center px-4 py-2.5 bg-white text-[#2EBD59] font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Go to Live Sessions →
                                </Link>
                            </div>

                            {/* Pricing nudge */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Unlock More Sessions</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Upgrade your plan to get access to exclusive live Q&amp;A, advanced analysis sessions, and priority access.
                                </p>
                                <Link
                                    href="/pricing"
                                    className="block text-center px-4 py-2.5 bg-[#2EBD59] hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-colors"
                                >
                                    View Plans
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
