export const metadata = {
    title: "Careers | Quantum Bull",
};

export default function CareersPage() {
    return (
        <main className="min-h-screen bg-white pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-6">Join Our Team</h1>
                <p className="text-lg text-gray-700 mb-8">
                    We are always looking for talented individuals to join our mission.
                </p>
                <div className="bg-blue-50 p-8 rounded-xl border border-blue-100 inline-block">
                    <p className="text-blue-800 font-medium">Currently, there are no open positions.</p>
                    <p className="text-blue-600 mt-2">Check back later!</p>
                </div>
            </div>
        </main>
    );
}
