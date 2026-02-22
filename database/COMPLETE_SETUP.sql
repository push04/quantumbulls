-- =============================================================================
-- QUANTUM BULL - COMPLETE DATABASE SETUP & SEED DATA
-- =============================================================================
-- Run this file in your Supabase SQL Editor to set up the complete system Run in order -
-- IMPORTANT: this script creates tables, adds columns, seeds data
-- =============================================================================

-- =============================================================================
-- SECTION 1: FORUM CATEGORIES - SETUP & SEED DATA
-- =============================================================================

-- Add missing columns to forum_categories
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#2EBD59';
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS sub_tags TEXT[] DEFAULT '{}';
ALTER TABLE forum_categories ADD COLUMN IF NOT EXISTS topics_count INTEGER DEFAULT 0;

-- Clear existing categories and insert proper ones
DELETE FROM forum_categories;

INSERT INTO forum_categories (name, slug, description, color, sub_tags, display_order, is_active) VALUES
    ('Beginner Questions', 'beginner-questions', 'For newcomers asking basic trading questions and getting started guidance.', '#3B82F6', ARRAY['Getting Started', 'Basics', 'First Steps'], 1, true),
    ('Trading Discussion', 'trading-discussion', 'General forex and trading market discussion. Share ideas and learn from others.', '#10B981', ARRAY['Currencies', 'Chart Art', 'News', 'Risk Management'], 2, true),
    ('Trading Systems', 'trading-systems', 'Discussing specific strategies and trading systems.', '#8B5CF6', ARRAY['Strategies', 'Indicators', 'EA Trading'], 3, true),
    ('Chart Analysis', 'chart-analysis', 'Candlesticks, chart patterns, and price action analysis.', '#F59E0B', ARRAY['Technical Analysis', 'Price Action', 'Candlesticks'], 4, true),
    ('Trading Psychology', 'trading-psychology', 'Mindset, emotions, and discipline in trading.', '#EC4899', ARRAY['Mindset', 'Emotions', 'Discipline'], 5, true),
    ('News & Economy', 'news-economy', 'Market news, economic events, and fundamental analysis.', '#14B8A6', ARRAY['Forex News', 'Central Banks', 'Economic Data'], 6, true),
    ('Risk Management', 'risk-management', 'Position sizing, money management, and risk control.', '#EF4444', ARRAY['Position Sizing', 'Money Management', 'Risk Control'], 7, true),
    ('Prop Firms', 'prop-firms', 'Discussion about proprietary trading firms.', '#6366F1', ARRAY['Funded Accounts', 'Challenges', 'Evaluation'], 8, true),
    ('Crypto & Digital Assets', 'crypto-assets', 'Cryptocurrency trading discussion.', '#F97316', ARRAY['Bitcoin', 'Altcoins', 'DeFi'], 9, true),
    ('Global Markets', 'global-markets', 'Stocks, commodities, bonds beyond forex.', '#0EA5E9', ARRAY['Stocks', 'Commodities', 'Bonds'], 10, true),
    ('Introduce Yourself', 'introduce-yourself', 'New member introductions.', '#84CC16', ARRAY['New Members', 'Hello'], 11, true),
    ('The Lobby', 'the-lobby', 'Off-topic and casual conversation.', '#6B7280', ARRAY['Off-Topic', 'Casual', 'Fun'], 12, true);

-- =============================================================================
-- SECTION 2: PROFILES - ADD COLUMNS
-- =============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS forum_post_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_trusted_member BOOLEAN DEFAULT FALSE;

-- =============================================================================
-- SECTION 3: COURSES - SETUP & SEED DATA
-- =============================================================================

ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;

-- Clear existing courses and insert sample courses
DELETE FROM lessons;
DELETE FROM courses;

