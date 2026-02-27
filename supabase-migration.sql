-- =============================================
-- QUANTUM BULL - DATABASE MIGRATION
-- Run this in Supabase SQL Editor to add missing tables
-- Safe to run multiple times - uses IF NOT EXISTS
-- =============================================

-- Enable UUID extension
DO $$ BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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
    interval_value TEXT DEFAULT 'monthly',
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
    analysis_type TEXT DEFAULT 'daily',
    is_premium BOOLEAN DEFAULT false,
    author_id UUID,
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
    category_id UUID,
    author_id UUID,
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
    thread_id UUID,
    author_id UUID,
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
    user_id UUID,
    plan_id UUID,
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
    reporter_id UUID,
    reported_content_type TEXT NOT NULL,
    reported_content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    resolved_by UUID,
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
    uploaded_by UUID,
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
    uploaded_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VIDEO PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.video_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    lesson_id UUID,
    video_id UUID,
    progress_percent INTEGER DEFAULT 0,
    last_position INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER STREAKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE,
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
    instructor_id UUID,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    is_recording BOOLEAN DEFAULT true,
    recording_url TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
    max_participants INTEGER,
    tier_restriction TEXT,
    min_tier TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SESSION CHAT TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.session_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID,
    user_id UUID,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SESSION POLLS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.session_polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID,
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
    poll_id UUID,
    user_id UUID,
    option_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- =============================================
-- USER ENROLLMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    course_id UUID,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress_percent INTEGER DEFAULT 0,
    UNIQUE(user_id, course_id)
);

-- =============================================
-- SUSPICIOUS ACTIVITY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.suspicious_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    activity_type TEXT NOT NULL,
    severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
    details JSONB DEFAULT '{}',
    reviewed BOOLEAN DEFAULT false,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    badge_name TEXT NOT NULL,
    badge_icon TEXT,
    badge_color TEXT,
    description TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_name)
);

-- =============================================
-- USER FOLLOWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL,
    following_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- =============================================
-- USER BLOCKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL,
    blocked_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- =============================================
-- USER MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_deleted_sender BOOLEAN DEFAULT false,
    is_deleted_recipient BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    link TEXT,
    actor_id UUID,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- =============================================
DO $$
BEGIN
    -- Add is_active to courses if not exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_active') THEN
            ALTER TABLE public.courses ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;
    END IF;
    
    -- Add is_active to subscription_plans if not exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'is_active') THEN
            ALTER TABLE public.subscription_plans ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;
    END IF;
    
    -- Add is_published to market_news if not exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'market_news') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_news' AND column_name = 'is_published') THEN
            ALTER TABLE public.market_news ADD COLUMN is_published BOOLEAN DEFAULT true;
        END IF;
    END IF;
    
    -- Add is_active to forum_categories if not exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_categories') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'is_active') THEN
            ALTER TABLE public.forum_categories ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;
    END IF;
    
    -- Add lesson_id to video_progress if not exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_progress') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'lesson_id') THEN
            ALTER TABLE public.video_progress ADD COLUMN lesson_id UUID;
        END IF;
    END IF;
END $$;

-- =============================================
-- ADD MISSING COLUMNS TO PROFILES (if they exist)
-- =============================================
DO $$ 
BEGIN
    -- Add role column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
    
    -- Add avatar_url column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Add username column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT;
    END IF;
    
    -- Add bio column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;
    
    -- Add phone column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
    
    -- Add is_verified column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
    
    -- Add xp_points column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'xp_points') THEN
        ALTER TABLE public.profiles ADD COLUMN xp_points INTEGER DEFAULT 0;
    END IF;
    
    -- Add streak_days column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'streak_days') THEN
        ALTER TABLE public.profiles ADD COLUMN streak_days INTEGER DEFAULT 0;
    END IF;
    
    -- Add last_active column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_active') THEN
        ALTER TABLE public.profiles ADD COLUMN last_active TIMESTAMPTZ;
    END IF;
    
    -- Add reputation_score column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'reputation_score') THEN
        ALTER TABLE public.profiles ADD COLUMN reputation_score INTEGER DEFAULT 0;
    END IF;
    
    -- Add forum_post_count column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'forum_post_count') THEN
        ALTER TABLE public.profiles ADD COLUMN forum_post_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add is_trusted_member column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_trusted_member') THEN
        ALTER TABLE public.profiles ADD COLUMN is_trusted_member BOOLEAN DEFAULT false;
    END IF;
