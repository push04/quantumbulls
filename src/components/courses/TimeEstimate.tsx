"use client";

import { formatRemainingTime } from "@/lib/learning/progressCalculator";

interface TimeEstimateProps {
    remainingSeconds: number;
    size?: 'sm' | 'md';
}

/**
 * Time Estimate Component
 */
export default function TimeEstimate({ remainingSeconds, size = 'md' }: TimeEstimateProps) {
    if (remainingSeconds <= 0) {
        return (
            <div className={`flex items-center gap-1.5 text-[#2EBD59] ${size === 'sm' ? 'text-xs' : 'text-sm'
                }`}>
                <svg className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Completed</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-1.5 text-gray-500 ${size === 'sm' ? 'text-xs' : 'text-sm'
            }`}>
            <svg className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatRemainingTime(remainingSeconds)}</span>
        </div>
    );
}
