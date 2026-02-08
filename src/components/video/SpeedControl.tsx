"use client";

import { useState, useEffect } from "react";

interface SpeedControlProps {
    currentSpeed: number;
    onSpeedChange: (speed: number) => void;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SPEED_STORAGE_KEY = 'qb_playback_speed';

/**
 * Playback Speed Control Component
 */
export default function SpeedControl({ currentSpeed, onSpeedChange }: SpeedControlProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Load saved preference on mount
    useEffect(() => {
        const saved = localStorage.getItem(SPEED_STORAGE_KEY);
        if (saved) {
            const speed = parseFloat(saved);
            if (SPEEDS.includes(speed)) {
                onSpeedChange(speed);
            }
        }
    }, [onSpeedChange]);

    const handleSpeedChange = (speed: number) => {
        onSpeedChange(speed);
        localStorage.setItem(SPEED_STORAGE_KEY, speed.toString());
        setIsOpen(false);
    };

    const formatSpeed = (speed: number) => {
        return speed === 1 ? 'Normal' : `${speed}x`;
    };

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
                {formatSpeed(currentSpeed)}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute bottom-full mb-2 right-0 z-50 bg-gray-900 rounded-xl shadow-xl border border-white/10 overflow-hidden min-w-[120px]">
                        <div className="py-1">
                            {SPEEDS.map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => handleSpeedChange(speed)}
                                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${currentSpeed === speed
                                            ? 'bg-[#2EBD59] text-white'
                                            : 'text-white/80 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {formatSpeed(speed)}
                                    {speed === 1 && <span className="text-xs ml-2 opacity-60">(default)</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * Get saved playback speed preference
 */
export function getSavedSpeed(): number {
    if (typeof window === 'undefined') return 1;
    const saved = localStorage.getItem(SPEED_STORAGE_KEY);
    if (saved) {
        const speed = parseFloat(saved);
        if (SPEEDS.includes(speed)) return speed;
    }
    return 1;
}