END $$;

-- =============================================
-- ENABLE RLS ON TABLES (with existence checks)
-- =============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses' AND table_schema = 'public') THEN ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons' AND table_schema = 'public') THEN ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans' AND table_schema = 'public') THEN ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials' AND table_schema = 'public') THEN ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'success_stories' AND table_schema = 'public') THEN ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'market_news' AND table_schema = 'public') THEN ALTER TABLE public.market_news ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'market_analysis' AND table_schema = 'public') THEN ALTER TABLE public.market_analysis ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_categories' AND table_schema = 'public') THEN ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_threads' AND table_schema = 'public') THEN ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_replies' AND table_schema = 'public') THEN ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_orders' AND table_schema = 'public') THEN ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_reports' AND table_schema = 'public') THEN ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings' AND table_schema = 'public') THEN ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'videos' AND table_schema = 'public') THEN ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'images' AND table_schema = 'public') THEN ALTER TABLE public.images ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_progress' AND table_schema = 'public') THEN ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_streaks' AND table_schema = 'public') THEN ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_sessions' AND table_schema = 'public') THEN ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'session_chat' AND table_schema = 'public') THEN ALTER TABLE public.session_chat ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'session_polls' AND table_schema = 'public') THEN ALTER TABLE public.session_polls ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'poll_votes' AND table_schema = 'public') THEN ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_enrollments' AND table_schema = 'public') THEN ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suspicious_activity' AND table_schema = 'public') THEN ALTER TABLE public.suspicious_activity ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_achievements' AND table_schema = 'public') THEN ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_follows' AND table_schema = 'public') THEN ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_blocks' AND table_schema = 'public') THEN ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_messages' AND table_schema = 'public') THEN ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY; END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_notifications' AND table_schema = 'public') THEN ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY; END IF;
END $$;

-- =============================================
-- RLS POLICIES (with table/column existence checks)
-- =============================================

-- Courses policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view active courses" ON public.courses;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_active') THEN
            CREATE POLICY "Public can view active courses" ON public.courses FOR SELECT USING (is_active = true);
        ELSE
            CREATE POLICY "Public can view active courses" ON public.courses FOR SELECT USING (true);
        END IF;
    END IF;
END $$;

-- Lessons policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view lessons" ON public.lessons;
        CREATE POLICY "Public can view lessons" ON public.lessons FOR SELECT USING (true);
    END IF;
END $$;

-- Subscription plans policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view active plans" ON public.subscription_plans;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'is_active') THEN
            CREATE POLICY "Public can view active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
        ELSE
            CREATE POLICY "Public can view active plans" ON public.subscription_plans FOR SELECT USING (true);
        END IF;
    END IF;
END $$;

-- Testimonials policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials') THEN
        ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'status') THEN
            CREATE POLICY "Public can view approved testimonials" ON public.testimonials FOR SELECT USING (status = 'approved');
        ELSE
            CREATE POLICY "Public can view approved testimonials" ON public.testimonials FOR SELECT USING (true);
        END IF;
    END IF;
END $$;

-- Success stories policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'success_stories') THEN
        ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view approved success stories" ON public.success_stories;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'success_stories' AND column_name = 'status') THEN
            CREATE POLICY "Public can view approved success stories" ON public.success_stories FOR SELECT USING (status = 'approved');
        ELSE
            CREATE POLICY "Public can view approved success stories" ON public.success_stories FOR SELECT USING (true);
        END IF;
    END IF;
END $$;

-- Market news policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'market_news') THEN
        ALTER TABLE public.market_news ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view published news" ON public.market_news;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_news' AND column_name = 'is_published') THEN
            CREATE POLICY "Public can view published news" ON public.market_news FOR SELECT USING (is_published = true);
        ELSE
            CREATE POLICY "Public can view published news" ON public.market_news FOR SELECT USING (true);
        END IF;
    END IF;
END $$;

-- Market analysis policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'market_analysis') THEN
        ALTER TABLE public.market_analysis ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view analysis" ON public.market_analysis;
        CREATE POLICY "Public can view analysis" ON public.market_analysis FOR SELECT USING (true);
    END IF;
END $$;

