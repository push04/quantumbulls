"use client";

import { useEffect, useState } from "react";
import { getChurnStats, getAtRiskUsers, type UserRiskProfile } from "@/lib/engagement/churnDetector";

/**
 * Admin Churn Dashboard
 */
export default function ChurnDashboard() {
    const [stats, setStats] = useState<{
        totalUsers: number;
        atRiskCount: number;
        criticalCount: number;
        avgRiskScore: number;
        churnedLast30Days: number;
    } | null>(null);
    const [atRiskUsers, setAtRiskUsers] = useState<UserRiskProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const [statsData, usersData] = await Promise.all([
                getChurnStats(),
                getAtRiskUsers(50),
            ]);
            setStats(statsData);
            setAtRiskUsers(usersData);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500">
                Loading churn data...
            </div>
        );
    }

    const churnRate = stats && stats.totalUsers > 0
        ? ((stats.churnedLast30Days / stats.totalUsers) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Churn Prevention Dashboard
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="text-sm text-gray-500 mb-1">Total Users</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {stats?.totalUsers.toLocaleString()}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="text-sm text-gray-500 mb-1">At Risk</div>
                    <div className="text-2xl font-bold text-amber-500">
                        {stats?.atRiskCount}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="text-sm text-gray-500 mb-1">Critical</div>
                    <div className="text-2xl font-bold text-red-500">
                        {stats?.criticalCount}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="text-sm text-gray-500 mb-1">Avg Risk Score</div>
                    <div className="text-2xl font-bold text-gray-900">
                        {stats?.avgRiskScore}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="text-sm text-gray-500 mb-1">30d Churn Rate</div>
                    <div className={`text-2xl font-bold ${Number(churnRate) > 5 ? 'text-red-500' : 'text-green-500'
                        }`}>
                        {churnRate}%
                    </div>
                </div>
            </div>

            {/* At Risk Users */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">At-Risk Users</h2>
                    <p className="text-sm text-gray-500">Users with risk score ≥50</p>
                </div>

                {atRiskUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        🎉 No at-risk users detected!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {atRiskUsers.slice(0, 20).map((user) => (
                            <div key={user.userId} className="p-4 flex items-center gap-4">
                                {/* Risk indicator */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${user.riskLevel === 'critical' ? 'bg-red-500' :
                                        user.riskLevel === 'high' ? 'bg-amber-500' : 'bg-yellow-500'
                                    }`}>
                                    {user.riskScore}
                                </div>

                                {/* User info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                        User {user.userId.slice(0, 8)}...
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {user.factors.slice(0, 3).map((f, i) => (
                                            <span
                                                key={i}
                                                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                                            >
                                                {f.description}
                                            </span>
                                        ))}
                                        {user.factors.length > 3 && (
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                +{user.factors.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Risk level badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                                        user.riskLevel === 'high' ? 'bg-amber-100 text-amber-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {user.riskLevel.toUpperCase()}
                                </span>

                                {/* Actions */}
                                <button className="px-4 py-2 text-sm text-[#2EBD59] hover:bg-[#2EBD59]/5 rounded-lg transition-colors">
                                    Send Email
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
