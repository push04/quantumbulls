-- =============================================================================
-- QUANTUM BULL - COMPREHENSIVE DATABASE SETUP & FIXES
-- =============================================================================
-- Run this file in your Supabase SQL Editor to set up/fix the complete system
-- =============================================================================

-- =============================================================================
-- PART 1: FORUM CATEGORIES - ADD MISSING COLUMNS & SEED DATA
-- =============================================================================

-- Add missing columns to forum_categories
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#2EBD59';
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS sub_tags TEXT[] DEFAULT '{}';
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS topics_count INTEGER DEFAULT 0;

-- Clear existing categories and insert proper ones
DELETE FROM forum_categories;

INSERT INTO forum_categories (name, slug, description, color, sub_tags, display_order, topics_count) VALUES
    ('Beginner Questions', 'beginner-questions', 'For newcomers asking basic trading questions and getting started guidance.', '#3B82F6', ARRAY['Getting Started', 'Basics', 'First Steps'], 1, 0),
    ('Trading Discussion', 'trading-discussion', 'General forex and trading market discussion. Share ideas and learn from others.', '#10B981', ARRAY['Currencies', 'Chart Art', 'News', 'Risk Management'], 2, 0),
    ('Trading Systems', 'trading-systems', 'Discussing specific strategies and trading systems.', '#8B5CF6', ARRAY['Strategies', 'Indicators', 'EA Trading'], 3, 0),
    ('Chart Analysis', 'chart-analysis', 'Candlesticks, chart patterns, and price action analysis.', '#F59E0B', ARRAY['Technical Analysis', 'Price Action', 'Candlesticks'], 4, 0),
    ('Trading Psychology', 'trading-psychology', 'Mindset, emotions, and discipline in trading.', '#EC4899', ARRAY['Mindset', 'Emotions', 'Discipline'], 5, 0),
    ('News & Economy', 'news-economy', 'Market news, economic events, and fundamental analysis.', '#14B8A6', ARRAY['Forex News', 'Central Banks', 'Economic Data'], 6, 0),
    ('Risk Management', 'risk-management', 'Position sizing, money management, and risk control.', '#EF4444', ARRAY['Position Sizing', 'Money Management', 'Risk Control'], 7, 0),
    ('Prop Firms', 'prop-firms', 'Discussion about proprietary trading firms.', '#6366F1', ARRAY['Funded Accounts', 'Challenges', 'Evaluation'], 8, 0),
    ('Crypto & Digital Assets', 'crypto-assets', 'Cryptocurrency trading discussion.', '#F97316', ARRAY['Bitcoin', 'Altcoins', 'DeFi'], 9, 0),
    ('Global Markets', 'global-markets', 'Stocks, commodities, bonds beyond forex.', '#0EA5E9', ARRAY['Stocks', 'Commodities', 'Bonds'], 10, 0),
    ('Introduce Yourself', 'introduce-yourself', 'New member introductions.', '#84CC16', ARRAY['New Members', 'Hello'], 11, 0),
    ('The Lobby', 'the-lobby', 'Off-topic and casual conversation.', '#6B7280', ARRAY['Off-Topic', 'Casual', 'Fun'], 12, 0);

-- =============================================================================
-- PART 2: PROFILES - ADD MISSING COLUMNS
-- =============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS forum_post_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_trusted_member BOOLEAN DEFAULT FALSE;

-- =============================================================================
-- PART 3: COURSES - ADD MISSING COLUMNS & FIX
-- =============================================================================

ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Ensure lessons table has required columns
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_free_preview BOOLEAN DEFAULT false;

-- Create modules table if not exists
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add module_id to lessons if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'module_id') THEN
        ALTER TABLE lessons ADD COLUMN module_id UUID REFERENCES modules(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =============================================================================
-- PART 4: SUBSCRIPTION PLANS - ADD MISSING COLUMNS
-- =============================================================================

ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS cta_text TEXT;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS cta_link TEXT;

-- =============================================================================
-- PART 5: MARKET NEWS - ADD MISSING COLUMNS
-- =============================================================================

ALTER TABLE market_news ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE market_news ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE market_news ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE market_news ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =============================================================================
-- PART 6: MARKET ANALYSIS - ADD MISSING COLUMNS
-- =============================================================================

ALTER TABLE market_analysis ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES profiles(id);
ALTER TABLE market_analysis ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE market_analysis ADD COLUMN IF NOT EXISTS summary TEXT;

-- =============================================================================
-- PART 7: SUCCESS STORIES - ADD MISSING COLUMNS
-- =============================================================================

ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS before_story TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS after_story TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- =============================================================================
-- PART 8: TESTIMONIALS - ADD MISSING COLUMNS
-- =============================================================================

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;

-- =============================================================================
-- PART 9: VIDEOS BUCKET - CREATE IF NOT EXISTS
-- =============================================================================

-- Check if videos bucket exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'videos') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('videos', 'videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']);
    END IF;
