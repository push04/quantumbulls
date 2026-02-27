export const metadata = {
    title: "Refund Policy | Quantum Bull",
};

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function RefundPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6">Refund Policy</h1>
                <p className="mb-4">
                    Our refund policy provides a 7-day money-back guarantee for all course purchases if you have completed less than 20% of the content.
                </p>
                <p>
                    Please contact support@quantumbull.com for any refund requests.
                </p>
            </div>
            </div>
            <Footer />
        </main>
    );
}
