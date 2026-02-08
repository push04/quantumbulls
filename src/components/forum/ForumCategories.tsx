"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCategories, type ForumCategory } from "@/lib/community";

/**
 * Forum Categories Grid
 * Displays all forum categories with thread counts
 */
export function ForumCategories() {
    const [categories, setCategories] = useState<ForumCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error("Failed to load categories:", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-32" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
                <Link
                    key={category.id}
                    href={`/community/${category.slug}`}
                    className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-[#2EBD59] hover:shadow-md transition-all"
                >
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">{category.icon || "💬"}</div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 group-hover:text-[#2EBD59] transition-colors">
                                {category.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {category.description}
                            </p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
