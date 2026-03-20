"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSessionsForMonth, type LiveSession } from "@/lib/live";

// NSE/BSE Official Market Holidays 2025
const NSE_HOLIDAYS_2025: Record<string, string> = {
    "2025-01-26": "Republic Day",
    "2025-02-26": "Mahashivratri",
    "2025-03-14": "Holi",
    "2025-03-31": "Id-Ul-Fitr (Ramzan Id)",
    "2025-04-10": "Ram Navami",
    "2025-04-14": "Dr. Ambedkar Jayanti",
    "2025-04-18": "Good Friday",
    "2025-05-01": "Maharashtra Day",
    "2025-08-15": "Independence Day",
    "2025-08-27": "Ganesh Chaturthi",
    "2025-10-02": "Gandhi Jayanti / Dussehra",
    "2025-10-20": "Diwali Laxmi Pujan",
    "2025-10-21": "Diwali Balipratipada",
    "2025-11-05": "Gurunanak Jayanti",
    "2025-12-25": "Christmas",
};

function getHoliday(year: number, month: number, day: number): string | null {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return NSE_HOLIDAYS_2025[key] ?? null;
}

function isWeekend(year: number, month: number, day: number): boolean {
    const d = new Date(year, month, day).getDay();
    return d === 0 || d === 6;
}

/**
 * Session Calendar Component
 * Monthly calendar view of live sessions with NSE/BSE market holiday indicators
 */
export default function SessionCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredCell, setHoveredCell] = useState<number | null>(null);

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

    const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Build calendar grid
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDays: {
        date: number;
        isCurrentMonth: boolean;
        sessions: LiveSession[];
        holiday: string | null;
        weekend: boolean;
    }[] = [];

    // Previous month filler days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        calendarDays.push({
            date: d,
            isCurrentMonth: false,
            sessions: [],
            holiday: getHoliday(year, month - 1, d),
            weekend: isWeekend(year, month - 1, d),
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
            holiday: getHoliday(year, month, day),
            weekend: isWeekend(year, month, day),
        });
    }

    // Next month filler days
    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push({
            date: i,
            isCurrentMonth: false,
            sessions: [],
            holiday: getHoliday(year, month + 1, i),
            weekend: isWeekend(year, month + 1, i),
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
                        className={`py-2 text-center text-xs font-medium uppercase ${
                            day === "Sun" || day === "Sat" ? "text-red-400" : "text-gray-500"
                        }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className={`grid grid-cols-7 ${loading ? "opacity-50" : ""}`}>
                {calendarDays.map((day, index) => {
                    const isClosed = day.isCurrentMonth && (day.holiday !== null || day.weekend);
                    const isOpen = day.isCurrentMonth && !isClosed;

                    return (
                        <div
                            key={index}
                            className={`min-h-[100px] p-2 border-b border-r border-gray-100 relative ${
                                !day.isCurrentMonth
                                    ? "bg-gray-50"
                                    : day.holiday
                                    ? "bg-red-50"
                                    : day.weekend
                                    ? "bg-orange-50/40"
                                    : "bg-white"
                            }`}
                            onMouseEnter={() => setHoveredCell(index)}
                            onMouseLeave={() => setHoveredCell(null)}
                        >
                            {/* Date number + status dot */}
                            <div className="flex items-start justify-between mb-0.5">
                                <div
                                    className={`text-sm font-medium ${
                                        !day.isCurrentMonth
                                            ? "text-gray-300"
                                            : day.weekend
                                            ? "text-red-400"
                                            : "text-gray-900"
                                    } ${
                                        day.isCurrentMonth && isToday(day.date)
                                            ? "w-7 h-7 bg-[#2EBD59] !text-white rounded-full flex items-center justify-center text-xs"
                                            : ""
                                    }`}
                                >
                                    {day.date}
                                </div>

                                {/* Market status badge */}
                                {day.isCurrentMonth && (
                                    <span className="text-[10px] leading-none shrink-0">
                                        {day.holiday ? "🔴" : day.weekend ? "🔴" : "🟢"}
                                    </span>
                                )}
                            </div>

                            {/* Holiday name (inline) */}
                            {day.isCurrentMonth && day.holiday && (
                                <div className="text-[9px] text-red-500 font-semibold leading-tight truncate mb-1">
                                    {day.holiday}
                                </div>
                            )}
                            {day.isCurrentMonth && !day.holiday && day.weekend && (
                                <div className="text-[9px] text-orange-400 leading-tight mb-1">
                                    Weekend
                                </div>
                            )}

                            {/* Tooltip on hover for holidays */}
                            {hoveredCell === index && day.isCurrentMonth && (day.holiday || day.weekend) && (
                                <div className="absolute z-20 left-1 top-10 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-2 shadow-xl whitespace-nowrap pointer-events-none">
                                    <div className="font-semibold mb-0.5">🔴 Market Closed</div>
                                    <div className="text-gray-300">
                                        {day.holiday ?? (day.weekend ? "Weekend — No Trading" : "")}
                                    </div>
                                </div>
                            )}
                            {hoveredCell === index && isOpen && (
                                <div className="absolute z-20 left-1 top-10 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-2 shadow-xl whitespace-nowrap pointer-events-none">
                                    <div className="font-semibold">🟢 Market Open</div>
                                    <div className="text-gray-300">NSE/BSE Trading Day</div>
                                </div>
                            )}

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
                                                className={`w-2 h-2 rounded-full ${tierColors[session.min_tier]} ${
                                                    session.status === "live" ? "animate-pulse" : ""
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
                    );
                })}
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-200 flex flex-wrap gap-x-5 gap-y-2 items-center">
                {/* Market status legend */}
                <div className="flex items-center gap-1.5">
                    <span className="text-sm">🟢</span>
                    <span className="text-xs text-gray-500">Market Open</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-sm">🔴</span>
                    <span className="text-xs text-gray-500">NSE Holiday / Weekend</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-red-50 border border-red-200 inline-block" />
                    <span className="text-xs text-gray-500">Holiday</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-orange-50 border border-orange-200 inline-block" />
                    <span className="text-xs text-gray-500">Weekend</span>
                </div>
            </div>
        </div>
    );
}
