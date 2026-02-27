export const metadata = {
    title: "Disclaimer | Quantum Bull",
};

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function DisclaimerPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6">Disclaimer</h1>
                <p className="mb-4">
                    Trading in financial markets involves high risk and may not be suitable for all investors. You could lose some or all of your initial investment.
                </p>
                <p className="mb-4">
                    The content provided on Quantum Bull is for educational purposes only and should not be construed as financial advice.
                </p>
            </div>
            </div>
            <Footer />
        </main>
    );
}
