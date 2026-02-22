"use client";

import { useState } from "react";

interface ReportIssueButtonProps {
    videoId?: string;
    onSubmit?: (data: ReportData) => void;
}

interface ReportData {
    type: string;
    description: string;
    videoId?: string;
    browserInfo: string;
    timestamp: string;
}

const ISSUE_TYPES = [
    { id: 'playback', label: 'Video won\'t play' },
    { id: 'buffering', label: 'Constant buffering' },
    { id: 'quality', label: 'Poor video quality' },
    { id: 'audio', label: 'Audio issues' },
    { id: 'subtitle', label: 'Subtitle problems' },
    { id: 'other', label: 'Other issue' },
];

/**
 * Report Issue Button and Modal
 */
export default function ReportIssueButton({ videoId, onSubmit }: ReportIssueButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const getBrowserInfo = (): string => {
        if (typeof window === 'undefined') return 'Unknown';

        const ua = navigator.userAgent;
        const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;

        return JSON.stringify({
            userAgent: ua,
            language: navigator.language,
            platform: navigator.platform,
            connectionType: connection?.effectiveType || 'unknown',
            screenSize: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const reportData: ReportData = {
            type: selectedType,
            description,
            videoId,
            browserInfo: getBrowserInfo(),
            timestamp: new Date().toISOString(),
        };

        try {
            // Call onSubmit or default API
            if (onSubmit) {
                onSubmit(reportData);
            } else {
                // Default: send to API
                await fetch('/api/support/report-issue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reportData),
                });
            }

            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting report:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        // Reset form after closing
        setTimeout(() => {
            setSelectedType('');
            setDescription('');
            setSubmitted(false);
        }, 300);
    };

    return (
        <>
            {/* Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Report Issue
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                        {submitted ? (
                            // Success state
                            <div className="text-center py-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Report Submitted
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Thank you! We&apos;ll look into this issue.
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 bg-[#2EBD59] hover:bg-[#26a34d] text-white font-medium rounded-xl transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            // Form
                            <form onSubmit={handleSubmit}>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Report a Playback Issue
                                </h3>

                                {/* Issue type */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        What&apos;s the issue?
                                    </label>
                                    <div className="space-y-2">
                                        {ISSUE_TYPES.map((type) => (
                                            <label
                                                key={type.id}
                                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="radio"
                                                    name="issueType"
                                                    value={type.id}
                                                    checked={selectedType === type.id}
                                                    onChange={(e) => setSelectedType(e.target.value)}
                                                    className="w-4 h-4 text-[#2EBD59] focus:ring-[#2EBD59]"
                                                />
                                                <span className="text-gray-700">{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional details (optional)
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Tell us more about the problem..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2EBD59]/20 focus:border-[#2EBD59] transition-colors resize-none"
                                    />
                                </div>

                                {/* Info note */}
                                <p className="text-xs text-gray-400 mb-4">
                                    We&apos;ll collect some technical info automatically to help us diagnose the problem.
                                </p>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 py-3 px-4 text-gray-600 hover:text-gray-900 font-medium rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!selectedType || isSubmitting}
                                        className="flex-1 py-3 px-4 bg-[#2EBD59] hover:bg-[#26a34d] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
