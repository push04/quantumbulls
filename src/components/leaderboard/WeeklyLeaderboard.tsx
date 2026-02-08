"use client";

import { LEVELS, type UserLevel } from "@/lib/engagement/xpManager";

interface LeaderboardEntry {
    rank: number;
    userId: string;
    userName: string;
    avatarUrl?: string;
    level: UserLevel;
    totalXP: number;
    isCurrentUser?: boolean;
}

interface WeeklyLeaderboardProps {
    entries: LeaderboardEntry[];
    periodLabel?: string;
    currentUserRank?: number;
}

/**
 * Weekly Leaderboard
 */
export default function WeeklyLeaderboard({
    entries,
    periodLabel = 'This Week',
    currentUserRank
}: WeeklyLeaderboardProps) {
    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const getRankClass = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-200';
        if (rank === 2) return 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-200';
        if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
        return 'bg-white border-gray-100';
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🏆</span>
                        <h3 className="font-semibold text-gray-900">Leaderboard</h3>
                    </div>
                    <span className="text-sm text-gray-500">{periodLabel}</span>
                </div>
            </div>

            {/* Entries */}
            <div className="divide-y divide-gray-100">
                {entries.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No entries yet. Start learning to climb the ranks!
                    </div>
                ) : (
                    entries.map((entry) => (
                        <div
                            key={entry.userId}
                            className={`flex items-center gap-4 p-4 transition-colors ${getRankClass(entry.rank)
                                } ${entry.isCurrentUser ? 'ring-2 ring-[#2EBD59] ring-inset' : ''}`}
                        >
                            {/* Rank */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${entry.rank <= 3 ? 'text-xl' : 'text-sm text-gray-500 bg-gray-100'
                                }`}>
                                {getRankEmoji(entry.rank)}
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {entry.avatarUrl ? (
                                    <img
                                        src={entry.avatarUrl}
                                        alt={entry.userName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-500 font-medium">
                                        {entry.userName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Name and level */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`font-medium truncate ${entry.isCurrentUser ? 'text-[#2EBD59]' : 'text-gray-900'
                                        }`}>
                                        {entry.userName}
                                        {entry.isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <span>{LEVELS[entry.level].icon}</span>
                                    <span>{LEVELS[entry.level].level}</span>
                                </div>
                            </div>

                            {/* XP */}
                            <div className="text-right">
                                <div className="font-bold text-gray-900">
                                    {entry.totalXP.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">XP</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Current user rank (if not in top 10) */}
            {currentUserRank && currentUserRank > 10 && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                    <span className="text-sm text-gray-500">
                        Your rank: <span className="font-bold text-gray-900">#{currentUserRank}</span>
                    </span>
                </div>
            )}
        </div>
    );
}
