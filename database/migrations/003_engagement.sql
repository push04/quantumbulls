-- Phase 8: Engagement & Retention Systems
-- Run this migration in Supabase SQL Editor

-- =====================================================
-- XP & LEVELING SYSTEM
-- =====================================================

-- XP events log
CREATE TABLE IF NOT EXISTS user_xp_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'video_watch', 'course_complete', 'daily_login', 'streak_bonus', 'achievement'
    xp_earned INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User total XP cache (for performance)
CREATE TABLE IF NOT EXISTS user_levels (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    current_level TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced, expert
    level_updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- STREAK SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS user_streaks (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_started_at DATE,
    streak_frozen_until DATE, -- allow "streak freeze" feature
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_date DATE NOT NULL,
    challenge_type TEXT NOT NULL, -- 'watch_video', 'complete_lesson', 'login'
    target_id UUID, -- optional: specific lesson/course
    target_title TEXT, -- display title
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, challenge_date)
);

-- =====================================================
-- EMAIL AUTOMATION
-- =====================================================

CREATE TABLE IF NOT EXISTS email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL,
    template_data JSONB DEFAULT '{}',
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending', -- pending, sent, failed, cancelled
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_engagement (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    onboarding_step INTEGER DEFAULT 1,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    last_email_sent_at TIMESTAMPTZ,
    email_preferences JSONB DEFAULT '{"marketing": true, "digest": true, "reminders": true}',
    push_enabled BOOLEAN DEFAULT FALSE,
    preferred_notification_time TIME DEFAULT '09:00',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- LEADERBOARD
-- =====================================================

CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL, -- 'weekly', 'monthly', 'all_time'
    period_start DATE NOT NULL,
    total_xp INTEGER DEFAULT 0,
    rank INTEGER,
    opt_out BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, period_type, period_start)
);

-- =====================================================
-- CHURN PREVENTION
-- =====================================================

CREATE TABLE IF NOT EXISTS exit_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cancellation_date TIMESTAMPTZ DEFAULT now(),
    reason TEXT, -- 'too_expensive', 'not_enough_content', 'found_alternative', 'other'
    feedback TEXT,
    would_return BOOLEAN,
    win_back_eligible BOOLEAN DEFAULT TRUE,
    win_back_sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_risk_scores (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    risk_score INTEGER DEFAULT 0, -- 0-100
    risk_factors JSONB DEFAULT '[]',
    last_calculated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TESTIMONIALS & COMMUNITY
-- =====================================================

CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_title TEXT, -- e.g., "Day Trader"
    avatar_url TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    approved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS success_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    before_story TEXT,
    after_story TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'pending',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE user_xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

-- User can read own data
CREATE POLICY "Users can read own XP" ON user_xp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own level" ON user_levels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own streak" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own challenges" ON daily_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own engagement" ON user_engagement FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own engagement" ON user_engagement FOR UPDATE USING (auth.uid() = user_id);

-- Leaderboard is public for opted-in users
CREATE POLICY "Public leaderboard" ON leaderboard_entries FOR SELECT USING (opt_out = FALSE);
CREATE POLICY "Users manage own leaderboard" ON leaderboard_entries FOR ALL USING (auth.uid() = user_id);

-- Testimonials
CREATE POLICY "Public approved testimonials" ON testimonials FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can create testimonials" ON testimonials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own testimonials" ON testimonials FOR SELECT USING (auth.uid() = user_id);

-- Success stories
CREATE POLICY "Public approved stories" ON success_stories FOR SELECT USING (status = 'approved');

-- Exit surveys
CREATE POLICY "Users can create exit survey" ON exit_surveys FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Calculate user level from XP
CREATE OR REPLACE FUNCTION get_level_from_xp(xp INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF xp >= 1000 THEN RETURN 'expert';
    ELSIF xp >= 500 THEN RETURN 'advanced';
    ELSIF xp >= 100 THEN RETURN 'intermediate';
    ELSE RETURN 'beginner';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Get XP thresholds for levels
CREATE OR REPLACE FUNCTION get_level_thresholds()
RETURNS TABLE(level TEXT, min_xp INTEGER, max_xp INTEGER) AS $$
BEGIN
    RETURN QUERY SELECT 'beginner'::TEXT, 0, 99
    UNION ALL SELECT 'intermediate'::TEXT, 100, 499
    UNION ALL SELECT 'advanced'::TEXT, 500, 999
    UNION ALL SELECT 'expert'::TEXT, 1000, 999999;
END;
$$ LANGUAGE plpgsql;

-- Update user total XP (trigger function)
CREATE OR REPLACE FUNCTION update_user_total_xp()
RETURNS TRIGGER AS $$
DECLARE
    new_total INTEGER;
    new_level TEXT;
BEGIN
    -- Calculate new total
    SELECT COALESCE(SUM(xp_earned), 0) INTO new_total
    FROM user_xp_events
    WHERE user_id = NEW.user_id;
    
    new_level := get_level_from_xp(new_total);
    
    -- Upsert user level
    INSERT INTO user_levels (user_id, total_xp, current_level, level_updated_at)
    VALUES (NEW.user_id, new_total, new_level, now())
    ON CONFLICT (user_id) DO UPDATE SET
        total_xp = new_total,
        current_level = new_level,
        level_updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_xp ON user_xp_events;
CREATE TRIGGER trigger_update_xp
AFTER INSERT ON user_xp_events
FOR EACH ROW EXECUTE FUNCTION update_user_total_xp();

-- Check and update streak
CREATE OR REPLACE FUNCTION check_and_update_streak(p_user_id UUID)
RETURNS TABLE(current_streak INTEGER, streak_broken BOOLEAN, streak_continued BOOLEAN) AS $$
DECLARE
    last_date DATE;
    today DATE := CURRENT_DATE;
    streak_val INTEGER;
    was_broken BOOLEAN := FALSE;
    was_continued BOOLEAN := FALSE;
    longest INTEGER;
BEGIN
    -- Get current streak data
    SELECT us.current_streak, us.longest_streak, us.last_activity_date 
    INTO streak_val, longest, last_date
    FROM user_streaks us
    WHERE us.user_id = p_user_id;
    
    IF NOT FOUND THEN
        -- First time user
        INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, streak_started_at)
        VALUES (p_user_id, 1, 1, today, today);
        RETURN QUERY SELECT 1, FALSE, TRUE;
        RETURN;
    END IF;
    
    IF last_date = today THEN
        -- Already logged in today
        RETURN QUERY SELECT streak_val, FALSE, FALSE;
        RETURN;
    ELSIF last_date = today - 1 THEN
        -- Continuing streak
        streak_val := streak_val + 1;
        was_continued := TRUE;
    ELSE
        -- Streak broken
        was_broken := TRUE;
        streak_val := 1;
    END IF;
    
    -- Update longest if needed
    IF streak_val > longest THEN
        longest := streak_val;
    END IF;
    
    -- Update streak
    UPDATE user_streaks SET
        current_streak = streak_val,
        longest_streak = longest,
        last_activity_date = today,
        streak_started_at = CASE WHEN was_broken THEN today ELSE streak_started_at END,
        updated_at = now()
    WHERE user_streaks.user_id = p_user_id;
    
    RETURN QUERY SELECT streak_val, was_broken, was_continued;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_xp_events_user ON user_xp_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_user_date ON daily_challenges(user_id, challenge_date);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard_entries(period_type, period_start, rank);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status, featured);
