"use client";

import { useRouter, useSearchParams } from "next/navigation";

export interface FilterState {
    duration: string[];
    difficulty: string[];
    topic: string[];
    status: string;
}

interface FilterPanelProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    showStatusFilter?: boolean;
}

const DURATION_OPTIONS = [
    { value: 'short', label: 'Under 10 min' },
    { value: 'medium', label: '10-20 min' },
    { value: 'long', label: '20+ min' },
];

const DIFFICULTY_OPTIONS = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
];

const TOPIC_OPTIONS = [
    { value: 'technical-analysis', label: 'Technical Analysis' },
    { value: 'fundamentals', label: 'Fundamentals' },
    { value: 'psychology', label: 'Trading Psychology' },
    { value: 'risk-management', label: 'Risk Management' },
    { value: 'forex', label: 'Forex' },
    { value: 'options', label: 'Options' },
    { value: 'crypto', label: 'Cryptocurrency' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'not-started', label: 'Not Started' },
];

/**
 * Filter Panel for search/courses
 */
export default function FilterPanel({
    filters,
    onFilterChange,
    showStatusFilter = true
}: FilterPanelProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const toggleFilter = (type: 'duration' | 'difficulty' | 'topic', value: string) => {
        const current = filters[type];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];

        onFilterChange({
            ...filters,
            [type]: updated,
        });
    };

    const setStatus = (value: string) => {
        onFilterChange({
            ...filters,
            status: value,
        });
    };

    const clearFilters = () => {
        onFilterChange({
            duration: [],
            difficulty: [],
            topic: [],
            status: 'all',
        });
    };

    const hasActiveFilters =
        filters.duration.length > 0 ||
        filters.difficulty.length > 0 ||
        filters.topic.length > 0 ||
        filters.status !== 'all';

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-[#2EBD59] hover:text-[#26a34d]"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Duration */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Duration</h4>
                <div className="space-y-2">
                    {DURATION_OPTIONS.map(option => (
                        <label
                            key={option.value}
                            className="flex items-center gap-2 cursor-pointer group"
                        >
                            <input
                                type="checkbox"
                                checked={filters.duration.includes(option.value)}
                                onChange={() => toggleFilter('duration', option.value)}
                                className="w-4 h-4 rounded border-gray-300 text-[#2EBD59] focus:ring-[#2EBD59]"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                {option.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Difficulty</h4>
                <div className="space-y-2">
                    {DIFFICULTY_OPTIONS.map(option => (
                        <label
                            key={option.value}
                            className="flex items-center gap-2 cursor-pointer group"
                        >
                            <input
                                type="checkbox"
                                checked={filters.difficulty.includes(option.value)}
                                onChange={() => toggleFilter('difficulty', option.value)}
                                className="w-4 h-4 rounded border-gray-300 text-[#2EBD59] focus:ring-[#2EBD59]"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                {option.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Topic */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Topic</h4>
                <div className="space-y-2">
                    {TOPIC_OPTIONS.map(option => (
                        <label
                            key={option.value}
                            className="flex items-center gap-2 cursor-pointer group"
                        >
                            <input
                                type="checkbox"
                                checked={filters.topic.includes(option.value)}
                                onChange={() => toggleFilter('topic', option.value)}
                                className="w-4 h-4 rounded border-gray-300 text-[#2EBD59] focus:ring-[#2EBD59]"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                {option.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Status */}
            {showStatusFilter && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Progress Status</h4>
                    <div className="space-y-2">
                        {STATUS_OPTIONS.map(option => (
                            <label
                                key={option.value}
                                className="flex items-center gap-2 cursor-pointer group"
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    checked={filters.status === option.value}
                                    onChange={() => setStatus(option.value)}
                                    className="w-4 h-4 border-gray-300 text-[#2EBD59] focus:ring-[#2EBD59]"
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
