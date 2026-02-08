-- Phase 13: Content & Plans (Dynamic Data)
-- Run this in Supabase SQL Editor

-- ===========================================
-- Subscription Plans
-- ===========================================
DROP TABLE IF EXISTS subscription_plans CASCADE;
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    interval TEXT CHECK (interval IN ('month', 'year', 'lifetime')) DEFAULT 'month',
    features TEXT[] DEFAULT '{}',
    is_popular BOOLEAN DEFAULT false,
    tier TEXT UNIQUE NOT NULL CHECK (tier IN ('free', 'basic', 'pro', 'mentor')),
    cta_text TEXT DEFAULT 'Get Started',
    cta_link TEXT DEFAULT '/signup',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Data for Plans
INSERT INTO subscription_plans (name, price, interval, features, is_popular, tier, cta_text, display_order)
VALUES 
    ('Basic', 0, 'month', ARRAY['Community Access', 'Basic Courses', 'Daily Market News'], false, 'free', 'Get Started', 1),
    ('Pro Trader', 999, 'month', ARRAY['All Basic Features', 'Advanced Courses', 'Live Trading Sessions', 'Priority Support'], true, 'pro', 'Start Pro Trial', 2),
    ('Mentorship', 4999, 'month', ARRAY['All Pro Features', '1-on-1 Mentoring', 'Portfolio Review', 'Direct WhatsApp Access'], false, 'mentor', 'Apply Now', 3)
ON CONFLICT (tier) DO NOTHING;

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read plans" ON subscription_plans FOR SELECT USING (true);

-- ===========================================
-- Market Analysis
-- ===========================================
DROP TABLE IF EXISTS market_analysis CASCADE;
CREATE TABLE market_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id),
    image_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Data (Example) - In real app, created by Admin
-- We don't insert here to avoid constraint errors if no admin user exists yet.
-- But table structure is ready.

ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read analysis" ON market_analysis FOR SELECT USING (true);
CREATE POLICY "Admins manage analysis" ON market_analysis FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ===========================================
-- Market News
-- ===========================================
DROP TABLE IF EXISTS market_news CASCADE;
CREATE TABLE market_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT,
    source TEXT,
    url TEXT,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Data (Example)
INSERT INTO market_news (title, summary, source, published_at)
VALUES 
    ('Global Markets Rally Ahead of Fed Meeting', 'Major indices hit new highs as investors anticipate rate cuts.', 'Bloomberg', now()),
    ('Tech Sector Leads Gains in Volatile Session', 'AI stocks continue to drive market momentum despite economic headwinds.', 'Reuters', now() - INTERVAL '1 day');

ALTER TABLE market_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read news" ON market_news FOR SELECT USING (true);
CREATE POLICY "Admins manage news" ON market_news FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ===========================================
-- Site Stats View (for Hero)
-- ===========================================
-- Creating a secure view to aggregate stats without exposing user data
CREATE OR REPLACE VIEW site_stats AS
SELECT 
    (SELECT COUNT(*) FROM courses WHERE is_active = true) as total_courses,
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM success_stories WHERE status = 'approved') as total_success_stories;

GRANT SELECT ON site_stats TO anon, authenticated, service_role;
