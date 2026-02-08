"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface LearningCalendarProps {
    userId: string;
}

/**
 * GitHub-style Learning Calendar Heatmap
 */
export default function LearningCalendar({ userId }: LearningCalendarProps) {
    const [activityData, setActivityData] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        async function loadData() {
            const supabase = createClient();

            // Get activity from last 365 days
            const startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 1);

            const { data: progress } = await supabase
                .from('video_progress')
                .select('updated_at')
                .eq('user_id', userId)
                .gte('updated_at', startDate.toISOString());

            if (!progress) {
                setLoading(false);
                return;
            }

            // Group by date
            const counts: Record<string, number> = {};
            progress.forEach(p => {
                const date = p.updated_at.split('T')[0];
                counts[date] = (counts[date] || 0) + 1;
            });

            setActivityData(counts);
            setLoading(false);
        }
        loadData();
    }, [userId]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const cellSize = 12;
        const cellGap = 3;
        const weeks = 52;
        const days = 7;
        const padding = { top: 20, right: 10, bottom: 10, left: 30 };

        const width = padding.left + weeks * (cellSize + cellGap) + padding.right;
        const height = padding.top + days * (cellSize + cellGap) + padding.bottom;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, width, height);

        // Find max activity
        const maxActivity = Math.max(...Object.values(activityData), 1);

        // Draw day labels
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'right';
        [1, 3, 5].forEach(d => {
            const y = padding.top + d * (cellSize + cellGap) + cellSize / 2 + 3;
            ctx.fillText(dayLabels[d], padding.left - 5, y);
        });

        // Draw cells
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - (weeks * 7 - 1));

        // Adjust to start from Sunday
        startDate.setDate(startDate.getDate() - startDate.getDay());

        for (let week = 0; week < weeks; week++) {
            for (let day = 0; day < days; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + week * 7 + day);

                if (currentDate > today) continue;

                const dateStr = currentDate.toISOString().split('T')[0];
                const activity = activityData[dateStr] || 0;

                const x = padding.left + week * (cellSize + cellGap);
                const y = padding.top + day * (cellSize + cellGap);

                // Color based on activity level
                let color = '#ebedf0';
                if (activity > 0) {
                    const intensity = Math.min(activity / maxActivity, 1);
                    if (intensity < 0.25) color = '#9be9a8';
                    else if (intensity < 0.5) color = '#40c463';
                    else if (intensity < 0.75) color = '#30a14e';
                    else color = '#216e39';
                }

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.roundRect(x, y, cellSize, cellSize, 2);
                ctx.fill();
            }
        }

        // Draw month labels
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'left';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let lastMonth = -1;
        for (let week = 0; week < weeks; week++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + week * 7);
            const month = date.getMonth();

            if (month !== lastMonth) {
                const x = padding.left + week * (cellSize + cellGap);
                ctx.fillText(months[month], x, padding.top - 5);
                lastMonth = month;
            }
        }

    }, [activityData]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-32 flex items-center justify-center text-gray-400">
                    Loading...
                </div>
            </div>
        );
    }

    const totalDays = Object.keys(activityData).length;
    const totalActivity = Object.values(activityData).reduce((sum, v) => sum + v, 0);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Learning Activity</h3>
                <span className="text-sm text-gray-500">
                    {totalDays} active days • {totalActivity} lessons
                </span>
            </div>

            <div className="overflow-x-auto">
                <canvas ref={canvasRef} />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
                Less
                <span className="w-3 h-3 rounded" style={{ backgroundColor: '#ebedf0' }}></span>
                <span className="w-3 h-3 rounded" style={{ backgroundColor: '#9be9a8' }}></span>
                <span className="w-3 h-3 rounded" style={{ backgroundColor: '#40c463' }}></span>
                <span className="w-3 h-3 rounded" style={{ backgroundColor: '#30a14e' }}></span>
                <span className="w-3 h-3 rounded" style={{ backgroundColor: '#216e39' }}></span>
                More
            </div>
        </div>
    );
}