INSERT INTO courses (title, slug, description, thumbnail_url, difficulty, tier, estimated_hours, is_active, order_index, features) VALUES
    ('Stock Market Basics', 'stock-market-basics', 'Master the fundamentals of stock market trading. Learn about candlesticks, chart patterns, and basic technical analysis.', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800', 'beginner', 'free', 10, true, 1, ARRAY['Video Lessons', 'Practice Exercises', 'Community Access']),
    ('Technical Analysis Mastery', 'technical-analysis-mastery', 'Advanced technical analysis techniques. Master indicators, chart patterns, and price action strategies.', 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800', 'intermediate', 'basic', 20, true, 2, ARRAY['Advanced Indicators', 'Real-time Examples', 'Daily Analysis', 'Priority Support']),
    ('Price Action Trading', 'price-action-trading', 'Learn to trade without indicators. Master pure price action and smart money concepts.', 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800', 'advanced', 'pro', 25, true, 3, ARRAY['Smart Money Concepts', 'Liquidity Zones', 'Order Block Trading', '1-on-1 Mentoring']),
    ('Risk & Money Management', 'risk-money-management', 'Protect your capital with professional risk management strategies.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', 'beginner', 'free', 8, true, 4, ARRAY['Position Sizing', 'Risk/Reward Ratio', 'Capital Preservation']),

    ('Forex Trading Fundamentals', 'forex-trading-fundamentals', 'Start your forex trading journey with comprehensive forex education.', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800', 'beginner', 'free', 12, true, 5, ARRAY['Currency Pairs', 'Pip Calculations', 'Broker Selection']),
    ('Options Trading Strategies', 'options-trading-strategies', 'Learn professional options trading strategies and hedging techniques.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', 'advanced', 'pro', 30, true, 6, ARRAY['Call & Put Options', 'Iron Condor', 'Delta Neutral', 'VIP Signals']);

-- Add lessons to courses - Course 1: Stock Market Basics
INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'What is Stock Market?', 'what-is-stock-market', 'Understanding the basics of stock markets', 900, 1, true, ''
FROM courses WHERE slug = 'stock-market-basics';

INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'Types of Orders', 'types-of-orders', 'Learn different order types', 720, 2, true, ''
FROM courses WHERE slug = 'stock-market-basics';

INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'Reading Candlesticks', 'reading-candlesticks', 'Master candlestick patterns', 1200, 3, false, ''
FROM courses WHERE slug = 'stock-market-basics';

INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'Support & Resistance', 'support-resistance', 'Key technical concepts', 1080, 4, false, ''
FROM courses WHERE slug = 'stock-market-basics';

-- Course 2: Technical Analysis Mastery
INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'Introduction to Indicators', 'intro-to-indicators', 'Technical indicators overview', 1500, 1, true, ''
FROM courses WHERE slug = 'technical-analysis-mastery';

INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'Moving Averages', 'moving-averages', 'MA strategies', 1800, 2, false, ''
FROM courses WHERE slug = 'technical-analysis-mastery';

INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'RSI & Stochastic', 'rsi-stochastic', 'Momentum indicators', 2100, 3, false, ''
FROM courses WHERE slug = 'technical-analysis-mastery';

INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'MACD Deep Dive', 'macd-deep-dive', 'Advanced MACD usage', 2400, 4, false, ''
FROM courses WHERE slug = 'technical-analysis-mastery';

-- Course 3: Price Action Trading
INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'Price Action Basics', 'price-action-basics', 'Pure price action trading', 1200, 1, true, ''
FROM courses WHERE slug = 'price-action-trading';

INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'Candlestick Formations', 'candlestick-formations', 'Key reversal patterns', 1500, 2, false, ''
FROM courses WHERE slug = 'price-action-trading';

INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'Trend Lines & Channels', 'trend-lines-channels', 'Drawing analysis', 1800, 3, false, ''
FROM courses WHERE slug = 'price-action-trading';

INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'Smart Money Concepts', 'smart-money-concepts', 'Institutional trading', 2400, 4, false, ''
FROM courses WHERE slug = 'price-action-trading';

-- Course 4: Risk & Money Management
INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'Risk Management Basics', 'risk-management-basics', 'Protect your capital', 900, 1, true, ''
FROM courses WHERE slug = 'risk-money-management';

INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'Position Sizing', 'position-sizing', 'Calculate lot sizes', 1200, 2, false, ''
FROM courses WHERE slug = 'risk-money-management';

INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'Risk/Reward Ratio', 'risk-reward-ratio', 'Optimize trades', 1080, 3, false, ''
FROM courses WHERE slug = 'risk-money-management';

INSERT INTO lessons (course_id, title, slug, description, duration_seconds, order_index, is_free_preview, video_url) 
SELECT id, 'Drawdown Management', 'drawdown-management', 'Handle losing streaks', 1500, 4, false, ''
FROM courses WHERE slug = 'risk-money-management';

-- =============================================================================
-- SECTION 4: SUBSCRIPTION PLANS - SETUP & SEED DATA
-- =============================================================================

ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS cta_text TEXT;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS cta_link TEXT;

DELETE FROM subscription_plans;

INSERT INTO subscription_plans (name, price, interval, description, tier, features, is_popular, cta_text) VALUES
    ('Free', 0, 'forever', 'Perfect for beginners', 'free', ARRAY['Access to free courses', 'Community forum access', 'Weekly market overview'], false, 'Start Free'),
    ('Basic', 2999, 'lifetime', 'For serious learners', 'basic', ARRAY['All free features', 'Basic courses access', 'Daily market analysis', 'Email support'], false, 'Get Started'),
    ('Pro', 7999, 'lifetime', 'For dedicated traders', 'pro', ARRAY['All Basic features', 'All courses access', 'Advanced strategies', 'Priority support', '1-on-1 mentoring session'], true, 'Go Pro'),
    ('Mentor', 19999, 'lifetime', 'Ultimate trading education', 'mentor', ARRAY['All Pro features', 'Direct mentor access', 'Trade alerts', 'Weekly calls', 'Custom strategy development'], false, 'Apply Now');

-- =============================================================================
-- SECTION 5: MARKET NEWS - SETUP & SEED DATA
-- =============================================================================

ALTER TABLE market_news ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE market_news ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE market_news ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE market_news ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

DELETE FROM market_news;

INSERT INTO market_news (title, summary, content, source, image_url, published_at, is_active) VALUES
    ('Nifty50 Hits New All-Time High', 'Indian benchmark index reaches record levels amid strong FII inflows', 'The Nifty50 index surged to new all-time highs today...', 'Quantum Bull Analysis', 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800', NOW(), true),
    ('RBI Keeps Rates Unchanged', 'Reserve Bank of India maintains repo rate at 6.5%', 'The RBI MPC meeting concluded with rates on hold...', 'Quantum Bull Analysis', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800', NOW() - INTERVAL '1 day', true),
    ('USD/INR Weakens Against Dollar', 'Rupee gains strength amid falling crude prices', 'The USD/INR pair declined as crude oil prices softened...', 'Quantum Bull Analysis', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800', NOW() - INTERVAL '2 days', true);

-- =============================================================================
-- SECTION 6: MARKET ANALYSIS - SETUP
-- =============================================================================

ALTER TABLE market_analysis ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES profiles(id);
ALTER TABLE market_analysis ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE market_analysis ADD COLUMN IF NOT EXISTS summary TEXT;

-- =============================================================================
-- SECTION 7: SUCCESS STORIES - SETUP & SEED DATA
-- =============================================================================

ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS before_story TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS after_story TEXT;
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS image_url TEXT;

DELETE FROM success_stories;

INSERT INTO success_stories (title, content, before_story, after_story, image_url, status) VALUES
    ('Rajesh Kumar - From Loss to Profit', 'From a losing trader to consistent profitability in 8 months. Lost 2 lakhs in 6 months trading without knowledge. Now making 15-20% monthly returns consistently.', 'Lost 2 lakhs in 6 months trading without knowledge', 'Now making 15-20% monthly returns consistently', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'approved'),
    ('Priya Sharma - Quit Job to Trade', 'Quit job to trade full-time after completing the Pro course. Was working a 9-5 job with no trading knowledge. Now earning 5x her previous salary from trading.', 'Was working a 9-5 job with no trading knowledge', 'Now earning 5x her previous salary from trading', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'approved'),
    ('Amit Patel - Scalper to Swing Trader', 'Transformed from scalping to swing trading. Blow up account 3 times due to overtrading. Following the price action system strictly - up 340% in 2024.', 'Blow up account 3 times due to overtrading', 'Following the price action system strictly - up 340% in 2024', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'approved');

-- =============================================================================
-- SECTION 8: TESTIMONIALS - SETUP & SEED DATA
-- =============================================================================

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;

DELETE FROM testimonials;

INSERT INTO testimonials (author_name, author_title, content, rating, status, featured) VALUES
    ('Vikram Singh', 'Day Trader', 'The best trading education platform in India. The price action course changed my trading completely.', 5, 'approved', true),
    ('Sneha Reddy', 'Swing Trader', 'Finally understood what real trading is about. The community support is amazing!', 5, 'approved', true),
    ('Ankit Mishra', 'Position Trader', 'Worth every rupee. The daily analysis alone is worth the subscription price.', 5, 'approved', false),
    ('Meera Iyer', 'Beginner', 'From complete beginner to confident trader in 3 months. Highly recommended!', 5, 'approved', true),
    ('Deepak Joshi', 'Full-Time Trader', 'The mentor support is exceptional. They really care about your success.', 4, 'approved', false);

-- =============================================================================
-- SECTION 9: LIVE SESSIONS - SETUP
-- =============================================================================

ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS is_recording BOOLEAN DEFAULT false;
ALTER TABLE live_sessions ADD COLUMN IF NOT EXISTS recording_url TEXT;

-- =============================================================================
-- SECTION 10: STORAGE BUCKETS - SETUP
-- =============================================================================

-- Videos bucket
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'videos') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('videos', 'videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']);
    END IF;
END $$;

-- Images bucket
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'images') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('images', 'images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    END IF;
END $$;

-- =============================================================================
-- SECTION 11: ROW LEVEL SECURITY POLICIES
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
DROP POLICY IF EXISTS "Users can vote" ON forum_votes;
CREATE POLICY "Users can vote" ON forum_votes FOR ALL USING (auth.uid() = user_id);

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
-- SECTION 12: STORAGE POLICIES
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
-- SECTION 13: INDEXES - PERFORMANCE OPTIMIZATION
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
-- SECTION 14: REALTIME SUBSCRIPTIONS
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE forum_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE forum_threads;

-- =============================================================================
-- COMPLETE!
-- =============================================================================
-- All tables, columns, policies, seed data, and configurations are now set up.
-- The forum, courses, videos, images, and all features should work properly.
-- =============================================================================
