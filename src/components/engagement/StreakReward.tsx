"use client";

import { useState, useEffect } from "react";
import { type StreakMilestone } from "@/lib/engagement/streakManager";

interface StreakRewardProps {
    milestone: StreakMilestone;
    onClose: () => void;
}

/**
 * Streak Reward Celebration Modal
 */
export default function StreakReward({ milestone, onClose }: StreakRewardProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Animate in
        setTimeout(() => setIsVisible(true), 50);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/50' : 'bg-transparent'
                }`}
            onClick={handleClose}
        >
            <div
                className={`bg-white rounded-3xl p-8 max-w-sm w-full text-center transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                    }`}
                onClick={e => e.stopPropagation()}
            >
                {/* Confetti animation placeholder */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                    <div className="animate-bounce absolute top-4 left-8 text-2xl">🎊</div>
                    <div className="animate-bounce absolute top-6 right-12 text-xl" style={{ animationDelay: '0.1s' }}>✨</div>
                    <div className="animate-bounce absolute top-10 left-20 text-lg" style={{ animationDelay: '0.2s' }}>🎉</div>
                    <div className="animate-bounce absolute top-8 right-8 text-2xl" style={{ animationDelay: '0.15s' }}>⭐</div>
                </div>

                {/* Icon */}
                <div className="text-6xl mb-4 animate-pulse">
                    {milestone.icon}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Streak Milestone!
                </h2>

                {/* Milestone name */}
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full mb-4">
                    <span className="font-semibold text-orange-600">
                        {milestone.reward}
                    </span>
                </div>

                {/* Days */}
                <p className="text-gray-600 mb-4">
                    You&apos;ve maintained your learning streak for <span className="font-bold text-orange-500">{milestone.days} days</span>!
                </p>

                {/* XP earned */}
                <div className="bg-[#2EBD59]/10 rounded-xl p-4 mb-6">
                    <div className="text-sm text-gray-500 mb-1">Bonus XP Earned</div>
                    <div className="text-3xl font-bold text-[#2EBD59]">
                        +{milestone.xpBonus} XP
                    </div>
                </div>

                {/* Encouraging message */}
                <p className="text-sm text-gray-500 mb-6">
                    {milestone.days >= 30
                        ? "You're building incredible habits. Keep up the amazing work!"
                        : "Keep going! Even bigger rewards await you."}
                </p>

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="w-full py-3 bg-[#2EBD59] hover:bg-[#26a34d] text-white font-semibold rounded-xl transition-colors"
                >
                    Keep Learning! 🚀
                </button>
            </div>
        </div>
    );
}