-- Forum categories policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_categories') THEN
        ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view active categories" ON public.forum_categories;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'is_active') THEN
            CREATE POLICY "Public can view active categories" ON public.forum_categories FOR SELECT USING (is_active = true);
        ELSE
            CREATE POLICY "Public can view active categories" ON public.forum_categories FOR SELECT USING (true);
        END IF;
    END IF;
END $$;

-- Live sessions policy
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_sessions') THEN
        ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view active sessions" ON public.live_sessions;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_sessions' AND column_name = 'status') THEN
            CREATE POLICY "Public can view active sessions" ON public.live_sessions FOR SELECT USING (status != 'cancelled');
        ELSE
            CREATE POLICY "Public can view active sessions" ON public.live_sessions FOR SELECT USING (true);
        END IF;
    END IF;
END $$;

-- Admin full access (check if profiles table and role column exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        -- Courses admin policy
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
            DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
            CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            );
        END IF;
        
        -- Lessons admin policy
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
            DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
            CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            );
        END IF;
        
        -- Plans admin policy
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
            DROP POLICY IF EXISTS "Admins can manage plans" ON public.subscription_plans;
            CREATE POLICY "Admins can manage plans" ON public.subscription_plans FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            );
        END IF;
        
        -- Testimonials admin policy
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials') THEN
            DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
            CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            );
        END IF;
        
        -- News admin policy
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'market_news') THEN
            DROP POLICY IF EXISTS "Admins can manage news" ON public.market_news;
            CREATE POLICY "Admins can manage news" ON public.market_news FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            );
        END IF;
        
        -- Analysis admin policy
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'market_analysis') THEN
            DROP POLICY IF EXISTS "Admins can manage analysis" ON public.market_analysis;
            CREATE POLICY "Admins can manage analysis" ON public.market_analysis FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            );
        END IF;
        
        -- Categories admin policy
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_categories') THEN
            DROP POLICY IF EXISTS "Admins can manage categories" ON public.forum_categories;
            CREATE POLICY "Admins can manage categories" ON public.forum_categories FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            );
        END IF;
        
        -- Sessions admin policy
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_sessions') THEN
            DROP POLICY IF EXISTS "Admins can manage sessions" ON public.live_sessions;
            CREATE POLICY "Admins can manage sessions" ON public.live_sessions FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            );
        END IF;
    END IF;
END $$;

-- User-specific policies (with existence checks)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_enrollments') THEN
        DROP POLICY IF EXISTS "Users can view own enrollments" ON public.user_enrollments;
        CREATE POLICY "Users can view own enrollments" ON public.user_enrollments FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'video_progress') THEN
        DROP POLICY IF EXISTS "Users can view own progress" ON public.video_progress;
        CREATE POLICY "Users can view own progress" ON public.video_progress FOR SELECT USING (auth.uid() = user_id);
        DROP POLICY IF EXISTS "Users can update own progress" ON public.video_progress;
        CREATE POLICY "Users can update own progress" ON public.video_progress FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_streaks') THEN
        DROP POLICY IF EXISTS "Users can view own streaks" ON public.user_streaks;
        CREATE POLICY "Users can view own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_orders') THEN
        DROP POLICY IF EXISTS "Users can view own orders" ON public.payment_orders;
        CREATE POLICY "Users can view own orders" ON public.payment_orders FOR SELECT USING (auth.uid() = user_id);
        DROP POLICY IF EXISTS "Users can create orders" ON public.payment_orders;
        CREATE POLICY "Users can create orders" ON public.payment_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- =============================================
