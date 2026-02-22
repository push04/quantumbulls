import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Community Forum | Quantum Bull",
  description: "Connect with fellow traders, ask questions, and share knowledge",
};

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  sub_tags: string[] | null;
  topics_count: number | null;
  display_order: number | null;
  is_active: boolean | null;
}

interface ForumAuthor {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface ForumThreadCategory {
  name: string;
  slug: string;
  color: string | null;
}

interface ForumThread {
  id: string;
  title: string;
  reply_count: number | null;
  last_activity_at: string | null;
  created_at: string | null;
  author: ForumAuthor | null;
  category: ForumThreadCategory | null;
}

function formatTimeAgo(dateString: string): string {
  if (!dateString) return "";
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
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function CommunityPage() {
  const supabase = await createClient();

  // Fetch real stats from database
  const [categoriesRes, threadsRes, statsRes] = await Promise.all([
    supabase
      .from("forum_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("forum_threads")
      .select(`
        id,
        title,
        reply_count,
        last_activity_at,
        created_at,
        author:profiles!inner(id, full_name, avatar_url),
        category:forum_categories!inner(name, slug, color)
      `)
      .eq("is_deleted", false)
      .order("last_activity_at", { ascending: false })
      .limit(10),
    Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("forum_threads").select("*", { count: "exact", head: true }).eq("is_deleted", false),
      supabase.from("forum_replies").select("*", { count: "exact", head: true }),
    ])
  ]);

  const categories = (categoriesRes.data || []) as ForumCategory[];
  const threads = (threadsRes.data || []) as unknown as ForumThread[];
  
  // Real stats from database
  const memberCount = statsRes[0].count || 0;
  const discussionCount = statsRes[1].count || 0;
  const replyCount = statsRes[2].count || 0;

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Community <span className="gradient-text">Forum</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Connect with fellow traders, ask questions, and share your knowledge
            </p>
          </div>

          {/* Real Stats from Database */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-[#2EBD59]">
                {memberCount > 0 ? memberCount.toLocaleString() : "0"}
              </div>
              <div className="text-sm text-gray-500">Members</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-500">
                {discussionCount > 0 ? discussionCount.toLocaleString() : "0"}
              </div>
              <div className="text-sm text-gray-500">Discussions</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-purple-500">
                {replyCount > 0 ? replyCount.toLocaleString() : "0"}
              </div>
              <div className="text-sm text-gray-500">Replies</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-amber-500">
                {categories.length > 0 ? categories.length : "0"}
              </div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
          </div>

          {/* Main Forum Layout - BabyPips Style */}
          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left Sidebar - Category Links */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Topics
                </h3>
                <nav className="space-y-1">
                  {categories.slice(0, 8).map((cat: ForumCategory) => (
                    <Link
                      key={cat.id}
                      href={`/community/${cat.slug}`}
                      className="block px-3 py-2 text-sm text-gray-600 hover:text-[#2EBD59] hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </nav>
                {categories.length > 8 && (
                  <>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-4">
                      More
                    </h3>
                    <nav className="space-y-1">
                      {categories.slice(8).map((cat: ForumCategory) => (
                        <Link
                          key={cat.id}
                          href={`/community/${cat.slug}`}
                          className="block px-3 py-2 text-sm text-gray-600 hover:text-[#2EBD59] hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </nav>
                  </>
                )}
              </div>
            </div>

            {/* Center - Forum Categories */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <span className="flex-1">Category</span>
                  <span className="w-20 text-right">Topics</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {categories.length > 0 ? (
                    categories.map((category: ForumCategory) => (
                      <Link
                        key={category.id}
                        href={`/community/${category.slug}`}
                        className="block group"
                      >
                        <div className="px-4 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start">
                            <div
                              className="w-1 h-full min-h-[60px] rounded-full mr-4 flex-shrink-0"
                              style={{ backgroundColor: category.color || "#2EBD59" }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-[#2EBD59] transition-colors">
                                  {category.name}
                                </h3>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                {category.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Icon name="folder" size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No categories found</p>
                      <p className="text-xs text-gray-400 mt-1">Categories will appear here once added by admin</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Latest Posts */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <span className="flex-1">Latest Discussions</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                  {threads.length > 0 ? (
                    threads.map((thread) => (
                      <Link
                        key={thread.id}
                        href={`/community/thread/${thread.id}`}
                        className="block px-4 py-3.5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {thread.author?.avatar_url ? (
                              <img
                                src={thread.author.avatar_url}
                                alt={thread.author.full_name || "User"}
                                className="w-9 h-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2EBD59] to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                                {getInitials(thread.author?.full_name || "")}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1.5">
                              {thread.title}
                            </h4>
                            <div className="flex items-center justify-between">
                              {thread.category && (
                                <span
                                  className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium"
                                  style={{
                                    backgroundColor: `${thread.category.color || "#2EBD59"}15`,
                                    color: thread.category.color || "#2EBD59",
                                  }}
                                >
                                  {thread.category.name}
                                </span>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-400 ml-auto">
                                <span
                                  className={
                                    (thread.reply_count || 0) > 10 ? "text-orange-500 font-medium" : ""
                                  }
                                >
                                  {thread.reply_count || 0}
                                </span>
                                <span>{formatTimeAgo(thread.last_activity_at || "")}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Icon name="message" size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No discussions yet</p>
                      <p className="text-xs text-gray-400 mt-1">Be the first to start a conversation!</p>
                    </div>
                  )}
                </div>
              </div>

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
          {categories.length > 0 && (
            <div className="mt-8 lg:hidden">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">Browse Topics</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat: ForumCategory) => (
                  <Link
                    key={cat.id}
                    href={`/community/${cat.slug}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-[#2EBD59] hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Community Guidelines */}
          <section className="mt-10 bg-gradient-to-br from-[#2EBD59] to-[#1a8d3e] rounded-xl p-6 sm:p-8 text-white">
            <h2 className="text-lg sm:text-xl font-semibold mb-3">Community Guidelines</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-white/90">
              <li className="flex items-center gap-2">
                <Icon name="check" size={16} /> Be respectful and constructive
              </li>
              <li className="flex items-center gap-2">
                <Icon name="check" size={16} /> No spam or self-promotion
              </li>
              <li className="flex items-center gap-2">
                <Icon name="check" size={16} /> Educational discussion only
              </li>
              <li className="flex items-center gap-2">
                <Icon name="check" size={16} /> No sharing account credentials
              </li>
              <li className="flex items-center gap-2">
                <Icon name="check" size={16} /> Help beginners learn
              </li>
              <li className="flex items-center gap-2">
                <Icon name="check" size={16} /> Use the report button for issues
              </li>
            </ul>
            <Link
              href="/community/guidelines"
              className="inline-block mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Read Full Guidelines
            </Link>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
