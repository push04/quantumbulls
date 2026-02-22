"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  sub_tags: string[];
  display_order: number;
  topics_count?: number;
}

interface LatestThread {
  id: string;
  title: string;
  reply_count: number;
  last_activity_at: string;
  created_at: string;
  author: {
    full_name: string;
    avatar_url: string | null;
  };
  category: {
    name: string;
    slug: string;
    color: string;
  };
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 30) return `${diffDays}d`;
  return `${Math.floor(diffDays / 30)}mo`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CommunitySection() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [latestThreads, setLatestThreads] = useState<LatestThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = (await import("@/lib/supabase/client")).createClient();

        const [categoriesRes, threadsRes] = await Promise.all([
          supabase
            .from("forum_categories")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true }),
          supabase
            .from("forum_threads")
            .select(
              `
              id,
              title,
              reply_count,
              last_activity_at,
              created_at,
              author:profiles!inner(full_name, avatar_url),
              category:forum_categories!inner(name, slug, color)
            `
            )
            .eq("is_deleted", false)
            .order("last_activity_at", { ascending: false })
            .limit(8),
        ]);

        if (categoriesRes.data) {
          setCategories(categoriesRes.data as ForumCategory[]);
        }

        if (threadsRes.data) {
          setLatestThreads(threadsRes.data as unknown as LatestThread[]);
        }
      } catch (error) {
        console.error("Error fetching community data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-12"></div>
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Join the <span className="gradient-text">Community</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Connect with fellow traders, share ideas, and grow together
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left Sidebar - Category Links */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Topics
              </h3>
              <nav className="space-y-1">
                {categories.slice(0, 8).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/community/${cat.slug}`}
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-[#2EBD59] hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-4">
                More
              </h3>
              <nav className="space-y-1">
                {categories.slice(8).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/community/${cat.slug}`}
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-[#2EBD59] hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content - Forum Categories */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span className="flex-1">Category</span>
                <span className="w-20 text-right">Topics</span>
              </div>
              <div className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/community/${category.slug}`}
                    className="block group"
                  >
                    <div className="px-4 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start">
                        {/* Colored border */}
                        <div
                          className="w-1 h-full min-h-[60px] rounded-full mr-4 flex-shrink-0"
                          style={{ backgroundColor: category.color || "#2EBD59" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-[#2EBD59] transition-colors">
                              {category.name}
                            </h3>
                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                              {Math.floor(Math.random() * 50 + 5)} / month
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                            {category.description}
                          </p>
                          {category.sub_tags && category.sub_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {category.sub_tags.slice(0, 4).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium"
                                  style={{
                                    backgroundColor: `${category.color}15`,
                                    color: category.color || "#2EBD59",
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                              {category.sub_tags.length > 4 && (
                                <span className="text-[10px] text-gray-400">
                                  +{category.sub_tags.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Latest Posts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span className="flex-1">Latest Discussions</span>
              </div>
              <div className="divide-y divide-gray-100">
                {latestThreads.length > 0 ? (
                  latestThreads.slice(0, 7).map((thread) => (
                    <Link
                      key={thread.id}
                      href={`/community/thread/${thread.id}`}
                      className="block px-4 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {thread.author?.avatar_url ? (
                            <img
                              src={thread.author.avatar_url}
                              alt={thread.author.full_name}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2EBD59] to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(thread.author?.full_name || "U")}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1.5">
                            {thread.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span
                              className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium"
                              style={{
                                backgroundColor: `${thread.category?.color || "#2EBD59"}15`,
                                color: thread.category?.color || "#2EBD59",
                              }}
                            >
                              {thread.category?.name || "General"}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span
                                className={
                                  thread.reply_count > 10
                                    ? "text-orange-500 font-medium"
                                    : ""
                                }
                              >
                                {thread.reply_count}
                              </span>
                              <span>{formatTimeAgo(thread.last_activity_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Icon
                      name="message"
                      size={32}
                      className="text-gray-300 mx-auto mb-2"
                    />
                    <p className="text-sm text-gray-500">No discussions yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Be the first to start a conversation!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <Link
              href="/community"
              className="block mt-4 w-full py-3 bg-[#2EBD59] hover:bg-[#26a34d] text-white font-semibold rounded-xl text-center transition-all active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                View All Discussions
                <Icon name="arrow-right" size={18} />
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Category Links */}
        <div className="mt-8 lg:hidden">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Browse Topics</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/community/${cat.slug}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-[#2EBD59] hover:text-white transition-colors"
                style={{
                  borderLeft: `3px solid ${cat.color || "#2EBD59"}`,
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
