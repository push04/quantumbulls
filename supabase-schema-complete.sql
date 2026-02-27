-- =============================================
-- QUANTUM BULL - COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor to create all missing tables
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- COURSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'medium', 'pro')),
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    estimated_hours INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LESSONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    duration INTEGER,
    order_index INTEGER DEFAULT 0,
    is_preview BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, slug)
);

-- =============================================
-- SUBSCRIPTION PLANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    interval TEXT DEFAULT 'monthly' CHECK (interval IN ('monthly', 'yearly', 'lifetime')),
    features JSONB DEFAULT '[]',
    cta_text TEXT,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TESTIMONIALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name TEXT NOT NULL,
    author_title TEXT,
    avatar_url TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    featured BOOLEAN DEFAULT false,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SUCCESS STORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.success_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    before_story TEXT,
    after_story TEXT,
    image_url TEXT,
    author_name TEXT NOT NULL,
    author_title TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MARKET NEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.market_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    source TEXT,
    url TEXT,
    image_url TEXT,
    is_published BOOLEAN DEFAULT true,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MARKET ANALYSIS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.market_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    analysis_type TEXT DEFAULT 'daily' CHECK (analysis_type IN ('daily', 'weekly', 'monthly', 'setup')),
    is_premium BOOLEAN DEFAULT false,
    author_id UUID REFERENCES public.profiles(id),
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FORUM CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#2EBD59',
    sub_tags JSONB DEFAULT '[]',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FORUM THREADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id UUID REFERENCES public.forum_categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    reply_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FORUM REPLIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.forum_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_answer BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYMENT ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.payment_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER REPORTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reported_content_type TEXT NOT NULL,
    reported_content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SYSTEM SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VIDEOS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    storage_path TEXT,
    uploaded_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- IMAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    mime_type TEXT,
    file_size INTEGER,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VIDEO PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.video_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
    progress_percent INTEGER DEFAULT 0,
    last_position INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- =============================================
