"use client";

import { useEffect, useState, useRef } from "react";
import { getDeviceBreakdown } from "@/lib/analytics/eventTracker";

const DEVICE_COLORS: Record<string, string> = {
    desktop: '#3b82f6',
    mobile: '#2EBD59',
    tablet: '#f59e0b',
    unknown: '#94a3b8',
};

const DEVICE_ICONS: Record<string, string> = {
    desktop: '🖥️',
    mobile: '📱',
    tablet: '📱',
    unknown: '❓',
};

/**
 * Device Breakdown Chart
 */
export default function DeviceBreakdown() {
    const [devices, setDevices] = useState<{ device: string; count: number; percentage: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        async function loadData() {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const data = await getDeviceBreakdown(startDate, endDate);
            setDevices(data);
            setLoading(false);
        }
        loadData();
    }, []);

    useEffect(() => {
        if (!canvasRef.current || devices.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const size = 160;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = 70;
        const innerRadius = 45;

        ctx.clearRect(0, 0, size, size);

        const total = devices.reduce((sum, d) => sum + d.count, 0);
        if (total === 0) return;

        let startAngle = -Math.PI / 2;

        devices.forEach(segment => {
            const sliceAngle = (segment.count / total) * Math.PI * 2;
            const endAngle = startAngle + sliceAngle;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = DEVICE_COLORS[segment.device] || DEVICE_COLORS.unknown;
            ctx.fill();

            startAngle = endAngle;
        });

        // Donut hole
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

    }, [devices]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-48 flex items-center justify-center text-gray-400">
                    Loading...
                </div>
            </div>
        );
    }

    if (devices.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                <div className="text-center py-8 text-gray-500">
                    No device data available yet.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Device Breakdown</h3>

            <div className="flex items-center gap-6">
                {/* Chart */}
                <div className="flex-shrink-0">
                    <canvas
                        ref={canvasRef}
                        className="w-40 h-40"
                        style={{ width: 160, height: 160 }}
                    />
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3">
                    {devices.map(d => (
                        <div key={d.device} className="flex items-center gap-3">
                            <span className="text-xl">{DEVICE_ICONS[d.device] || '❓'}</span>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                        {d.device}
                                    </span>
                                    <span className="text-sm text-gray-900 font-bold">
                                        {d.percentage}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${d.percentage}%`,
                                            backgroundColor: DEVICE_COLORS[d.device] || DEVICE_COLORS.unknown
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
