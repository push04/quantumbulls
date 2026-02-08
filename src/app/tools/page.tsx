export const metadata = {
    title: "Tools | Quantum Bull",
};

export default function ToolsPage() {
    return (
        <main className="min-h-screen bg-white pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6">Trading Tools</h1>
                <p className="text-lg text-gray-700 mb-8">
                    Essential tools for every trader.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold mb-2">Position Size Calculator</h3>
                        <p className="text-gray-600">Calculate exact lot sizes based on your risk percentage.</p>
                    </div>
                    <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold mb-2">Risk/Reward Calculator</h3>
                        <p className="text-gray-600">Visualize your trade R:R before entering.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