-- INDEXES (with existence checks)
-- =============================================
DO $$
BEGIN
    -- Courses indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'slug') THEN
        CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_courses_active ON public.courses(is_active);
    END IF;
    
    -- Lessons indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'course_id') THEN
        CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons(course_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'slug') THEN
        CREATE INDEX IF NOT EXISTS idx_lessons_slug ON public.lessons(slug);
    END IF;
    
    -- Testimonials indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
    END IF;
    
    -- Success stories indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'success_stories' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_success_stories_status ON public.success_stories(status);
    END IF;
    
    -- Market news indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_news' AND column_name = 'is_published') THEN
        CREATE INDEX IF NOT EXISTS idx_news_published ON public.market_news(is_published, published_at);
    END IF;
    
    -- Market analysis indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'market_analysis' AND column_name = 'published_at') THEN
        CREATE INDEX IF NOT EXISTS idx_analysis_published ON public.market_analysis(published_at);
    END IF;
    
    -- Forum categories indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'slug') THEN
        CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON public.forum_categories(slug);
    END IF;
    
    -- Forum threads indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_threads' AND column_name = 'category_id') THEN
        CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON public.forum_threads(category_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_threads' AND column_name = 'last_activity_at') THEN
        CREATE INDEX IF NOT EXISTS idx_forum_threads_activity ON public.forum_threads(last_activity_at);
    END IF;
    
    -- Forum replies indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_replies' AND column_name = 'thread_id') THEN
        CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON public.forum_replies(thread_id);
    END IF;
    
    -- Video progress indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_video_progress_user ON public.video_progress(user_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'video_progress' AND column_name = 'lesson_id') THEN
        CREATE INDEX IF NOT EXISTS idx_video_progress_lesson ON public.video_progress(lesson_id);
    END IF;
    
    -- User enrollments indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_enrollments' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.user_enrollments(user_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_enrollments' AND column_name = 'course_id') THEN
        CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.user_enrollments(course_id);
    END IF;
    
    -- Live sessions indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_sessions' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON public.live_sessions(status);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_sessions' AND column_name = 'scheduled_at') THEN
        CREATE INDEX IF NOT EXISTS idx_live_sessions_scheduled ON public.live_sessions(scheduled_at);
    END IF;
    
    -- Session chat indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_chat' AND column_name = 'session_id') THEN
        CREATE INDEX IF NOT EXISTS idx_session_chat_session ON public.session_chat(session_id);
    END IF;
    
    -- Poll votes indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'poll_votes' AND column_name = 'poll_id') THEN
        CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON public.poll_votes(poll_id);
    END IF;
    
    -- Suspicious activity indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suspicious_activity' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_suspicious_activity_user ON public.suspicious_activity(user_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suspicious_activity' AND column_name = 'reviewed') THEN
        CREATE INDEX IF NOT EXISTS idx_suspicious_activity_reviewed ON public.suspicious_activity(reviewed);
    END IF;
    
    -- User achievements indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_achievements' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
    END IF;
    
    -- User follows indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_follows' AND column_name = 'follower_id') THEN
        CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_follows' AND column_name = 'following_id') THEN
        CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);
    END IF;
    
    -- User messages indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_messages' AND column_name = 'sender_id') THEN
        CREATE INDEX IF NOT EXISTS idx_user_messages_sender ON public.user_messages(sender_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_messages' AND column_name = 'recipient_id') THEN
        CREATE INDEX IF NOT EXISTS idx_user_messages_recipient ON public.user_messages(recipient_id);
    END IF;
    
    -- User notifications indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notifications' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON public.user_notifications(user_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_notifications' AND column_name = 'read_at') THEN
        CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON public.user_notifications(user_id, read_at);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_user_messages_recipient ON public.user_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON public.user_notifications(user_id, read_at);

-- =============================================
-- SEED DATA (with column existence checks)
-- =============================================

-- Insert default subscription plans (check if table and slug column exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'slug') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'is_active') THEN
            INSERT INTO public.subscription_plans (name, slug, description, price, interval_value, features, cta_text, is_popular, is_active) VALUES
            ('Basic', 'basic', 'Perfect for beginners', 0, 'monthly', '["Access to beginner courses", "Daily market updates", "Community forum access"]', 'Start Free', false, true),
            ('Medium', 'medium', 'For serious traders', 2999, 'monthly', '["All Basic features", "Intermediate courses", "Live session access", "Priority support"]', 'Get Started', true, true),
            ('Advanced', 'advanced', 'Complete trading mastery', 9999, 'lifetime', '["All Medium features", "Advanced courses", "1-on-1 mentorship", "Exclusive indicators", "Lifetime updates"]', 'Go Pro', false, true)
            ON CONFLICT (slug) DO NOTHING;
        ELSE
            INSERT INTO public.subscription_plans (name, slug, description, price, interval_value, features, cta_text, is_popular) VALUES
            ('Basic', 'basic', 'Perfect for beginners', 0, 'monthly', '["Access to beginner courses", "Daily market updates", "Community forum access"]', 'Start Free', false),
            ('Medium', 'medium', 'For serious traders', 2999, 'monthly', '["All Basic features", "Intermediate courses", "Live session access", "Priority support"]', 'Get Started', true),
            ('Advanced', 'advanced', 'Complete trading mastery', 9999, 'lifetime', '["All Medium features", "Advanced courses", "1-on-1 mentorship", "Exclusive indicators", "Lifetime updates"]', 'Go Pro', false)
            ON CONFLICT (slug) DO NOTHING;
        END IF;
    END IF;