-- USER STREAKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_xp INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LIVE SESSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.live_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES public.profiles(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    is_recording BOOLEAN DEFAULT true,
    recording_url TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
    max_participants INTEGER,
    tier_restriction TEXT CHECK (tier_restriction IN ('free', 'basic', 'medium', 'advanced', 'pro')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SESSION CHAT TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.session_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SESSION POLLS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.session_polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.live_sessions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- POLL VOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID REFERENCES public.session_polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    option_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- =============================================
-- USER ENROLLMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress_percent INTEGER DEFAULT 0,
    UNIQUE(user_id, course_id)
);

-- =============================================
-- ADD MISSING COLUMNS TO PROFILES
-- =============================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator', 'banned')),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;

-- Public read access for courses, lessons, plans, testimonials, news, analysis, categories
CREATE POLICY "Public can view active courses" ON public.courses FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Public can view active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view approved testimonials" ON public.testimonials FOR SELECT USING (status = 'approved');
CREATE POLICY "Public can view approved success stories" ON public.success_stories FOR SELECT USING (status = 'approved');
CREATE POLICY "Public can view published news" ON public.market_news FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view analysis" ON public.market_analysis FOR SELECT USING (true);
CREATE POLICY "Public can view active categories" ON public.forum_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active sessions" ON public.live_sessions FOR SELECT USING (status != 'cancelled');

-- Admin full access (using service role in queries)
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage plans" ON public.subscription_plans FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage news" ON public.market_news FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage analysis" ON public.market_analysis FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage categories" ON public.forum_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage sessions" ON public.live_sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- User-specific policies
CREATE POLICY "Users can view own enrollments" ON public.user_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own progress" ON public.video_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.video_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own orders" ON public.payment_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.payment_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_active ON public.courses(is_active);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON public.lessons(slug);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
CREATE INDEX IF NOT EXISTS idx_success_stories_status ON public.success_stories(status);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.market_news(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_analysis_published ON public.market_analysis(published_at);
CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON public.forum_categories(slug);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON public.forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_activity ON public.forum_threads(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON public.forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_user ON public.video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_lesson ON public.video_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.user_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.user_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON public.live_sessions(status);
CREATE INDEX IF NOT EXISTS idx_live_sessions_scheduled ON public.live_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_session_chat_session ON public.session_chat(session_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON public.poll_votes(poll_id);

-- =============================================
-- SEED DATA FOR DEMO
-- =============================================

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, slug, description, price, interval, features, cta_text, is_popular, is_active) VALUES
('Basic', 'basic', 'Perfect for beginners', 0, 'monthly', '["Access to beginner courses", "Daily market updates", "Community forum access"]', 'Start Free', false, true),
('Medium', 'medium', 'For serious traders', 2999, 'monthly', '["All Basic features", "Intermediate courses", "Live session access", "Priority support"]', 'Get Started', true, true),
('Advanced', 'advanced', 'Complete trading mastery', 9999, 'lifetime', '["All Medium features", "Advanced courses", "1-on-1 mentorship", "Exclusive indicators", "Lifetime updates"]', 'Go Pro', false, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, category, is_public) VALUES
('site_name', 'Quantum Bull', 'Website name', 'general', true),
('site_description', 'Master Trading From Basics to Advanced', 'Website description', 'general', true),
('contact_email', 'support@quantumbull.com', 'Contact email', 'contact', true),
('contact_phone', '+919876543210', 'Contact phone', 'contact', true),
('razorpay_key_id', '', 'Razorpay Key ID', 'payment', false),
('razorpay_key_secret', '', 'Razorpay Key Secret', 'payment', false),
('enable_registration', 'true', 'Enable user registration', 'general', false),
('enable_live_sessions', 'true', 'Enable live sessions', 'features', false)
ON CONFLICT (key) DO NOTHING;

-- Insert forum categories
INSERT INTO public.forum_categories (name, slug, description, color, display_order, is_active) VALUES
('General Discussion', 'general', 'Talk about anything related to trading', '#2EBD59', 1, true),
('Beginner Questions', 'beginner', 'New to trading? Ask here', '#3B82F6', 2, true),
('Technical Analysis', 'technical', 'Chart patterns, indicators, and analysis', '#8B5CF6', 3, true),
('Fundamental Analysis', 'fundamental', 'News, earnings, and macro analysis', '#F59E0B', 4, true),
('Trading Strategies', 'strategies', 'Share and discuss trading strategies', '#EC4899', 5, true),
('Psychology & Mindset', 'psychology', 'Trading psychology and mental game', '#10B981', 6, true),
('Market Stories', 'stories', 'Share your trading experiences', '#6366F1', 7, true),
('Announcements', 'announcements', 'Official updates and news', '#EF4444', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT ALL ON public.courses TO authenticated;
GRANT ALL ON public.lessons TO authenticated;
GRANT ALL ON public.subscription_plans TO authenticated;
GRANT ALL ON public.testimonials TO authenticated;
GRANT ALL ON public.success_stories TO authenticated;
GRANT ALL ON public.market_news TO authenticated;
GRANT ALL ON public.market_analysis TO authenticated;
GRANT ALL ON public.forum_categories TO authenticated;
GRANT ALL ON public.forum_threads TO authenticated;
GRANT ALL ON public.forum_replies TO authenticated;
GRANT ALL ON public.payment_orders TO authenticated;
GRANT ALL ON public.user_reports TO authenticated;
GRANT ALL ON public.system_settings TO authenticated;
GRANT ALL ON public.videos TO authenticated;
GRANT ALL ON public.images TO authenticated;
GRANT ALL ON public.video_progress TO authenticated;
GRANT ALL ON public.user_streaks TO authenticated;
GRANT ALL ON public.live_sessions TO authenticated;
GRANT ALL ON public.session_chat TO authenticated;
GRANT ALL ON public.session_polls TO authenticated;
GRANT ALL ON public.poll_votes TO authenticated;
GRANT ALL ON public.user_enrollments TO authenticated;

GRANT ALL ON public.courses TO service_role;
GRANT ALL ON public.lessons TO service_role;
GRANT ALL ON public.subscription_plans TO service_role;
GRANT ALL ON public.testimonials TO service_role;
GRANT ALL ON public.success_stories TO service_role;
GRANT ALL ON public.market_news TO service_role;
GRANT ALL ON public.market_analysis TO service_role;
GRANT ALL ON public.forum_categories TO service_role;
GRANT ALL ON public.forum_threads TO service_role;
GRANT ALL ON public.forum_replies TO service_role;
GRANT ALL ON public.payment_orders TO service_role;
GRANT ALL ON public.user_reports TO service_role;
GRANT ALL ON public.system_settings TO service_role;
GRANT ALL ON public.videos TO service_role;
GRANT ALL ON public.images TO service_role;
GRANT ALL ON public.video_progress TO service_role;
GRANT ALL ON public.user_streaks TO service_role;
GRANT ALL ON public.live_sessions TO service_role;
GRANT ALL ON public.session_chat TO service_role;
GRANT ALL ON public.session_polls TO service_role;
GRANT ALL ON public.poll_votes TO service_role;
GRANT ALL ON public.user_enrollments TO service_role;

-- Enable realtime for chat and polls
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_sessions;
