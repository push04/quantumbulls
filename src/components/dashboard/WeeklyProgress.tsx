"use client";

import type { WeeklyActivity } from "@/lib/learning/progressCalculator";

interface WeeklyProgressProps {
    data: WeeklyActivity[];
}

/**
 * Weekly Progress Bar Chart
 */
export default function WeeklyProgress({ data }: WeeklyProgressProps) {
    // Find max for scaling
    const maxMinutes = Math.max(...data.map(d => d.minutesWatched), 30);

    // Total this week
    const totalMinutes = data.reduce((sum, d) => sum + d.minutesWatched, 0);
    const totalLessons = data.reduce((sum, d) => sum + d.lessonsCompleted, 0);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Your Progress This Week</h3>
                <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{totalMinutes}</span> min •
                    <span className="font-medium text-gray-900"> {totalLessons}</span> lessons
                </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-2 h-32">
                {data.map((day, i) => {
                    const height = maxMinutes > 0
                        ? Math.max((day.minutesWatched / maxMinutes) * 100, 4)
                        : 4;
                    const isToday = i === data.length - 1;

                    return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                            {/* Bar container */}
                            <div className="w-full h-full flex items-end justify-center">
                                <div
                                    className={`w-full max-w-8 rounded-t-lg transition-all ${day.minutesWatched > 0
                                            ? isToday
                                                ? 'bg-[#2EBD59]'
                                                : 'bg-[#2EBD59]/60'
                                            : 'bg-gray-100'
                                        }`}
                                    style={{ height: `${height}%` }}
                                    title={`${day.minutesWatched} min watched`}
                                />
                            </div>
                            {/* Day label */}
                            <span className={`text-xs ${isToday ? 'font-semibold text-gray-900' : 'text-gray-500'
                                }`}>
                                {day.dayName}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Legend / Encouragement */}
            {totalMinutes === 0 ? (
                <p className="text-center text-sm text-gray-500 mt-4">
                    Start watching to see your progress here! 🚀
                </p>
            ) : totalMinutes < 30 ? (
                <p className="text-center text-sm text-gray-500 mt-4">
                    Great start! Keep the momentum going! 💪
                </p>
            ) : (
                <p className="text-center text-sm text-gray-500 mt-4">
                    Amazing progress this week! You&apos;re on fire! 🔥
                </p>
            )}
        </div>
    );
}
