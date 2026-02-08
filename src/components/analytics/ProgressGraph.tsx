"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface ProgressGraphProps {
    userId: string;
}

/**
 * 90-Day Progress Graph
 */
export default function ProgressGraph({ userId }: ProgressGraphProps) {
    const [data, setData] = useState<{ date: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 90);

            const { data: progress } = await supabase
                .from('video_progress')
                .select('updated_at')
                .eq('user_id', userId)
                .gte('updated_at', startDate.toISOString());

            // Group by date
            const counts: Record<string, number> = {};

            // Initialize all 90 days
            for (let i = 0; i < 90; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                counts[date.toISOString().split('T')[0]] = 0;
            }

            progress?.forEach(p => {
                const date = p.updated_at.split('T')[0];
                counts[date] = (counts[date] || 0) + 1;
            });

            const result = Object.entries(counts)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => a.date.localeCompare(b.date));

            setData(result);
            setLoading(false);
        }
        loadData();
    }, [userId]);

    useEffect(() => {
        if (!canvasRef.current || data.length === 0) return;

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
        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);

        const maxCount = Math.max(...data.map(d => d.count), 1);

        // Draw grid
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight * i) / 4;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Y labels
            const value = Math.round(maxCount - (maxCount * i) / 4);
            ctx.fillStyle = '#9ca3af';
            ctx.font = '10px system-ui';
            ctx.textAlign = 'right';
            ctx.fillText(value.toString(), padding.left - 8, y + 4);
        }

        // Calculate points
        const points = data.map((d, i) => ({
            x: padding.left + (i / (data.length - 1)) * chartWidth,
            y: padding.top + chartHeight - (d.count / maxCount) * chartHeight,
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

        // X labels (every 30 days)
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        [0, 30, 60, 89].forEach(i => {
            if (i < data.length) {
                const x = padding.left + (i / (data.length - 1)) * chartWidth;
                const date = new Date(data[i].date);
                ctx.fillText(`${date.getDate()}/${date.getMonth() + 1}`, x, height - padding.bottom + 16);
            }
        });

    }, [data]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-48 flex items-center justify-center text-gray-400">
                    Loading...
                </div>
            </div>
        );
    }

    // Calculate trend
    const firstHalf = data.slice(0, 45).reduce((sum, d) => sum + d.count, 0);
    const secondHalf = data.slice(45).reduce((sum, d) => sum + d.count, 0);
    const trend = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : 0;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900">Study Consistency (90 Days)</h3>
                    <p className="text-sm text-gray-500">
                        {data.reduce((sum, d) => sum + d.count, 0)} lessons completed
                    </p>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded ${trend >= 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-100'
                    }`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% trend
                </span>
            </div>

            <div className="h-48">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    );
}
