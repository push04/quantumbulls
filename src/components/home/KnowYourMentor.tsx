import Link from "next/link";
import Icon from "@/components/ui/Icon";

const achievements = [
    { value: "10+", label: "Years Trading" },
    { value: "5,000+", label: "Students Mentored" },
    { value: "₹2Cr+", label: "Student Profits" },
    { value: "95%", label: "Success Rate" },
];

const expertise = [
    "Price Action & Technical Analysis",
    "Options Trading Strategies",
    "Risk Management & Position Sizing",
    "Index & Equity Trading (NSE/BSE)",
    "Futures & Derivatives",
    "Live Market Psychology",
];

export default function KnowYourMentor() {
    return (
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2EBD59]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Section label */}
                <div className="text-center mb-12 lg:mb-16">
                    <span className="inline-block px-4 py-1.5 bg-[#2EBD59]/20 text-[#2EBD59] text-sm font-semibold rounded-full uppercase tracking-wider">
                        Know Your Mentor
                    </span>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left — Avatar + stats */}
                    <div className="flex flex-col items-center lg:items-start gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-br from-[#2EBD59] to-emerald-700 flex items-center justify-center shadow-2xl shadow-[#2EBD59]/20">
                                <span className="text-7xl sm:text-8xl font-black text-white select-none">QB</span>
                            </div>
                            {/* Live badge */}
                            <div className="absolute -bottom-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 bg-red-500 rounded-full shadow-lg">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                <span className="text-white text-xs font-semibold">Live Mentor</span>
                            </div>
                        </div>

                        {/* Achievement stats */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                            {achievements.map((a) => (
                                <div
                                    key={a.label}
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 text-center transition-all"
                                >
                                    <p className="text-2xl sm:text-3xl font-black text-[#2EBD59] mb-1">{a.value}</p>
                                    <p className="text-xs text-slate-400 leading-tight">{a.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — Bio */}
                    <div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2 leading-tight">
                            The Mind Behind<br />
                            <span className="text-[#2EBD59]">Quantum Bull</span>
                        </h2>
                        <p className="text-slate-400 text-sm uppercase tracking-widest font-medium mb-6">
                            Professional Trader & Market Educator
                        </p>

                        <p className="text-slate-300 leading-relaxed mb-4 text-base sm:text-lg">
                            With over a decade of active trading across Indian equity, options, and futures markets,
                            our mentor has navigated multiple market cycles — bull runs, crashes, and sideways consolidations —
                            to build a repeatable, rule-based trading system.
                        </p>
                        <p className="text-slate-400 leading-relaxed mb-8">
                            The mission at Quantum Bull is simple: take what took years to learn through trial and error,
                            and compress it into structured programs that help you skip the painful mistakes and fast-track
                            to consistent profitability.
                        </p>

                        {/* Expertise tags */}
                        <div className="mb-8">
                            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-3">Areas of Expertise</p>
                            <div className="flex flex-wrap gap-2">
                                {expertise.map((skill) => (
                                    <span
                                        key={skill}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2EBD59]/10 border border-[#2EBD59]/20 text-[#2EBD59] text-xs font-medium rounded-full"
                                    >
                                        <Icon name="check" size={12} />
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/courses"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2EBD59] hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#2EBD59]/25 hover:-translate-y-0.5"
                            >
                                Explore Courses
                                <Icon name="arrow-right" size={18} />
                            </Link>
                            <Link
                                href="/live"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all"
                            >
                                <Icon name="video" size={18} />
                                Join Live Session
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
