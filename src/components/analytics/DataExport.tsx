"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface DataExportProps {
    userId: string;
}

/**
 * GDPR-Compliant Data Export
 */
export default function DataExport({ userId }: DataExportProps) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);

        try {
            const supabase = createClient();

            // Gather all user data
            const [
                { data: profile },
                { data: progress },
                { data: notes },
                { data: bookmarks },
                { data: xpEvents },
                { data: streak },
            ] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', userId).single(),
                supabase.from('video_progress').select('*').eq('user_id', userId),
                supabase.from('lesson_notes').select('*').eq('user_id', userId),
                supabase.from('bookmarks').select('*').eq('user_id', userId),
                supabase.from('user_xp_events').select('*').eq('user_id', userId),
                supabase.from('user_streaks').select('*').eq('user_id', userId).single(),
            ]);

            const exportData = {
                exportDate: new Date().toISOString(),
                userId,
                profile: profile || null,
                videoProgress: progress || [],
                notes: notes || [],
                bookmarks: bookmarks || [],
                xpHistory: xpEvents || [],
                streakData: streak || null,
            };

            // Create JSON file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `quantum_bull_data_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                    📁
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                        Export Your Data
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Download all your learning data including progress, notes,
                        bookmarks, and activity history. This is your data and you
                        own it.
                    </p>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="px-4 py-2 bg-[#2EBD59] text-white font-medium rounded-lg hover:bg-[#26a34d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                        >
                            {exporting ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download My Data
                                </>
                            )}
                        </button>
                        <span className="text-xs text-gray-400">
                            JSON format
                        </span>
                    </div>
                </div>
            </div>

            {/* GDPR notice */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                    Under GDPR and data protection regulations, you have the right
                    to access and download your personal data. If you wish to delete
                    your data, please contact support.
                </p>
            </div>
        </div>
    );
}
