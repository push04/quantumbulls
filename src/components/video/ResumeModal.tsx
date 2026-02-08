"use client";

import { formatTime } from "@/lib/video/progressTracker";

interface ResumeModalProps {
    progressSeconds: number;
    onResume: () => void;
    onStartOver: () => void;
    onDismiss: () => void;
}

/**
 * Modal asking user if they want to resume watching
 */
export default function ResumeModal({
    progressSeconds,
    onResume,
    onStartOver,
    onDismiss,
}: ResumeModalProps) {
    const formattedTime = formatTime(progressSeconds);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onDismiss}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in">
                {/* Play icon */}
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#2EBD59]/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#2EBD59]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                    Resume Watching?
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-center mb-6">
                    You stopped at <span className="font-semibold text-gray-900">{formattedTime}</span>
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={onResume}
                        className="w-full py-3 px-4 bg-[#2EBD59] hover:bg-[#26a34d] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Resume from {formattedTime}
                    </button>

                    <button
                        onClick={onStartOver}
                        className="w-full py-3 px-4 text-gray-600 hover:text-gray-900 font-medium rounded-xl transition-all"
                    >
                        Start from beginning
                    </button>
                </div>
            </div>
        </div>
    );
}