END $$;

-- Grant permissions on videos bucket
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO service_role;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.buckets TO service_role;

-- =============================================================================
-- PART 10: IMAGES BUCKET - CREATE IF NOT EXISTS
-- =============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('images', 'images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    END IF;
END $$;

GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO service_role;

-- =============================================================================
-- PART 11: ROW LEVEL SECURITY POLICIES - FIX ALL
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Forum Categories Policies
DROP POLICY IF EXISTS "Anyone can view active categories" ON forum_categories;
CREATE POLICY "Anyone can view active categories" ON forum_categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage categories" ON forum_categories;
CREATE POLICY "Admins can manage categories" ON forum_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Forum Threads Policies
DROP POLICY IF EXISTS "Anyone can view active threads" ON forum_threads;
CREATE POLICY "Anyone can view active threads" ON forum_threads FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Authenticated users can create threads" ON forum_threads;
CREATE POLICY "Authenticated users can create threads" ON forum_threads FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own threads" ON forum_threads;
CREATE POLICY "Authors can update own threads" ON forum_threads FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can manage threads" ON forum_threads;
CREATE POLICY "Admins can manage threads" ON forum_threads FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Forum Replies Policies
DROP POLICY IF EXISTS "Anyone can view active replies" ON forum_replies;
CREATE POLICY "Anyone can view active replies" ON forum_replies FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Authenticated users can create replies" ON forum_replies;
CREATE POLICY "Authenticated users can create replies" ON forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own replies" ON forum_replies;
CREATE POLICY "Authors can update own replies" ON forum_replies FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can manage replies" ON forum_replies;
CREATE POLICY "Admins can manage replies" ON forum_replies FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Forum Votes Policies
DROP POLICY IF EXISTS "Users can view own votes" ON forum_votes;
CREATE POLICY "Users can view own votes" ON forum_votes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can vote" ON forum_votes;
CREATE POLICY "Users can vote" ON forum_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can change vote" ON forum_votes;
CREATE POLICY "Users can change vote" ON forum_votes FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove vote" ON forum_votes;
CREATE POLICY "Users can remove vote" ON forum_votes FOR DELETE USING (auth.uid() = user_id);

-- Courses Policies
DROP POLICY IF EXISTS "Public can view active courses" ON courses;
CREATE POLICY "Public can view active courses" ON courses FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
CREATE POLICY "Admins can manage courses" ON courses FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Lessons Policies
DROP POLICY IF EXISTS "Public can view lessons" ON lessons;
CREATE POLICY "Public can view lessons" ON lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
CREATE POLICY "Admins can manage lessons" ON lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Market News Policies
DROP POLICY IF EXISTS "Public can view news" ON market_news;
CREATE POLICY "Public can view news" ON market_news FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage news" ON market_news;
CREATE POLICY "Admins can manage news" ON market_news FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Market Analysis Policies
DROP POLICY IF EXISTS "Public can view analysis" ON market_analysis;
CREATE POLICY "Public can view analysis" ON market_analysis FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage analysis" ON market_analysis;
CREATE POLICY "Admins can manage analysis" ON market_analysis FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Success Stories Policies
DROP POLICY IF EXISTS "Public can view approved stories" ON success_stories;
CREATE POLICY "Public can view approved stories" ON success_stories FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Admins can manage stories" ON success_stories;
CREATE POLICY "Admins can manage stories" ON success_stories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Testimonials Policies
DROP POLICY IF EXISTS "Public can view approved testimonials" ON testimonials;
CREATE POLICY "Public can view approved testimonials" ON testimonials FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Admins can manage testimonials" ON testimonials FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
CREATE POLICY "Public can view profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;
CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================================================
-- PART 12: STORAGE POLICIES
-- =============================================================================

-- Videos storage policies
DROP POLICY IF EXISTS "Anyone can view videos" ON storage.objects;
CREATE POLICY "Anyone can view videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');

DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
CREATE POLICY "Authenticated users can upload videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage videos" ON storage.objects;
CREATE POLICY "Admins can manage videos" ON storage.objects FOR ALL USING (bucket_id = 'videos' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Images storage policies
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage images" ON storage.objects;
CREATE POLICY "Admins can manage images" ON storage.objects FOR ALL USING (bucket_id = 'images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- PART 13: INDEXES - CREATE FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_activity ON forum_threads(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_target ON forum_votes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_market_news_published ON market_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_analysis_published ON market_analysis(published_at DESC);

-- =============================================================================
-- PART 14: REALTIME SUBSCRIPTIONS
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE forum_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_threads;

-- =============================================================================
-- COMPLETE!
-- =============================================================================
-- All tables, columns, policies, and configurations are now set up.
-- The forum, courses, videos, images, and all features should work properly.
-- =============================================================================
