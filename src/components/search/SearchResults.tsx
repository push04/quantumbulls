"use client";

import Link from "next/link";

interface SearchResult {
    id: string;
    type: 'course' | 'lesson';
    title: string;
    description?: string;
    thumbnail_url?: string;
    duration_seconds?: number;
    tier: 'free' | 'basic' | 'medium' | 'pro';
    isCompleted?: boolean;
    isLocked?: boolean;
    courseTitle?: string;
}

interface SearchResultsProps {
    results: SearchResult[];
    query: string;
    lockedCount?: number;
    isLoading?: boolean;
}

const TIER_COLORS = {
    free: 'bg-gray-100 text-gray-700',
    basic: 'bg-blue-100 text-blue-700',
    medium: 'bg-purple-100 text-purple-700',
    pro: 'bg-amber-100 text-amber-700',
};

/**
 * Search Results Display
 */
export default function SearchResults({
    results,
    query,
    lockedCount = 0,
    isLoading = false
}: SearchResultsProps) {
    const formatDuration = (seconds?: number) => {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        return `${mins} min`;
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                        <div className="flex gap-4">
                            <div className="w-32 h-20 bg-gray-200 rounded-lg" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">No results found</h3>
                <p className="text-gray-500 text-sm">
                    Try adjusting your search or filters
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Results header */}
            <div className="text-sm text-gray-500">
                {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
            </div>

            {/* Results list */}
            {results.map(result => (
                <Link
                    key={`${result.type}-${result.id}`}
                    href={result.isLocked ? '#' : result.type === 'lesson' ? `/lesson/${result.id}` : `/courses/${result.id}`}
                    className={`flex gap-4 bg-white rounded-xl border border-gray-200 p-4 transition-shadow ${result.isLocked ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
                        }`}
                >
                    {/* Thumbnail */}
                    <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${result.thumbnail_url || '/placeholder-video.jpg'})` }}
                        />

                        {/* Duration */}
                        {result.duration_seconds && (
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                                {formatDuration(result.duration_seconds)}
                            </div>
                        )}

                        {/* Lock */}
                        {result.isLocked && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        )}

                        {/* Completed */}
                        {result.isCompleted && (
                            <div className="absolute top-1 left-1 w-5 h-5 bg-[#2EBD59] rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 line-clamp-1">
                                {result.title}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${TIER_COLORS[result.tier]}`}>
                                {result.tier.charAt(0).toUpperCase() + result.tier.slice(1)}
                            </span>
                        </div>

                        {result.courseTitle && (
                            <p className="text-xs text-gray-500 mb-1">
                                {result.courseTitle}
                            </p>
                        )}

                        {result.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {result.description}
                            </p>
                        )}

                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <span className="capitalize">{result.type}</span>
                        </div>
                    </div>
                </Link>
            ))}

            {/* Locked content teaser */}
            {lockedCount > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-amber-50 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">
                                {lockedCount} more result{lockedCount !== 1 ? 's' : ''} in premium tiers
                            </p>
                            <p className="text-sm text-gray-600">
                                Upgrade to unlock all content
                            </p>
                        </div>
                        <Link
                            href="/pricing"
                            className="px-4 py-2 bg-[#2EBD59] hover:bg-[#26a34d] text-white text-sm font-medium rounded-xl transition-colors"
                        >
                            Upgrade
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