END $$;

-- Insert default system settings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'key') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'category') THEN
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
        ELSE
            INSERT INTO public.system_settings (key, value, description) VALUES
            ('site_name', 'Quantum Bull', 'Website name'),
            ('site_description', 'Master Trading From Basics to Advanced', 'Website description'),
            ('contact_email', 'support@quantumbull.com', 'Contact email'),
            ('contact_phone', '+919876543210', 'Contact phone'),
            ('razorpay_key_id', '', 'Razorpay Key ID'),
            ('razorpay_key_secret', '', 'Razorpay Key Secret'),
            ('enable_registration', 'true', 'Enable user registration'),
            ('enable_live_sessions', 'true', 'Enable live sessions')
            ON CONFLICT (key) DO NOTHING;
        END IF;
    END IF;
END $$;

-- Insert forum categories (check if table and slug column exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'slug') THEN
        -- Check which columns exist
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'color') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forum_categories' AND column_name = 'is_active') THEN
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
            ELSE
                INSERT INTO public.forum_categories (name, slug, description, color, display_order) VALUES
                ('General Discussion', 'general', 'Talk about anything related to trading', '#2EBD59', 1),
                ('Beginner Questions', 'beginner', 'New to trading? Ask here', '#3B82F6', 2),
                ('Technical Analysis', 'technical', 'Chart patterns, indicators, and analysis', '#8B5CF6', 3),
                ('Fundamental Analysis', 'fundamental', 'News, earnings, and macro analysis', '#F59E0B', 4),
                ('Trading Strategies', 'strategies', 'Share and discuss trading strategies', '#EC4899', 5),
                ('Psychology & Mindset', 'psychology', 'Trading psychology and mental game', '#10B981', 6),
                ('Market Stories', 'stories', 'Share your trading experiences', '#6366F1', 7),
                ('Announcements', 'announcements', 'Official updates and news', '#EF4444', 8)
                ON CONFLICT (slug) DO NOTHING;
            END IF;
        ELSE
            INSERT INTO public.forum_categories (name, slug, description, display_order) VALUES
            ('General Discussion', 'general', 'Talk about anything related to trading', 1),
            ('Beginner Questions', 'beginner', 'New to trading? Ask here', 2),
            ('Technical Analysis', 'technical', 'Chart patterns, indicators, and analysis', 3),
            ('Fundamental Analysis', 'fundamental', 'News, earnings, and macro analysis', 4),
            ('Trading Strategies', 'strategies', 'Share and discuss trading strategies', 5),
            ('Psychology & Mindset', 'psychology', 'Trading psychology and mental game', 6),
            ('Market Stories', 'stories', 'Share your trading experiences', 7),
            ('Announcements', 'announcements', 'Official updates and news', 8)
            ON CONFLICT (slug) DO NOTHING;
        END IF;
    END IF;
END $$;

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
GRANT ALL ON public.suspicious_activity TO authenticated;
GRANT ALL ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_follows TO authenticated;
GRANT ALL ON public.user_blocks TO authenticated;
GRANT ALL ON public.user_messages TO authenticated;
GRANT ALL ON public.user_notifications TO authenticated;

GRANT ALL ON public.poll_votes TO service_role;
GRANT ALL ON public.user_enrollments TO service_role;
GRANT ALL ON public.suspicious_activity TO service_role;
GRANT ALL ON public.user_achievements TO service_role;
GRANT ALL ON public.user_follows TO service_role;
GRANT ALL ON public.user_blocks TO service_role;
GRANT ALL ON public.user_messages TO service_role;
GRANT ALL ON public.user_notifications TO service_role;

-- Enable realtime for chat and polls (ignore if already added)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'session_chat'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.session_chat;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'session_polls'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.session_polls;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'poll_votes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'live_sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.live_sessions;
    END IF;
END $$;
