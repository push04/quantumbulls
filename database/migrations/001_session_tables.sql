-- Phase 6A: Session Management Schema
-- Run this in your Supabase SQL Editor

-- ===========================================
-- User Sessions Table
-- ===========================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  device_name TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser TEXT,
  os TEXT,
  ip_address INET,
  location_country TEXT,
  location_city TEXT,
  is_current BOOLEAN DEFAULT false,
  last_active TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_last_active ON user_sessions(last_active);

-- ===========================================
-- Suspicious Activity Log
-- ===========================================
CREATE TABLE IF NOT EXISTS suspicious_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'rapid_requests',
    'seek_skip', 
    'ip_mismatch',
    'multi_device_attempt',
    'suspicious_location'
  )),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  details JSONB DEFAULT '{}',
  reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_suspicious_activity_user ON suspicious_activity(user_id);
CREATE INDEX idx_suspicious_activity_reviewed ON suspicious_activity(reviewed);
CREATE INDEX idx_suspicious_activity_created ON suspicious_activity(created_at DESC);

-- ===========================================
-- Video Progress Tracking
-- ===========================================
CREATE TABLE IF NOT EXISTS video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_video_progress_user ON video_progress(user_id);
CREATE INDEX idx_video_progress_video ON video_progress(video_id);

-- ===========================================
-- Row Level Security Policies
-- ===========================================

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- User Sessions: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service can manage sessions" ON user_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Suspicious Activity: Only admins can view (handle in application layer)
CREATE POLICY "Service can manage suspicious activity" ON suspicious_activity
  FOR ALL USING (true) WITH CHECK (true);

-- Video Progress: Users can only manage their own progress
CREATE POLICY "Users can manage own progress" ON video_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- Helper Functions
-- ===========================================

-- Function to clean old sessions (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions 
  WHERE last_active < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update session last_active
CREATE OR REPLACE FUNCTION touch_session(p_session_token UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_sessions 
  SET last_active = NOW() 
  WHERE session_token = p_session_token;
END;
$$ LANGUAGE plpgsql;
