"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSessionsForMonth, type LiveSession } from "@/lib/live";

/**
 * Session Calendar Component
 * Monthly calendar view of live sessions
 */
export default function SessionCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [loading, setLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const data = await getSessionsForMonth(year, month);
                setSessions(data);
            } catch (error) {
                console.error("Failed to load sessions:", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [year, month]);

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Get calendar grid data
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDays: { date: number; isCurrentMonth: boolean; sessions: LiveSession[] }[] = [];

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        calendarDays.push({
            date: daysInPrevMonth - i,
            isCurrentMonth: false,
            sessions: [],
        });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const daySessions = sessions.filter(s => {
            const sessionDate = new Date(s.scheduled_at);
            return sessionDate.toDateString() === dayDate.toDateString();
        });

        calendarDays.push({
            date: day,
            isCurrentMonth: true,
            sessions: daySessions,
        });
    }

    // Next month days to fill grid
    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push({
            date: i,
            isCurrentMonth: false,
            sessions: [],
        });
    }

    const today = new Date();
    const isToday = (day: number) =>
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const tierColors: Record<string, string> = {
        free: "bg-gray-500",
        basic: "bg-blue-500",
        medium: "bg-purple-500",
        advanced: "bg-amber-500",
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                    {currentDate.toLocaleDateString("en", { month: "long", year: "numeric" })}
                </h2>
                <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="py-2 text-center text-xs font-medium text-gray-500 uppercase"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className={`grid grid-cols-7 ${loading ? "opacity-50" : ""}`}>
                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        className={`min-h-[100px] p-2 border-b border-r border-gray-100 ${day.isCurrentMonth ? "bg-white" : "bg-gray-50"
                            }`}
                    >
                        <div
                            className={`text-sm font-medium mb-1 ${day.isCurrentMonth ? "text-gray-900" : "text-gray-400"
                                } ${day.isCurrentMonth && isToday(day.date)
                                    ? "w-7 h-7 bg-[#2EBD59] text-white rounded-full flex items-center justify-center"
                                    : ""
                                }`}
                        >
                            {day.date}
                        </div>

                        {/* Session dots */}
                        <div className="space-y-1">
                            {day.sessions.slice(0, 3).map((session) => (
                                <Link
                                    key={session.id}
                                    href={`/live/${session.id}`}
                                    className="block group"
                                >
                                    <div className="flex items-center gap-1">
                                        <div
                                            className={`w-2 h-2 rounded-full ${tierColors[session.min_tier]} ${session.status === "live" ? "animate-pulse" : ""
                                                }`}
                                        />
                                        <span className="text-xs text-gray-600 truncate group-hover:text-[#2EBD59]">
                                            {new Date(session.scheduled_at).toLocaleTimeString("en", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                            {day.sessions.length > 3 && (
                                <span className="text-xs text-gray-400">
                                    +{day.sessions.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-200 flex gap-4">
                {Object.entries(tierColors).map(([tier, color]) => (
                    <div key={tier} className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="text-xs text-gray-500 capitalize">{tier}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
