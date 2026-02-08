"use client";

import { useState } from "react";

interface ExportButtonProps {
    getData: () => Promise<Record<string, unknown>[]>;
    filename: string;
    headers?: string[];
}

/**
 * CSV Export Button
 */
export default function ExportButton({ getData, filename, headers }: ExportButtonProps) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);

        try {
            const data = await getData();
            if (!data || data.length === 0) {
                alert('No data to export');
                return;
            }

            // Get headers
            const csvHeaders = headers || Object.keys(data[0]);

            // Build CSV content
            const rows = [
                csvHeaders.join(','),
                ...data.map(row =>
                    csvHeaders.map(header => {
                        const value = row[header];
                        // Escape quotes and wrap in quotes if contains comma
                        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                            return `"${value.replace(/"/g, '""')}"`;
                        }
                        return value ?? '';
                    }).join(',')
                )
            ];

            const csvContent = rows.join('\n');

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
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
        <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    Export CSV
                </>
            )}
        </button>
    );
}
