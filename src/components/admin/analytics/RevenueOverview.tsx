"use client";

import { useEffect, useState } from "react";
import {
    getRevenueMetrics,
    getSubscriberCounts,
    formatCurrency,
    type RevenueMetrics
} from "@/lib/analytics/revenueCalculator";

/**
 * Revenue Overview KPI Cards
 */
export default function RevenueOverview() {
    const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
    const [subscribers, setSubscribers] = useState<{
        total: number; basic: number; medium: number; advanced: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMetrics() {
            const [metricsData, subsData] = await Promise.all([
                getRevenueMetrics(),
                getSubscriberCounts(),
            ]);
            setMetrics(metricsData);
            setSubscribers(subsData);
            setLoading(false);
        }
        loadMetrics();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-32"></div>
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            label: "Revenue This Month",
            value: formatCurrency(metrics?.totalRevenue || 0),
            change: metrics?.revenueGrowth || 0,
            icon: "💰",
        },
        {
            label: "Active Subscribers",
            value: subscribers ? (subscribers.basic + subscribers.medium + subscribers.advanced).toString() : "0",
            sublabel: subscribers ? `${subscribers.basic} Basic, ${subscribers.medium} Medium, ${subscribers.advanced} Advanced` : "",
            icon: "👥",
        },
        {
            label: "MRR",
            value: formatCurrency(metrics?.mrr || 0),
            sublabel: `ARR: ${formatCurrency(metrics?.arr || 0)}`,
            icon: "📈",
        },
        {
            label: "Churn Rate",
            value: `${metrics?.churnRate || 0}%`,
            isGood: (metrics?.churnRate || 0) < 5,
            icon: "📊",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">{card.label}</span>
                        <span className="text-2xl">{card.icon}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                        {card.value}
                    </div>
                    {card.change !== undefined && (
                        <div className={`text-sm font-medium ${card.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {card.change >= 0 ? '↑' : '↓'} {Math.abs(card.change)}% vs last month
                        </div>
                    )}
                    {card.sublabel && (
                        <div className="text-xs text-gray-400 mt-1">
                            {card.sublabel}
                        </div>
                    )}
                    {card.isGood !== undefined && (
                        <div className={`text-sm font-medium ${card.isGood ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {card.isGood ? '✓ Healthy' : '⚠ Above target'}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
