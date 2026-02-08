"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getNotifications, markNotificationRead, getUnreadCount } from "@/lib/community";

interface Notification {
    id: string;
    type: string;
    title: string;
    content?: string;
    link?: string;
    read_at?: string;
    created_at: string;
    actor?: { full_name?: string; avatar_url?: string };
}

/**
 * Notification List Component
 * Displays user notifications with read/unread state
 */
export function NotificationList() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        async function load() {
            try {
                const [notifs, count] = await Promise.all([
                    getNotifications(50),
                    getUnreadCount(),
                ]);
                setNotifications(notifs as Notification[]);
                setUnreadCount(count);
            } catch (error) {
                console.error("Failed to load notifications:", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "follow": return "👤";
            case "reply": return "💬";
            case "mention": return "@";
            case "upvote": return "👍";
            case "message": return "✉️";
            case "warning": return "⚠️";
            default: return "🔔";
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-16" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    Notifications
                    {unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </h2>
            </div>

            {/* List */}
            {notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No notifications yet
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            icon={getIcon(notification.type)}
                            onMarkRead={() => handleMarkRead(notification.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function NotificationItem({
    notification,
    icon,
    onMarkRead,
}: {
    notification: Notification;
    icon: string;
    onMarkRead: () => void;
}) {
    const isUnread = !notification.read_at;
    const date = new Date(notification.created_at);
    const timeAgo = getTimeAgo(date);

    const content = (
        <div
            className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${isUnread
                    ? "bg-blue-50 border-blue-100"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
            onClick={isUnread ? onMarkRead : undefined}
        >
            {/* Icon */}
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`font-medium ${isUnread ? "text-gray-900" : "text-gray-700"}`}>
                    {notification.title}
                </p>
                {notification.content && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                        {notification.content}
                    </p>
                )}
                <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
            </div>

            {/* Unread indicator */}
            {isUnread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            )}
        </div>
    );

    if (notification.link) {
        return <Link href={notification.link}>{content}</Link>;
    }

    return content;
}

function getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

/**
 * Notification Bell Component (for header)
 */
export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        getUnreadCount().then(setUnreadCount);
        getNotifications(5).then((data) => setNotifications(data as Notification[]));
    }, []);

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-center text-gray-500 text-sm">No notifications</p>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`p-3 rounded-lg ${!n.read_at ? "bg-blue-50" : ""}`}
                                >
                                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                    <p className="text-xs text-gray-500">{getTimeAgo(new Date(n.created_at))}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <Link
                        href="/notifications"
                        className="block p-3 text-center text-sm text-[#2EBD59] hover:bg-gray-50 border-t border-gray-100"
                        onClick={() => setShowDropdown(false)}
                    >
                        View All
                    </Link>
                </div>
            )}
        </div>
    );
}
