-- Phase 10F: Database Indexes for Performance
-- Run this migration to optimize query performance at scale

-- Indexes on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(order_index);

CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video_id ON video_progress(video_id);
-- Fixed: video_progress uses last_watched_at, not updated_at
CREATE INDEX IF NOT EXISTS idx_video_progress_last_watched_at ON video_progress(last_watched_at);

-- Profiles indexes
-- Fixed: profiles usually has created_at
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
-- Fixed: profiles uses 'role', not 'subscription_tier'
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
-- Note: referral_code might not exist on profiles yet if not added in previous migrations. 
-- Commenting out to be safe unless confirmed.
-- CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- Analytics event indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_video_progress_user_video 
    ON video_progress(user_id, video_id);

CREATE INDEX IF NOT EXISTS idx_lessons_course_order 
    ON lessons(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_analytics_user_date 
    ON analytics_events(user_id, created_at);

-- Subscription events for revenue reports
CREATE INDEX IF NOT EXISTS idx_subscription_events_type 
    ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created 
    ON subscription_events(created_at);

-- Course search optimization
CREATE INDEX IF NOT EXISTS idx_courses_title_gin 
    ON courses USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_courses_is_active 
    ON courses(is_active) WHERE is_active = true;

-- Login sessions for security (Fixed table name: user_sessions)
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON user_sessions(last_active);

-- Partial indexes for active data
-- Fixed: using role instead of subscription_tier
CREATE INDEX IF NOT EXISTS idx_active_subscriptions 
    ON profiles(id) 
    WHERE role != 'free';

CREATE INDEX IF NOT EXISTS idx_uncompleted_progress 
    ON video_progress(user_id, video_id) 
    WHERE completed = false;

-- Analyze tables after creating indexes
ANALYZE lessons;
ANALYZE video_progress;
ANALYZE profiles;
ANALYZE analytics_events;
ANALYZE courses;
ANALYZE user_sessions;
