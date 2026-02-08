"use client";

import { useEffect, useState } from "react";
import {
    getFlaggedActivities,
    reviewActivity,
    getSeverityInfo,
    getActivityTypeInfo,
    type SuspiciousActivity
} from "@/lib/security/activityMonitor";

export default function SecurityDashboard() {
    const [activities, setActivities] = useState<SuspiciousActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showReviewed, setShowReviewed] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const data = await getFlaggedActivities(50, showReviewed);
            setActivities(data);
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [showReviewed]);

    const handleAction = async (activity: SuspiciousActivity, action: string) => {
        setProcessingId(activity.id);
        try {
            // In a real app, you'd get the current admin user ID
            await reviewActivity(activity.id, 'admin', action);
            await fetchActivities();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Security Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Review flagged user activities and take appropriate action.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showReviewed}
                            onChange={(e) => setShowReviewed(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-[#2EBD59] focus:ring-[#2EBD59]"
                        />
                        <span className="text-sm text-gray-600">Show reviewed</span>
                    </label>

                    <button
                        onClick={fetchActivities}
                        className="px-4 py-2 text-sm font-medium text-[#2EBD59] hover:bg-[#2EBD59]/10 rounded-lg transition-colors"
                    >
                        Refresh
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {['high', 'medium', 'low', 'total'].map((type) => {
                        const count = type === 'total'
                            ? activities.filter(a => !a.reviewed).length
                            : activities.filter(a => !a.reviewed && a.severity === type).length;

                        return (
                            <div key={type} className="bg-white rounded-xl border border-gray-200 p-4">
                                <div className="text-2xl font-bold text-gray-900">{count}</div>
                                <div className="text-sm text-gray-500 capitalize">
                                    {type === 'total' ? 'Pending Review' : `${type} Severity`}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Activities List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-600">No flagged activities to review</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity) => {
                            const severity = getSeverityInfo(activity.severity);
                            const activityType = getActivityTypeInfo(activity.activity_type);

                            return (
                                <div
                                    key={activity.id}
                                    className={`bg-white rounded-xl border p-6 ${activity.reviewed ? 'border-gray-200 opacity-60' : 'border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* Header */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-2xl">{activityType.icon}</span>
                                                <span className="font-semibold text-gray-900">
                                                    {activityType.label}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${severity.color}`}>
                                                    {severity.label}
                                                </span>
                                                {activity.reviewed && (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                                        Reviewed
                                                    </span>
                                                )}
                                            </div>

                                            {/* User info */}
                                            <div className="text-sm text-gray-600 mb-2">
                                                User ID: <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                                                    {activity.user_id}
                                                </code>
                                            </div>

                                            {/* Details */}
                                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                                <pre className="text-xs text-gray-600 overflow-x-auto">
                                                    {JSON.stringify(activity.details, null, 2)}
                                                </pre>
                                            </div>

                                            {/* Timestamp */}
                                            <div className="text-xs text-gray-400">
                                                {formatDate(activity.created_at)}
                                            </div>

                                            {/* Review info */}
                                            {activity.reviewed && activity.action_taken && (
                                                <div className="mt-3 text-sm text-gray-500">
                                                    Action: <span className="font-medium">{activity.action_taken}</span>
                                                    {activity.reviewed_at && (
                                                        <span className="ml-2">• {formatDate(activity.reviewed_at)}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {!activity.reviewed && (
                                            <div className="flex flex-col gap-2 ml-4">
                                                <button
                                                    onClick={() => handleAction(activity, 'Dismissed - False Positive')}
                                                    disabled={processingId === activity.id}
                                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    Dismiss
                                                </button>
                                                <button
                                                    onClick={() => handleAction(activity, 'Warning Sent')}
                                                    disabled={processingId === activity.id}
                                                    className="px-3 py-1.5 text-sm font-medium text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    Warn User
                                                </button>
                                                <button
                                                    onClick={() => handleAction(activity, 'Account Suspended')}
                                                    disabled={processingId === activity.id}
                                                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    Suspend
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Important notice */}
                <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-amber-900">No Auto-Banning</p>
                            <p className="text-sm text-amber-700 mt-1">
                                Activities are flagged for your review. No automatic actions are taken. Always review the evidence before taking action.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
