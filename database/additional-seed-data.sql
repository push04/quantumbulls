-- Additional seed data for Quantum Bull

-- Create missing tables

-- Session Registrations table
CREATE TABLE IF NOT EXISTS session_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES live_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    attended BOOLEAN DEFAULT false,
    UNIQUE(session_id, user_id)
);

-- User Bans table
CREATE TABLE IF NOT EXISTS user_bans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    banned_until TIMESTAMPTZ,
    is_permanent BOOLEAN DEFAULT false,
    issued_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Strikes table
CREATE TABLE IF NOT EXISTS user_strikes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    issued_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Votes table
CREATE TABLE IF NOT EXISTS forum_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    vote_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- Add missing columns to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_free_preview BOOLEAN DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS forum_post_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_trusted_member BOOLEAN DEFAULT false;

-- Add more courses
INSERT INTO courses (title, slug, description, difficulty, tier, is_active, order_index, thumbnail_url)
VALUES 
('Technical Analysis Mastery', 'technical-analysis-mastery', 'Master technical analysis indicators and chart patterns', 'intermediate', 'pro', true, 2, 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'),
('Options Trading Strategies', 'options-trading-strategies', 'Learn profitable options trading strategies', 'advanced', 'pro', true, 3, 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800'),
('Risk Management Fundamentals', 'risk-management-fundamentals', 'Protect your capital with proven risk management', 'beginner', 'free', true, 4, 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800')
ON CONFLICT DO NOTHING;

-- Add more success stories
INSERT INTO success_stories (title, content, before_story, after_story, image_url, status)
VALUES 
('Rahul Sharma - Pro Trader', 'After completing the Technical Analysis course, I doubled my portfolio in 6 months. The community support is amazing!', 'Started with no trading experience', 'Doubled portfolio in 6 months', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'approved'),
('Priya Patel - Full-Time Trader', 'Quantum Bull courses gave me the confidence to trade full-time. Now I earn more than my previous job.', 'Working 9-5 job, no trading knowledge', 'Now earning 5x previous salary from trading', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'approved'),
('Amit Kumar - Swing Trader', 'The options strategies course is worth every penny. Learned to hedge my positions effectively.', 'Struggled with risk management', 'Successfully hedging positions consistently', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'approved')
ON CONFLICT DO NOTHING;

-- Add more testimonials
INSERT INTO testimonials (author_name, author_title, content, rating, status)
VALUES 
('Vikram Singh', 'Day Trader', 'Best trading education platform in India. The live sessions are incredibly helpful.', 5, 'approved'),
('Sneha Reddy', 'Beginner', 'Started from zero knowledge. Now I understand markets better than ever. Highly recommended!', 5, 'approved'),
('Raj Malhotra', 'Investor', 'The technical analysis course transformed my investing approach. Great content quality.', 4, 'approved')
ON CONFLICT DO NOTHING;

-- Add system settings
INSERT INTO system_settings (key, value)
VALUES 
('site_tagline', 'Master the Markets with Quantum Bull'),
('facebook_url', 'https://facebook.com/quantumbull'),
('twitter_url', 'https://twitter.com/quantumbull'),
('youtube_url', 'https://youtube.com/quantumbull'),
('telegram_url', 'https://telegram.me/quantumbull'),
('support_phone', '+91 98765 43210')
ON CONFLICT (key) DO NOTHING;
