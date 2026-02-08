"use client";

import { useEffect, useState, useCallback } from "react";
import { getUnreadAlerts, markAlertRead, dismissAlert, type Alert } from "@/lib/analytics/alertSystem";

const SEVERITY_STYLES = {
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'ℹ️',
        text: 'text-blue-700',
    },
    warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: '⚠️',
        text: 'text-amber-700',
    },
    critical: {
        bg: 'bg-red-100',
        border: 'border-red-200',
        icon: '🚨',
        text: 'text-red-700',
    },
};

/**
 * Admin Alert Notifications
 */
export default function AlertNotifications() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    const loadAlerts = useCallback(async () => {
        const data = await getUnreadAlerts();
        setAlerts(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadAlerts();

        // Refresh every 5 minutes
        const interval = setInterval(loadAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [loadAlerts]);

    async function handleMarkRead(alertId: string) {
        await markAlertRead(alertId);
        setAlerts(prev => prev.map(a =>
            a.id === alertId ? { ...a, isRead: true } : a
        ));
    }

    async function handleDismiss(alertId: string) {
        await dismissAlert(alertId);
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    }

    const unreadCount = alerts.filter(a => !a.isRead).length;
    const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.isRead).length;

    if (loading) return null;

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {unreadCount > 0 && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs text-white flex items-center justify-center ${criticalCount > 0 ? 'bg-red-500' : 'bg-amber-500'
                        }`}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {expanded && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setExpanded(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs text-gray-500">{unreadCount} unread</span>
                            )}
                        </div>

                        <div className="overflow-y-auto flex-1">
                            {alerts.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="text-3xl mb-2">✅</div>
                                    <p>All clear! No alerts.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {alerts.slice(0, 10).map((alert) => {
                                        const style = SEVERITY_STYLES[alert.severity];
                                        return (
                                            <div
                                                key={alert.id}
                                                className={`p-4 ${!alert.isRead ? style.bg : 'bg-white'} hover:bg-gray-50 transition-colors`}
                                                onClick={() => !alert.isRead && handleMarkRead(alert.id)}
                                            >
                                                <div className="flex gap-3">
                                                    <span className="text-xl">{style.icon}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className={`font-medium ${style.text}`}>
                                                                {alert.title}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDismiss(alert.id);
                                                                }}
                                                                className="text-gray-400 hover:text-gray-600 text-sm"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-0.5">
                                                            {alert.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(alert.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {alerts.length > 10 && (
                            <div className="p-3 border-t border-gray-100 text-center">
                                <a href="/admin/alerts" className="text-sm text-[#2EBD59] hover:underline">
                                    View all alerts
                                </a>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
