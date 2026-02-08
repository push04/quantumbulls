import { ForumCategories } from "@/components/forum";
import Link from "next/link";

export const metadata = {
    title: "Community Forum | Quantum Bull",
    description: "Connect with fellow traders, ask questions, and share knowledge",
};

export default function CommunityPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Forum</h1>
                    <p className="text-gray-600">
                        Connect with fellow traders, ask questions, and share your knowledge
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-[#2EBD59]">1.2k+</div>
                        <div className="text-sm text-gray-500">Members</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-blue-500">350+</div>
                        <div className="text-sm text-gray-500">Discussions</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-purple-500">&lt;2hr</div>
                        <div className="text-sm text-gray-500">Avg Response</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                        <div className="text-2xl font-bold text-amber-500">95%</div>
                        <div className="text-sm text-gray-500">Resolved</div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="search"
                            placeholder="Search discussions..."
                            className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2EBD59] focus:border-transparent"
                        />
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Categories */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
                    </div>
                    <ForumCategories />
                </section>

                {/* Community Guidelines */}
                <section className="bg-gradient-to-br from-[#2EBD59] to-[#1a8d3e] rounded-xl p-6 text-white">
                    <h2 className="text-lg font-semibold mb-3">Community Guidelines</h2>
                    <ul className="grid md:grid-cols-2 gap-3 text-sm text-white/90">
                        <li className="flex items-center gap-2">
                            <span>✓</span> Be respectful and constructive
                        </li>
                        <li className="flex items-center gap-2">
                            <span>✓</span> No spam or self-promotion
                        </li>
                        <li className="flex items-center gap-2">
                            <span>✓</span> Educational discussion only
                        </li>
                        <li className="flex items-center gap-2">
                            <span>✓</span> No sharing account credentials
                        </li>
                        <li className="flex items-center gap-2">
                            <span>✓</span> Help beginners learn
                        </li>
                        <li className="flex items-center gap-2">
                            <span>✓</span> Use the report button for issues
                        </li>
                    </ul>
                    <Link
                        href="/community/guidelines"
                        className="inline-block mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                    >
                        Read Full Guidelines
                    </Link>
                </section>
            </div>
        </main>
    );
}
