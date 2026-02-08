"use client";

import { useEffect, useState } from "react";
import {
    getReferralStats,
    getReferralLeaderboard,
    type ReferralStats
} from "@/lib/referral/referralManager";

interface LeaderboardEntry {
    userId: string;
    name: string;
    count: number;
}

/**
 * Referral Dashboard Component
 */
export default function ReferralDashboard({ userId }: { userId: string }) {
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [statsData, leaderboardData] = await Promise.all([
                getReferralStats(userId),
                getReferralLeaderboard(5),
            ]);
            setStats(statsData);
            setLeaderboard(leaderboardData);
            setLoading(false);
        }
        load();
    }, [userId]);

    const copyLink = async () => {
        if (!stats) return;
        await navigator.clipboard.writeText(stats.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 rounded-xl" />
                <div className="h-24 bg-gray-200 rounded-xl" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="bg-gradient-to-br from-[#2EBD59] to-[#1a8d3e] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Invite Friends</h2>
                        <p className="text-white/80 text-sm">Both get 1 week free!</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold">{stats.totalReferrals}</div>
                        <div className="text-xs text-white/70">Total Invited</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold">{stats.completedReferrals}</div>
                        <div className="text-xs text-white/70">Subscribed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold">{stats.totalRewards}</div>
                        <div className="text-xs text-white/70">Days Earned</div>
                    </div>
                </div>

                {/* Referral Link */}
                <div className="bg-white/10 rounded-lg p-3">
                    <label className="text-xs text-white/70 block mb-1">Your Referral Link</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={stats.referralLink}
                            readOnly
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                        />
                        <button
                            onClick={copyLink}
                            className="px-4 py-2 bg-white text-[#2EBD59] font-medium rounded-lg hover:bg-white/90 transition-colors text-sm"
                        >
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Share Buttons */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Share via</h3>
                <div className="flex gap-3">
                    <a
                        href={`https://wa.me/?text=Learn%20trading%20with%20Quantum%20Bull!%20${encodeURIComponent(stats.referralLink)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                    </a>
                    <a
                        href={`https://twitter.com/intent/tweet?text=Learn%20trading%20with%20Quantum%20Bull!&url=${encodeURIComponent(stats.referralLink)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        X
                    </a>
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: "Quantum Bull",
                                    text: "Learn trading with Quantum Bull!",
                                    url: stats.referralLink,
                                });
                            }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                    </button>
                </div>
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">🏆 Top Referrers</h3>
                    <div className="space-y-2">
                        {leaderboard.map((entry, index) => (
                            <div
                                key={entry.userId}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                            >
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? "bg-yellow-100 text-yellow-700" :
                                        index === 1 ? "bg-gray-200 text-gray-700" :
                                            index === 2 ? "bg-orange-100 text-orange-700" :
                                                "bg-gray-100 text-gray-500"
                                    }`}>
                                    {index + 1}
                                </span>
                                <span className="flex-1 font-medium text-gray-900">
                                    {entry.name}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {entry.count} referrals
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
