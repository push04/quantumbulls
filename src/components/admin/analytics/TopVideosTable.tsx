"use client";

import { useEffect, useState } from "react";
import { getTopVideos, formatDuration, type VideoStats } from "@/lib/analytics/contentAnalytics";

interface TopVideosTableProps {
    limit?: number;
}

/**
 * Top Watched Videos Table
 */
export default function TopVideosTable({ limit = 20 }: TopVideosTableProps) {
    const [videos, setVideos] = useState<VideoStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'views' | 'completions' | 'completionRate'>('views');

    useEffect(() => {
        async function loadData() {
            const data = await getTopVideos(limit);
            setVideos(data);
            setLoading(false);
        }
        loadData();
    }, [limit]);

    const sortedVideos = [...videos].sort((a, b) => b[sortBy] - a[sortBy]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-64 flex items-center justify-center text-gray-400">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Top Watched Videos</h3>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20"
                >
                    <option value="views">Sort by Views</option>
                    <option value="completions">Sort by Completions</option>
                    <option value="completionRate">Sort by Completion Rate</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
                                #
                            </th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
                                Video
                            </th>
                            <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
                                Course
                            </th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">
                                Views
                            </th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">
                                Completions
                            </th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">
                                Avg Watch
                            </th>
                            <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">
                                Completion %
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedVideos.map((video, index) => (
                            <tr key={video.videoId} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                        {video.title}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {video.courseTitle}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                    {video.views.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right text-sm text-gray-600">
                                    {video.completions.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right text-sm text-gray-600">
                                    {formatDuration(video.avgWatchTime)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`text-sm font-medium px-2 py-0.5 rounded ${video.completionRate >= 70
                                        ? 'text-green-700 bg-green-50'
                                        : video.completionRate >= 40
                                            ? 'text-amber-700 bg-amber-50'
                                            : 'text-red-700 bg-red-100'
                                        }`}>
                                        {video.completionRate}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {videos.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    No video data available yet.
                </div>
            )}
        </div>
    );
}
