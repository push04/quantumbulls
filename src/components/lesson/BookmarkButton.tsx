"use client";

import { useState } from "react";

interface BookmarkButtonProps {
    lessonId: string;
    isFavorite?: boolean;
    isWatchLater?: boolean;
    onToggle?: (type: 'favorite' | 'watch_later', isActive: boolean) => void;
}

/**
 * Bookmark Button with Favorite and Watch Later options
 */
export default function BookmarkButton({
    lessonId,
    isFavorite: initialFavorite = false,
    isWatchLater: initialWatchLater = false,
    onToggle,
}: BookmarkButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialFavorite);
    const [isWatchLater, setIsWatchLater] = useState(initialWatchLater);
    const [showMenu, setShowMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (type: 'favorite' | 'watch_later') => {
        setIsLoading(true);

        try {
            const isActive = type === 'favorite' ? !isFavorite : !isWatchLater;

            // Call API
            const response = await fetch('/api/bookmarks', {
                method: isActive ? 'POST' : 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, type }),
            });

            if (response.ok) {
                if (type === 'favorite') {
                    setIsFavorite(isActive);
                } else {
                    setIsWatchLater(isActive);
                }
                onToggle?.(type, isActive);
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        } finally {
            setIsLoading(false);
            setShowMenu(false);
        }
    };

    const isBookmarked = isFavorite || isWatchLater;

    return (
        <div className="relative">
            {/* Main button */}
            <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={isLoading}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${isBookmarked
                        ? 'bg-[#2EBD59]/10 text-[#2EBD59]'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
            >
                {isLoading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : (
                    <svg
                        className="w-5 h-5"
                        fill={isBookmarked ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                )}
                <span className="text-sm font-medium">
                    {isBookmarked ? 'Saved' : 'Save'}
                </span>
                <svg className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown menu */}
            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                        {/* Favorite option */}
                        <button
                            onClick={() => handleToggle('favorite')}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                            <svg
                                className={`w-5 h-5 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                                fill={isFavorite ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">
                                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                            </span>
                        </button>

                        {/* Watch later option */}
                        <button
                            onClick={() => handleToggle('watch_later')}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                            <svg
                                className={`w-5 h-5 ${isWatchLater ? 'text-[#2EBD59]' : 'text-gray-400'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-700">
                                {isWatchLater ? 'Remove from Watch Later' : 'Watch Later'}
                            </span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
