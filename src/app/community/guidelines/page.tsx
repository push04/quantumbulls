import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata = {
    title: "Community Guidelines | Quantum Bull",
    description: "Rules and guidelines for the Quantum Bull community",
};

export default function CommunityGuidelinesPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#2EBD59] px-8 py-6 text-white">
                    <h1 className="text-3xl font-bold">Community Guidelines</h1>
                    <p className="mt-2 text-white/90">Building a positive environment for traders to learn and grow.</p>
                </div>

                <div className="p-8 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                            Be Respectful & Constructive
                        </h2>
                        <p className="text-gray-600">
                            Treat all members with respect. Disagreements are fine, but personal attacks, harassment, and hate speech are strictly prohibited. Focus on the trade, not the trader.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                            No Financial Advice
                        </h2>
                        <p className="text-gray-600">
                            Discussions are for educational purposes only. Do not frame your posts as financial advice. Always encourage others to do their own research (DYOR).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
                            No Spam or Self-Promotion
                        </h2>
                        <p className="text-gray-600">
                            Do not use the forum to promote your own services, signals, or external links without prior approval. Spamming threads or replies will result in immediate bans.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">4</span>
                            Keep Account Details Private
                        </h2>
                        <p className="text-gray-600">
                            Never share your password, API keys, or personal contact information on the public forum. Staff will never ask for your password.
                        </p>
                    </section>

                    <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                        <Link href="/community" className="text-gray-500 hover:text-gray-900 text-sm font-medium">
                            ← Back to Community
                        </Link>
                        <p className="text-xs text-gray-400">Last updated: February 2026</p>
                    </div>
                </div>
            </div>
            </div>
            <Footer />
        </main>
    );
}
