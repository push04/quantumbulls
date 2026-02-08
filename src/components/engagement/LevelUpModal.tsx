"use client";

import { useState, useEffect } from "react";
import { type UserLevel, LEVELS } from "@/lib/engagement/xpManager";

interface LevelUpModalProps {
    previousLevel: UserLevel;
    newLevel: UserLevel;
    onClose: () => void;
}

/**
 * Level Up Celebration Modal
 */
export default function LevelUpModal({
    previousLevel,
    newLevel,
    onClose
}: LevelUpModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Animate in
        setTimeout(() => setIsVisible(true), 50);
        setTimeout(() => setShowContent(true), 300);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const newLevelInfo = LEVELS[newLevel];
    const previousLevelInfo = LEVELS[previousLevel];

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'bg-black/60' : 'bg-transparent'
                }`}
            onClick={handleClose}
        >
            <div
                className={`relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl p-8 max-w-sm w-full text-center transform transition-all duration-500 overflow-hidden ${isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
                    }`}
                onClick={e => e.stopPropagation()}
            >
                {/* Background effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            background: `radial-gradient(circle at center, ${newLevelInfo.color}40, transparent 70%)`,
                        }}
                    />
                    {/* Animated stars */}
                    <div className="absolute top-4 left-4 text-2xl animate-pulse">✨</div>
                    <div className="absolute top-8 right-8 text-xl animate-pulse" style={{ animationDelay: '0.2s' }}>⭐</div>
                    <div className="absolute bottom-16 left-8 text-lg animate-pulse" style={{ animationDelay: '0.4s' }}>🌟</div>
                    <div className="absolute bottom-20 right-12 text-2xl animate-pulse" style={{ animationDelay: '0.3s' }}>✨</div>
                </div>

                {/* Content */}
                <div className={`relative transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}>
                    {/* Level up text */}
                    <div className="text-amber-400 text-sm font-bold tracking-widest uppercase mb-4">
                        Level Up!
                    </div>

                    {/* Level icons transition */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="text-3xl opacity-50">{previousLevelInfo.icon}</div>
                        <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <div className="text-5xl animate-bounce">{newLevelInfo.icon}</div>
                    </div>

                    {/* New level title */}
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {newLevelInfo.title}
                    </h2>

                    {/* Congratulations message */}
                    <p className="text-gray-400 mb-6">
                        {newLevel === 'intermediate' && "You're making great progress! Keep learning to unlock more achievements."}
                        {newLevel === 'advanced' && "Impressive dedication! You're becoming a skilled trader."}
                        {newLevel === 'expert' && "You've reached the pinnacle! You're now an expert trader. 👑"}
                    </p>

                    {/* Level badge */}
                    <div
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-lg mb-6"
                        style={{
                            backgroundColor: `${newLevelInfo.color}20`,
                            color: newLevelInfo.color,
                            border: `2px solid ${newLevelInfo.color}40`,
                        }}
                    >
                        <span>{newLevelInfo.icon}</span>
                        <span>{newLevelInfo.level.charAt(0).toUpperCase() + newLevelInfo.level.slice(1)}</span>
                    </div>

                    {/* Continue button */}
                    <button
                        onClick={handleClose}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all"
                    >
                        Continue Trading! 🚀
                    </button>
                </div>
            </div>
        </div>
    );
}
