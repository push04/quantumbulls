"use client";

import { useEffect, useState, useRef } from "react";
import { getSubscriptionBreakdown, type SubscriptionBreakdown } from "@/lib/analytics/revenueCalculator";

const TIER_COLORS: Record<string, string> = {
    free: '#94a3b8',
    basic: '#3b82f6',
    medium: '#8b5cf6',
    advanced: '#2EBD59',
};

const TIER_LABELS: Record<string, string> = {
    free: 'Free',
    basic: 'Basic (₹499)',
    medium: 'Medium (₹999)',
    advanced: 'Advanced (₹1999)',
};

/**
 * Subscription Pie Chart
 */
export default function SubscriptionPieChart() {
    const [breakdown, setBreakdown] = useState<SubscriptionBreakdown[]>([]);
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        async function loadData() {
            const data = await getSubscriptionBreakdown();
            setBreakdown(data);
            setLoading(false);
        }
        loadData();
    }, []);

    useEffect(() => {
        if (!canvasRef.current || breakdown.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        const size = 200;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = 80;
        const innerRadius = 50;

        // Clear
        ctx.clearRect(0, 0, size, size);

        // Filter out zero counts and calculate angles
        const nonZero = breakdown.filter(b => b.count > 0);
        const total = nonZero.reduce((sum, b) => sum + b.count, 0);

        if (total === 0) return;

        let startAngle = -Math.PI / 2;

        nonZero.forEach(segment => {
            const sliceAngle = (segment.count / total) * Math.PI * 2;
            const endAngle = startAngle + sliceAngle;

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = TIER_COLORS[segment.tier] || '#666';
            ctx.fill();

            startAngle = endAngle;
        });

        // Draw inner circle (donut hole)
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        // Draw center text
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 24px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(total.toString(), centerX, centerY - 8);
        ctx.font = '12px system-ui';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('users', centerX, centerY + 12);

    }, [breakdown]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-48 flex items-center justify-center text-gray-400">
                    Loading...
                </div>
            </div>
        );
    }

    const total = breakdown.reduce((sum, b) => sum + b.count, 0);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Subscription Breakdown</h3>

            <div className="flex items-center gap-8">
                {/* Pie Chart */}
                <div className="flex-shrink-0">
                    <canvas
                        ref={canvasRef}
                        className="w-[200px] h-[200px]"
                        style={{ width: 200, height: 200 }}
                    />
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3">
                    {breakdown.filter(b => b.count > 0).map(b => (
                        <div key={b.tier} className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: TIER_COLORS[b.tier] }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700 truncate">
                                        {TIER_LABELS[b.tier] || b.tier}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 ml-2">
                                        {b.count}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${(b.count / total) * 100}%`,
                                            backgroundColor: TIER_COLORS[b.tier]
                                        }}
                                    />
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 w-10 text-right">
                                {b.percentage}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
