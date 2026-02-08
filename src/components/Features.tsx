"use client";

const features = [
    {
        title: "Expert Courses",
        description: "50+ premium courses from professional traders with real market experience.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0v7" />
            </svg>
        ),
        gradient: "from-emerald-400 to-teal-500",
    },
    {
        title: "Daily Analysis",
        description: "Real-time market insights and trading signals delivered every day.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        gradient: "from-[#2EBD59] to-emerald-500",
    },
    {
        title: "Proven Results",
        description: "95% of our students report improved trading performance within 3 months.",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
        gradient: "from-teal-400 to-cyan-500",
    },
];

export default function Features() {
    return (
        <section className="relative py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
            {/* Floating background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#2EBD59]/5 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute top-1/2 -right-32 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl animate-pulse-glow" />
                <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-teal-100/40 rounded-full blur-2xl animate-float" />
            </div>

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
                {/* Section header */}
                <div className="text-center mb-16 md:mb-20">
                    <div className="inline-block mb-4">
                        <span className="text-sm font-semibold text-[#2EBD59] uppercase tracking-wider">Why Choose Us</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5">
                        Why <span className="gradient-text">Traders</span> Choose Us
                    </h2>
                    <p className="text-gray-600 max-w-lg mx-auto text-lg">
                        Everything you need to succeed in the markets
                    </p>
                </div>

                {/* Features grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative p-8 rounded-3xl bg-white border border-gray-100 hover:border-transparent transition-all duration-500 hover-lift"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Hover gradient border */}
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`} />
                            <div className="absolute inset-[1px] rounded-3xl bg-white z-0" />

                            <div className="relative z-10">
                                {/* Icon with animated background */}
                                <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-300`} />
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#2EBD59] transition-colors">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
