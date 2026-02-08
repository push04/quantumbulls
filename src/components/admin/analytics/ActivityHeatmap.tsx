"use client";

import { useEffect, useState, useRef } from "react";
import { getActivityByHour } from "@/lib/analytics/eventTracker";

/**
 * Activity Heatmap - When users are most active
 */
export default function ActivityHeatmap() {
    const [hourData, setHourData] = useState<{ hour: number; count: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        async function loadData() {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const data = await getActivityByHour(startDate, endDate);
            setHourData(data);
            setLoading(false);
        }
        loadData();
    }, []);

    useEffect(() => {
        if (!canvasRef.current || hourData.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const padding = { top: 30, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);

        const maxCount = Math.max(...hourData.map(d => d.count), 1);
        const barWidth = chartWidth / 24 - 2;

        // Draw hours
        hourData.forEach((d, i) => {
            const x = padding.left + (i / 24) * chartWidth;
            const barHeight = (d.count / maxCount) * chartHeight;
            const y = padding.top + chartHeight - barHeight;

            // Color based on intensity
            const intensity = d.count / maxCount;
            const hue = 145; // Green
            const saturation = 70;
            const lightness = 75 - (intensity * 40); // Darker = more active
            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

            ctx.beginPath();
            ctx.roundRect(x + 1, y, barWidth, barHeight, 2);
            ctx.fill();

            // Hour label (every 3 hours)
            if (i % 3 === 0) {
                ctx.fillStyle = '#9ca3af';
                ctx.font = '10px system-ui';
                ctx.textAlign = 'center';
                const label = `${i.toString().padStart(2, '0')}:00`;
                ctx.fillText(label, x + barWidth / 2 + 1, height - padding.bottom + 16);
            }
        });

        // Title
        ctx.fillStyle = '#374151';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('Activity by Hour (Last 30 Days)', padding.left, padding.top - 10);

    }, [hourData]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-48 flex items-center justify-center text-gray-400">
                    Loading...
                </div>
            </div>
        );
    }

    // Find peak hours
    const sortedHours = [...hourData].sort((a, b) => b.count - a.count);
    const peakHour = sortedHours[0]?.hour || 0;
    const peakLabel = `${peakHour.toString().padStart(2, '0')}:00 - ${(peakHour + 1).toString().padStart(2, '0')}:00`;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">User Activity Pattern</h3>
                <span className="text-sm text-[#2EBD59] font-medium">
                    Peak: {peakLabel}
                </span>
            </div>

            <div className="h-48">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-500">
                <span className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(145, 70%, 75%)' }}></span>
                Low
                <span className="w-4 h-4 rounded ml-2" style={{ backgroundColor: 'hsl(145, 70%, 55%)' }}></span>
                Medium
                <span className="w-4 h-4 rounded ml-2" style={{ backgroundColor: 'hsl(145, 70%, 35%)' }}></span>
                High
            </div>
        </div>
    );
}
