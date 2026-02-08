"use client";

import { useEffect, useState } from "react";
import { getDropoffPoints, formatDuration, type DropoffPoint } from "@/lib/analytics/contentAnalytics";

/**
 * Video Drop-off Points Analysis
 */
export default function DropoffChart() {
    const [dropoffs, setDropoffs] = useState<DropoffPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const data = await getDropoffPoints(10);
            setDropoffs(data);
            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-64 flex items-center justify-center text-gray-400">
                    Loading...
                </div>
            </div>
        );
    }

    if (dropoffs.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Drop-off Analysis</h3>
                <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-2">📊</div>
                    Not enough data yet. Need more video views to analyze drop-offs.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Drop-off Analysis</h3>
                <p className="text-sm text-gray-500">
                    Videos with highest exit rates (potential quality issues)
                </p>
            </div>

            <div className="divide-y divide-gray-100">
                {dropoffs.map((video, index) => (
                    <div
                        key={video.videoId}
                        className="p-4 flex items-center gap-4 hover:bg-gray-50"
                    >
                        {/* Rank */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index < 3
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                            {index + 1}
                        </div>

                        {/* Video info */}
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                                {video.title}
                            </div>
                            <div className="text-sm text-gray-500">
                                Avg exit at {formatDuration(video.avgExitTime)} • {video.exitCount} exits
                            </div>
                        </div>

                        {/* Drop-off bar */}
                        <div className="w-32">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${video.exitPercentage >= 50 ? 'bg-red-500' :
                                            video.exitPercentage >= 30 ? 'bg-amber-500' : 'bg-yellow-500'
                                        }`}
                                    style={{ width: `${video.exitPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Percentage */}
                        <div className={`text-sm font-bold w-12 text-right ${video.exitPercentage >= 50 ? 'text-red-600' :
                                video.exitPercentage >= 30 ? 'text-amber-600' : 'text-yellow-600'
                            }`}>
                            {video.exitPercentage}%
                        </div>

                        {/* Action */}
                        <button className="text-sm text-[#2EBD59] hover:underline">
                            Review
                        </button>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-amber-50 border-t border-amber-100">
                <p className="text-sm text-amber-800">
                    💡 <strong>Tip:</strong> Videos with &gt;50% drop-off may need
                    re-editing, better intro, or content restructuring.
                </p>
            </div>
        </div>
    );
}
