"use client";

import { useEffect, useState, useRef } from "react";
import { getRevenueByDateRange, formatCurrency } from "@/lib/analytics/revenueCalculator";

/**
 * Revenue Chart - 30 Day Line Graph
 */
export default function RevenueChart() {
    const [data, setData] = useState<{ date: string; revenue: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        async function loadData() {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const revenueData = await getRevenueByDateRange(startDate, endDate);
            setData(revenueData);
            setLoading(false);
        }
        loadData();
    }, []);

    useEffect(() => {
        if (!canvasRef.current || data.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Find max value
        const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
        const minRevenue = 0;

        // Draw grid lines
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight * i) / 4;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Y axis labels
            const value = maxRevenue - (maxRevenue * i) / 4;
            ctx.fillStyle = '#9ca3af';
            ctx.font = '11px system-ui';
            ctx.textAlign = 'right';
            ctx.fillText(formatCurrency(value), padding.left - 8, y + 4);
        }

        // Calculate points
        const points = data.map((d, i) => ({
            x: padding.left + (i / (data.length - 1)) * chartWidth,
            y: padding.top + chartHeight - ((d.revenue - minRevenue) / (maxRevenue - minRevenue)) * chartHeight,
            revenue: d.revenue,
            date: d.date,
        }));

        // Draw gradient area
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, 'rgba(46, 189, 89, 0.3)');
        gradient.addColorStop(1, 'rgba(46, 189, 89, 0)');

        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding.bottom);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = '#2EBD59';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Draw points
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#2EBD59';
            ctx.fill();
        });

        // X axis labels (every 7 days)
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        data.forEach((d, i) => {
            if (i % 7 === 0 || i === data.length - 1) {
                const x = padding.left + (i / (data.length - 1)) * chartWidth;
                const date = new Date(d.date);
                const label = `${date.getDate()}/${date.getMonth() + 1}`;
                ctx.fillText(label, x, height - padding.bottom + 16);
            }
        });

    }, [data]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-64 flex items-center justify-center text-gray-400">
                    Loading chart...
                </div>
            </div>
        );
    }

    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900">Revenue (Last 30 Days)</h3>
                    <p className="text-sm text-gray-500">
                        Total: {formatCurrency(totalRevenue)}
                    </p>
                </div>
                <div className="text-sm text-gray-400">
                    {data.length} days
                </div>
            </div>
            <div className="h-64">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
}
