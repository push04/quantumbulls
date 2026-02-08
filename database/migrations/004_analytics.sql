-- Phase 9: Analytics & Business Intelligence
-- Run this migration in Supabase SQL Editor

-- =====================================================
-- ANALYTICS EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    event_type TEXT NOT NULL, -- 'page_view', 'video_start', 'video_complete', 'signup', 'upgrade', 'cancel'
    event_data JSONB DEFAULT '{}',
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    browser TEXT,
    os TEXT,
    country TEXT,
    city TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily aggregates for faster queries
CREATE TABLE IF NOT EXISTS analytics_daily (
    date DATE PRIMARY KEY,
    signups INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    video_views INTEGER DEFAULT 0,
    video_completions INTEGER DEFAULT 0,
    upgrades INTEGER DEFAULT 0,
    cancellations INTEGER DEFAULT 0,
    revenue_cents INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- A/B TESTING
-- =====================================================

CREATE TABLE IF NOT EXISTS ab_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    variants JSONB NOT NULL, -- [{id: 'control', name: 'Original'}, {id: 'variant_b', name: 'New Design'}]
    traffic_split JSONB DEFAULT '{"control": 50, "variant_b": 50}',
    goal_event TEXT NOT NULL, -- 'signup', 'upgrade', 'video_complete'
    status TEXT DEFAULT 'draft', -- 'draft', 'running', 'paused', 'completed'
    winner_variant TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ab_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    experiment_id UUID REFERENCES ab_experiments(id) ON DELETE CASCADE,
    variant_id TEXT NOT NULL,
    converted BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, experiment_id)
);

-- =====================================================
-- ADMIN ALERTS
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL, -- 'spike_signups', 'spike_cancellations', 'payment_failures', 'suspicious_activity'
    severity TEXT DEFAULT 'info', -- 'info', 'warning', 'critical'
    title TEXT NOT NULL,
    message TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Alert thresholds configuration
CREATE TABLE IF NOT EXISTS alert_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT UNIQUE NOT NULL,
    threshold_value INTEGER NOT NULL,
    time_window_hours INTEGER DEFAULT 24,
    is_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default thresholds
INSERT INTO alert_thresholds (alert_type, threshold_value, time_window_hours) VALUES
    ('spike_signups', 100, 24),
    ('spike_cancellations', 10, 24),
    ('payment_failures', 5, 1),
    ('suspicious_activity', 3, 1)
ON CONFLICT (alert_type) DO NOTHING;

-- =====================================================
-- SUBSCRIPTION HISTORY (for revenue tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'created', 'upgraded', 'downgraded', 'cancelled', 'renewed'
    from_tier TEXT,
    to_tier TEXT,
    amount_cents INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert own events" ON analytics_events 
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view their A/B assignments
CREATE POLICY "Users view own assignments" ON ab_assignments 
    FOR SELECT USING (auth.uid() = user_id);

-- Admin-only policies would be handled by service role

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_date ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_experiment ON ab_assignments(experiment_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user ON subscription_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_alerts_unread ON admin_alerts(is_read, created_at DESC);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get daily aggregate for a date
CREATE OR REPLACE FUNCTION get_or_create_daily_aggregate(target_date DATE)
RETURNS UUID AS $$
BEGIN
    INSERT INTO analytics_daily (date)
    VALUES (target_date)
    ON CONFLICT (date) DO NOTHING;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Increment daily counter
CREATE OR REPLACE FUNCTION increment_daily_counter(
    target_date DATE,
    counter_name TEXT,
    increment_by INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    PERFORM get_or_create_daily_aggregate(target_date);
    
    EXECUTE format(
        'UPDATE analytics_daily SET %I = %I + $1, updated_at = now() WHERE date = $2',
        counter_name, counter_name
    ) USING increment_by, target_date;
END;
$$ LANGUAGE plpgsql;
