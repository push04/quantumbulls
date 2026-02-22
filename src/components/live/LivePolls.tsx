"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Icon from "@/components/ui/Icon";

interface Poll {
    id: string;
    session_id: string;
    question: string;
    options: string[];
    is_active: boolean;
    show_results: boolean;
}

interface PollResult {
    option_index: number;
    vote_count: number;
}

interface LivePollsProps {
    sessionId: string;
    userId: string;
    isAdmin?: boolean;
}

/**
 * Live Polls Component
 * Real-time polling during live sessions
 */
export default function LivePolls({ sessionId, userId, isAdmin }: LivePollsProps) {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [userVotes, setUserVotes] = useState<Record<string, number>>({});
    const [results, setResults] = useState<Record<string, PollResult[]>>({});
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const loadPollResults = async (pollId: string) => {
        const { data } = await supabase.rpc("get_poll_results", { poll_uuid: pollId });
        if (data) {
            setResults(prev => ({ ...prev, [pollId]: data }));
        }
    };

    // Load polls and subscribe to changes
    useEffect(() => {
        async function loadPolls() {
            const { data: pollsData } = await supabase
                .from("session_polls")
                .select("*")
                .eq("session_id", sessionId)
                .order("created_at", { ascending: false });

            setPolls(pollsData || []);

            // Load user's votes
            const { data: votes } = await supabase
                .from("poll_votes")
                .select("poll_id, option_index")
                .eq("user_id", userId);

            const votesMap: Record<string, number> = {};
            votes?.forEach(v => {
                votesMap[v.poll_id] = v.option_index;
            });
            setUserVotes(votesMap);

            // Load results for each poll
            for (const poll of pollsData || []) {
                await loadPollResults(poll.id);
            }

            setLoading(false);
        }

        loadPolls();

        // Subscribe to poll changes
        const channel = supabase
            .channel(`polls-${sessionId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "session_polls",
                    filter: `session_id=eq.${sessionId}`,
                },
                () => {
                    loadPolls();
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "poll_votes",
                },
                (payload) => {
                    loadPollResults(payload.new.poll_id);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId, userId, supabase]);

    const vote = async (pollId: string, optionIndex: number) => {
        if (userVotes[pollId] !== undefined) return; // Already voted

        const { error } = await supabase.from("poll_votes").insert({
            poll_id: pollId,
            user_id: userId,
            option_index: optionIndex,
        });

        if (!error) {
            setUserVotes(prev => ({ ...prev, [pollId]: optionIndex }));
            await loadPollResults(pollId);
        }
    };

    const activePolls = polls.filter(p => p.is_active);

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 rounded-xl" />
            </div>
        );
    }

    if (activePolls.length === 0) {
        return null; // Don't show section if no active polls
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Icon name="bar-chart" size={20} className="text-[#2EBD59]" />
                Live Poll
            </h3>

            {activePolls.map((poll) => (
                <PollCard
                    key={poll.id}
                    poll={poll}
                    userVote={userVotes[poll.id]}
                    results={results[poll.id] || []}
                    onVote={(optionIndex) => vote(poll.id, optionIndex)}
                    isAdmin={isAdmin}
                />
            ))}
        </div>
    );
}

function PollCard({
    poll,
    userVote,
    results,
    onVote,
    isAdmin,
}: {
    poll: Poll;
    userVote?: number;
    results: PollResult[];
    onVote: (optionIndex: number) => void;
    isAdmin?: boolean;
}) {
    const hasVoted = userVote !== undefined;
    const showResults = poll.show_results || hasVoted;

    const totalVotes = results.reduce((sum, r) => sum + r.vote_count, 0);
    const getVoteCount = (index: number) =>
        results.find(r => r.option_index === index)?.vote_count || 0;
    const getPercentage = (index: number) => {
        const count = getVoteCount(index);
        return totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-3">{poll.question}</h4>

            <div className="space-y-2">
                {poll.options.map((option, index) => {
                    const percentage = getPercentage(index);
                    const isSelected = userVote === index;

                    return (
                        <button
                            key={index}
                            onClick={() => !hasVoted && onVote(index)}
                            disabled={hasVoted}
                            className={`w-full text-left relative rounded-lg border transition-all ${isSelected
                                    ? "border-[#2EBD59] bg-[#2EBD59]/5"
                                    : hasVoted
                                        ? "border-gray-200 bg-gray-50"
                                        : "border-gray-200 hover:border-[#2EBD59] hover:bg-gray-50"
                                }`}
                        >
                            {/* Progress bar background */}
                            {showResults && (
                                <div
                                    className={`absolute inset-0 rounded-lg transition-all ${isSelected ? "bg-[#2EBD59]/10" : "bg-gray-100"
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            )}

                            <div className="relative px-4 py-3 flex items-center justify-between">
                                <span className={`text-sm ${isSelected ? "font-medium text-[#2EBD59]" : "text-gray-700"}`}>
                                    {option}
                                </span>
                                {showResults && (
                                    <span className="text-sm text-gray-500">
                                        {percentage}% ({getVoteCount(index)})
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>{totalVotes} votes</span>
                {hasVoted && (
                    <span className="text-[#2EBD59]">✓ You voted</span>
                )}
            </div>

            {isAdmin && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <AdminPollControls pollId={poll.id} showResults={poll.show_results} />
                </div>
            )}
        </div>
    );
}

function AdminPollControls({ pollId, showResults }: { pollId: string; showResults: boolean }) {
    const supabase = createClient();

    const toggleResults = async () => {
        await supabase
            .from("session_polls")
            .update({ show_results: !showResults })
            .eq("id", pollId);
    };

    const closePoll = async () => {
        await supabase
            .from("session_polls")
            .update({ is_active: false, closed_at: new Date().toISOString() })
            .eq("id", pollId);
    };

    return (
        <>
            <button
                onClick={toggleResults}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
                {showResults ? "Hide Results" : "Show Results"}
            </button>
            <button
                onClick={closePoll}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
                Close Poll
            </button>
        </>
    );
}
