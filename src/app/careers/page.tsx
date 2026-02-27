import Icon from "@/components/ui/Icon";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata = {
    title: "Careers | Quantum Bull",
};

export default function CareersPage() {
    const benefits = [
        { title: "Competitive Salary", icon: "rupee" as const },
        { title: "Health Insurance", icon: "heart" as const },
        { title: "Flexible Work Hours", icon: "clock" as const },
        { title: "Learning Opportunities", icon: "book" as const },
    ];

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />
            <div className="pt-20 pb-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Join Our Team</h1>
                <p className="text-lg text-gray-700 mb-8 sm:mb-10">
                    We are always looking for talented individuals to join our mission.
                </p>

                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm mb-8 sm:mb-10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                        <Icon name="briefcase" size={32} className="text-amber-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Open Positions</h2>
                    <p className="text-gray-600 mb-4">Currently, there are no open positions.</p>
                    <p className="text-gray-500 text-sm">Check back later for opportunities!</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => (
                        <div 
                            key={index}
                            className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-lg bg-[#2EBD59]/10 flex items-center justify-center flex-shrink-0">
                                <Icon name={benefit.icon} size={20} className="text-[#2EBD59]" />
                            </div>
                            <span className="text-gray-700 font-medium text-sm sm:text-base">{benefit.title}</span>
                        </div>
                    ))}
                </div>
            </div>
            </div>
            <Footer />
        </main>
    );
}
