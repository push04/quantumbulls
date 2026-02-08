"use client";

import Link from "next/link";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

/**
 * Navigation Breadcrumbs
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex items-center gap-2 text-sm mb-6 overflow-x-auto pb-2">
            {/* Home icon */}
            <Link
                href="/"
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 flex-shrink-0">
                    {/* Separator */}
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>

                    {/* Item */}
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-medium whitespace-nowrap">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
