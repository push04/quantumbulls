"use client";

import { useEffect, useState, useRef } from "react";
import { getCourseStats, type CourseStats } from "@/lib/analytics/contentAnalytics";

/**
 * Course Completion Rates Chart
 */
export default function CompletionRates() {
    const [courses, setCourses] = useState<CourseStats[]>([]);
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        async function loadData() {
            const data = await getCourseStats();
            setCourses(data);
            setLoading(false);
        }
        loadData();
    }, []);

    useEffect(() => {
        if (!canvasRef.current || courses.length === 0) return;

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
        const barHeight = 30;
        const gap = 12;
        const labelWidth = 150;
        const padding = { left: labelWidth + 20, right: 60, top: 10, bottom: 10 };
        const chartWidth = width - padding.left - padding.right;

        ctx.clearRect(0, 0, width, height);

        courses.slice(0, 8).forEach((course, i) => {
            const y = padding.top + i * (barHeight + gap);

            // Label
            ctx.fillStyle = '#374151';
            ctx.font = '12px system-ui';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const label = course.title.length > 20
                ? course.title.substring(0, 17) + '...'
                : course.title;
            ctx.fillText(label, padding.left - 10, y + barHeight / 2);

            // Background bar
            ctx.fillStyle = '#f3f4f6';
            ctx.beginPath();
            ctx.roundRect(padding.left, y, chartWidth, barHeight, 4);
            ctx.fill();

            // Progress bar
            const progress = (course.completionRate / 100) * chartWidth;
            const color = course.completionRate >= 60 ? '#2EBD59' :
                course.completionRate >= 40 ? '#f59e0b' : '#ef4444';
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(padding.left, y, progress, barHeight, 4);
            ctx.fill();

            // Value label
            ctx.fillStyle = '#374151';
            ctx.font = 'bold 12px system-ui';
            ctx.textAlign = 'left';
            ctx.fillText(
                `${course.completionRate}%`,
                padding.left + chartWidth + 10,
                y + barHeight / 2
            );
        });

    }, [courses]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-64 flex items-center justify-center text-gray-400">
                    Loading...
                </div>
            </div>
        );
    }

    const avgCompletion = courses.length > 0
        ? Math.round(courses.reduce((sum, c) => sum + c.completionRate, 0) / courses.length)
        : 0;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900">Course Completion Rates</h3>
                    <p className="text-sm text-gray-500">
                        Average: <span className="font-medium">{avgCompletion}%</span>
                    </p>
                </div>
                <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-[#2EBD59] rounded"></span> ≥60%
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-amber-500 rounded"></span> 40-59%
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-red-500 rounded"></span> &lt;40%
                    </span>
                </div>
            </div>

            <div style={{ height: Math.max(200, courses.slice(0, 8).length * 42) }}>
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {courses.length > 8 && (
                <p className="text-sm text-gray-400 mt-2 text-center">
                    Showing top 8 courses
                </p>
            )}
        </div>
    );
}
