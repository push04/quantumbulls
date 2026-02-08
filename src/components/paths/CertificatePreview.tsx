"use client";

import { useState } from "react";

interface CertificatePreviewProps {
    pathTitle: string;
    userName: string;
    completedAt: string;
    certificateUrl?: string;
}

/**
 * Certificate Preview and Download
 */
export default function CertificatePreview({
    pathTitle,
    userName,
    completedAt,
    certificateUrl,
}: CertificatePreviewProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const formattedDate = new Date(completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const handleDownload = async () => {
        if (!certificateUrl) return;

        setIsDownloading(true);
        try {
            // Open certificate URL
            window.open(certificateUrl, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Certificate Preview */}
            <div className="relative p-8 bg-gradient-to-br from-emerald-50 via-white to-amber-50 border-b border-gray-100">
                {/* Decorative corners */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[#2EBD59]/30" />
                <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-[#2EBD59]/30" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-[#2EBD59]/30" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[#2EBD59]/30" />

                <div className="text-center py-6">
                    {/* Logo / Brand */}
                    <div className="text-2xl font-bold text-[#2EBD59] mb-6">
                        Quantum Bull
                    </div>

                    {/* Certificate text */}
                    <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                        Certificate of Completion
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                        This certifies that
                    </div>

                    {/* Name */}
                    <div className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                        {userName}
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                        has successfully completed
                    </div>

                    {/* Course name */}
                    <div className="text-xl font-semibold text-[#2EBD59] mb-6">
                        {pathTitle}
                    </div>

                    {/* Date */}
                    <div className="text-sm text-gray-500">
                        {formattedDate}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 text-[#2EBD59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Verified Certificate</span>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={isDownloading || !certificateUrl}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2EBD59] hover:bg-[#26a34d] disabled:bg-gray-200 text-white disabled:text-gray-400 font-medium rounded-xl transition-colors"
                >
                    {isDownloading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Preparing...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
