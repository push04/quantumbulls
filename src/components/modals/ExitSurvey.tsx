"use client";

import { useState } from "react";

interface ExitSurveyProps {
    onSubmit: (data: ExitSurveyData) => void;
    onClose: () => void;
}

export interface ExitSurveyData {
    reason: string;
    feedback?: string;
    wouldReturn: boolean;
}

const REASONS = [
    { id: 'too_expensive', label: 'Too expensive for me', icon: '💰' },
    { id: 'not_enough_content', label: 'Not enough content', icon: '📚' },
    { id: 'found_alternative', label: 'Found a better alternative', icon: '🔄' },
    { id: 'no_time', label: "Don't have time to learn", icon: '⏰' },
    { id: 'not_helpful', label: "Content wasn't helpful", icon: '😕' },
    { id: 'other', label: 'Other reason', icon: '💬' },
];

/**
 * Exit Survey Modal
 */
export default function ExitSurvey({ onSubmit, onClose }: ExitSurveyProps) {
    const [reason, setReason] = useState('');
    const [feedback, setFeedback] = useState('');
    const [wouldReturn, setWouldReturn] = useState<boolean | null>(null);
    const [step, setStep] = useState(1);

    const handleSubmit = () => {
        if (!reason) return;

        onSubmit({
            reason,
            feedback: feedback.trim() || undefined,
            wouldReturn: wouldReturn ?? false,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">
                            We're Sorry to See You Go
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        Your feedback helps us improve
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 1 && (
                        <>
                            <p className="text-gray-700 mb-4">
                                What's the main reason you're leaving?
                            </p>
                            <div className="space-y-2">
                                {REASONS.map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setReason(r.id)}
                                        className={`w-full p-3 rounded-xl text-left flex items-center gap-3 border transition-all ${reason === r.id
                                                ? 'border-[#2EBD59] bg-[#2EBD59]/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-xl">{r.icon}</span>
                                        <span className={reason === r.id ? 'text-gray-900' : 'text-gray-600'}>
                                            {r.label}
                                        </span>
                                        {reason === r.id && (
                                            <svg className="w-5 h-5 text-[#2EBD59] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <p className="text-gray-700 mb-4">
                                Anything else you'd like to share?
                            </p>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Your feedback helps us improve..."
                                className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59]"
                                rows={4}
                            />

                            <p className="text-gray-700 mt-4 mb-2">
                                Would you consider coming back in the future?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setWouldReturn(true)}
                                    className={`flex-1 p-3 rounded-xl border transition-all ${wouldReturn === true
                                            ? 'border-[#2EBD59] bg-[#2EBD59]/5 text-[#2EBD59]'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    Yes, maybe
                                </button>
                                <button
                                    onClick={() => setWouldReturn(false)}
                                    className={`flex-1 p-3 rounded-xl border transition-all ${wouldReturn === false
                                            ? 'border-gray-400 bg-gray-50 text-gray-700'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    Probably not
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex gap-3">
                    {step === 1 ? (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => reason && setStep(2)}
                                disabled={!reason}
                                className="flex-1 py-3 px-4 bg-[#2EBD59] text-white font-medium rounded-xl hover:bg-[#26a34d] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 py-3 px-4 bg-[#2EBD59] text-white font-medium rounded-xl hover:bg-[#26a34d]"
                            >
                                Submit & Cancel
                            </button>
                        </>
                    )}
                </div>

                {/* Win-back offer */}
                {step === 2 && (
                    <div className="px-6 pb-6">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-amber-800 text-sm">
                                🎁 <strong>Wait!</strong> If you change your mind within 30 days,
                                come back and get <strong>1 month free</strong>!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
