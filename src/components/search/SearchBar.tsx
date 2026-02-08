"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
    placeholder?: string;
    defaultValue?: string;
    autoFocus?: boolean;
}

/**
 * Global Search Bar
 */
export default function SearchBar({
    placeholder = "Search courses, lessons...",
    defaultValue = "",
    autoFocus = false
}: SearchBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(defaultValue || searchParams.get('q') || '');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced search
    const performSearch = useCallback((searchQuery: string) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchQuery.trim()) {
                params.set('q', searchQuery.trim());
            } else {
                params.delete('q');
            }
            router.push(`/courses/search?${params.toString()}`);
        }, 300);
    }, [router, searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        performSearch(value);
    };

    const handleClear = () => {
        setQuery('');
        inputRef.current?.focus();
        router.push('/courses');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        if (query.trim()) {
            router.push(`/courses/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className={`relative flex items-center transition-all ${isFocused ? 'ring-2 ring-[#2EBD59]/20' : ''
                }`}>
                {/* Search Icon */}
                <div className="absolute left-4 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="w-full pl-12 pr-20 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2EBD59] transition-colors"
                />

                {/* Clear button */}
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-14 text-gray-400 hover:text-gray-600 p-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Keyboard shortcut hint */}
                <div className="absolute right-4 hidden md:flex items-center gap-1 text-xs text-gray-400">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">K</kbd>
                </div>
            </div>
        </form>
    );
}
