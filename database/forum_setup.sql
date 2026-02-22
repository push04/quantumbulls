-- =============================================================================
-- QUANTUM BULL COMMUNITY FORUM - COMPLETE DATABASE SETUP
-- =============================================================================
-- Run this file in your Supabase SQL Editor to set up the complete forum system
-- =============================================================================

-- =============================================================================
-- PART 1: FORUM CATEGORIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20) DEFAULT '#2EBD59',
    sub_tags TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    topics_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert forum categories
INSERT INTO forum_categories (name, slug, description, color, sub_tags, display_order, topics_count) VALUES
    ('Beginner Questions', 'beginner-questions', 'For newcomers asking basic trading questions and getting started guidance.', '#3B82F6', ARRAY['Getting Started', 'Basics', 'First Steps'], 1, 0),
    ('Trading Discussion', 'trading-discussion', 'General forex and trading market discussion. Share ideas and learn from others.', '#10B981', ARRAY['Currencies', 'Chart Art', 'News and Economy', 'Risk Management', 'Trade Journals', 'Prop Firms', 'Trading Lifestyle', 'Binary Options'], 2, 0),
    ('Trading Systems', 'trading-systems', 'Discussing specific strategies and trading systems. Share your setups and get feedback.', '#8B5CF6', ARRAY['Strategies', 'Indicators', 'EA Trading', 'Automated'], 3, 0),
    ('Chart Analysis', 'chart-analysis', 'Candlesticks, chart patterns, and price action analysis. Post your charts!', '#F59E0B', ARRAY['Technical Analysis', 'Price Action', 'Candlesticks', 'Patterns'], 4, 0),
    ('Trading Psychology', 'trading-psychology', 'Mindset, emotions, and discipline in trading. Master your mental game.', '#EC4899', ARRAY['Mindset', 'Emotions', 'Discipline', 'Journaling'], 5, 0),
    ('News & Economy', 'news-economy', 'Market news, economic events, and fundamental analysis discussion.', '#14B8A6', ARRAY['Forex News', 'Central Banks', 'Economic Data', 'Fundamentals'], 6, 0),
    ('Risk Management', 'risk-management', 'Position sizing, money management, and risk control practices.', '#EF4444', ARRAY['Position Sizing', 'Money Management', 'Risk Control', 'Portfolio'], 7, 0),
    ('Prop Firms', 'prop-firms', 'Discussion about proprietary trading firms, challenges, and funded accounts.', '#6366F1', ARRAY['Funded Accounts', 'Challenges', 'Evaluation', 'Payouts'], 8, 0),
    ('Crypto & Digital Assets', 'crypto-assets', 'Cryptocurrency trading and digital assets discussion.', '#F97316', ARRAY['Bitcoin', 'Altcoins', 'DeFi', 'NFTs'], 9, 0),
    ('Global Markets', 'global-markets', 'Stocks, commodities, bonds and markets beyond forex.', '#0EA5E9', ARRAY['Stocks', 'Commodities', 'Bonds', 'Indices'], 10, 0),
    ('Introduce Yourself', 'introduce-yourself', 'New member introductions. Say hello and tell us about your journey!', '#84CC16', ARRAY['New Members', 'Hello'], 11, 0),
    ('The Lobby', 'the-lobby', 'Off-topic and casual conversation. Take a break and chat with fellow traders.', '#6B7280', ARRAY['Off-Topic', 'Casual', 'Fun'], 12, 0)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- PART 2: FORUM THREADS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    vote_score INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PART 3: FORUM REPLIES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_solution BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    vote_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PART 4: FORUM VOTES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS forum_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL,
    target_id UUID NOT NULL,
    vote_value INTEGER NOT NULL CHECK (vote_value IN (-1, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- =============================================================================
-- PART 5: ADD COLUMNS TO PROFILES (if not exist)
-- =============================================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS forum_post_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_trusted_member BOOLEAN DEFAULT FALSE;

-- =============================================================================
-- PART 6: ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

-- Forum Categories Policies
DROP POLICY IF EXISTS "Anyone can view active categories" ON forum_categories;
CREATE POLICY "Anyone can view active categories" ON forum_categories
    FOR SELECT USING (is_active = true);

-- Admin can manage categories
DROP POLICY IF EXISTS "Admins can manage categories" ON forum_categories;
CREATE POLICY "Admins can manage categories" ON forum_categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Forum Threads Policies
DROP POLICY IF EXISTS "Anyone can view active threads" ON forum_threads;
CREATE POLICY "Anyone can view active threads" ON forum_threads
    FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Authenticated users can create threads" ON forum_threads;
CREATE POLICY "Authenticated users can create threads" ON forum_threads
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own threads" ON forum_threads;
CREATE POLICY "Authors can update own threads" ON forum_threads
    FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can manage threads" ON forum_threads;
CREATE POLICY "Admins can manage threads" ON forum_threads
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Forum Replies Policies
DROP POLICY IF EXISTS "Anyone can view active replies" ON forum_replies;
CREATE POLICY "Anyone can view active replies" ON forum_replies
    FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Authenticated users can create replies" ON forum_replies;
CREATE POLICY "Authenticated users can create replies" ON forum_replies
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own replies" ON forum_replies;
CREATE POLICY "Authors can update own replies" ON forum_replies
    FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can manage replies" ON forum_replies;
CREATE POLICY "Admins can manage replies" ON forum_replies
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Forum Votes Policies
DROP POLICY IF EXISTS "Users can view own votes" ON forum_votes;
CREATE POLICY "Users can view own votes" ON forum_votes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can vote" ON forum_votes;
CREATE POLICY "Users can vote" ON forum_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can change vote" ON forum_votes;
CREATE POLICY "Users can change vote" ON forum_votes
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove vote" ON forum_votes;
CREATE POLICY "Users can remove vote" ON forum_votes
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- PART 7: INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_activity ON forum_threads(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_target ON forum_votes(target_type, target_id);

-- =============================================================================
-- PART 8: REALTIME SUBSCRIPTIONS
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE forum_replies;

-- =============================================================================
-- PART 9: CREATE USER SAMPLE DATA (Optional - for demo)
-- =============================================================================
-- Uncomment and modify to create sample users:
-- INSERT INTO auth.users (id, email, encrypted_password, created_at)
-- VALUES (gen_random_uuid(), 'demo@quantumbull.com', 'hashed_password', NOW());

-- =============================================================================
-- COMPLETE - Forum is now ready to use!
-- =============================================================================
-- 
-- To use the forum:
-- 1. Users can sign up/login on the website
-- 2. Once logged in, users can create new discussion threads
-- 3. Users can reply to existing threads
-- 4. Users can vote on threads and replies
-- 5. Admins can manage all content from the admin dashboard
--
-- The forum will show real data from the database on the community page.
-- =============================================================================
