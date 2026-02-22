"use client";

import Link from "next/link";
import { type DailyChallenge } from "@/lib/engagement/streakManager";

interface DailyChallengeCardProps {
    challenge: DailyChallenge | null;
    onComplete?: () => void;
}

const CHALLENGE_ICONS = {
    watch_video: '📺',
    complete_lesson: '✅',
    login: '👋',
};

const CHALLENGE_TITLES = {
    watch_video: 'Watch a Video',
    complete_lesson: 'Complete a Lesson',
    login: 'Daily Check-in',
};

/**
 * Daily Challenge Card
 */
export default function DailyChallengeCard({
    challenge,
    onComplete
}: DailyChallengeCardProps) {
    if (!challenge) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="text-center text-gray-500 py-4">
                    Loading today&apos;s challenge...
                </div>
            </div>
        );
    }

    const isCompleted = challenge.isCompleted;

    return (
        <div className={`rounded-2xl border p-4 transition-all ${isCompleted
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200 hover:border-[#2EBD59]'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{CHALLENGE_ICONS[challenge.challengeType]}</span>
                    <div>
                        <div className="font-semibold text-gray-900">
                            Today&apos;s Challenge
                        </div>
                        <div className="text-xs text-gray-500">
                            {CHALLENGE_TITLES[challenge.challengeType]}
                        </div>
                    </div>
                </div>

                {isCompleted ? (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Complete!
                    </div>
                ) : (
                    <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        +50 XP
                    </div>
                )}
            </div>

            {/* Challenge description */}
            <div className={`p-3 rounded-xl mb-3 ${isCompleted ? 'bg-green-100/50' : 'bg-gray-50'
                }`}>
                {challenge.targetTitle ? (
                    <p className="text-sm text-gray-700">
                        Watch <span className="font-medium">&quot;{challenge.targetTitle}&quot;</span> to complete today&apos;s challenge and maintain your streak!
                    </p>
                ) : (
                    <p className="text-sm text-gray-700">
                        Complete any activity today to maintain your streak!
                    </p>
                )}
            </div>

            {/* Action button */}
            {!isCompleted && (
                <Link
                    href={challenge.targetId ? `/lesson/${challenge.targetId}` : '/courses'}
                    className="block w-full text-center py-2.5 bg-[#2EBD59] hover:bg-[#26a34d] text-white font-medium rounded-xl transition-colors"
                >
                    {challenge.targetId ? 'Start Challenge' : 'Browse Courses'}
                </Link>
            )}

            {isCompleted && (
                <div className="text-center text-sm text-green-600">
                    🎉 You&apos;ve completed today&apos;s challenge at {new Date(challenge.completedAt!).toLocaleTimeString()}
                </div>
            )}
        </div>
    );
}
