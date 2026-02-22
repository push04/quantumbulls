import Icon from "@/components/ui/Icon";

export const metadata = {
    title: "About Us | Quantum Bull",
};

export default function AboutPage() {
    const values = [
        {
            title: "Expert Education",
            description: "Learn from professional traders with years of market experience.",
            icon: "award" as const,
            color: "green"
        },
        {
            title: "Community First",
            description: "Join thousands of traders supporting each other's growth journey.",
            icon: "users" as const,
            color: "blue"
        },
        {
            title: "Real Results",
            description: "Focus on practical strategies that work in real market conditions.",
            icon: "trending" as const,
            color: "purple"
        },
        {
            title: "Continuous Support",
            description: "Get ongoing guidance and updates to stay ahead of the curve.",
            icon: "zap" as const,
            color: "amber"
        }
    ];

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">About Quantum Bull</h1>
                <p className="text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                    Quantum Bull is dedicated to empowering traders with the knowledge and tools they need to succeed in the financial markets.
                </p>
                <p className="text-lg text-gray-700 mb-10 sm:mb-12 leading-relaxed">
                    Founded in 2026, we combine expert analysis, community support, and cutting-edge technology to create a superior learning environment.
                </p>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Our Values</h2>
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    {values.map((value, index) => (
                        <div 
                            key={index} 
                            className="bg-white p-5 sm:p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all animate-fade-in-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-${value.color}-100 flex items-center justify-center mb-4`}>
                                <Icon name={value.icon} size={24} className={`text-${value.color}-600`} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                            <p className="text-gray-600 text-sm">{value.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
