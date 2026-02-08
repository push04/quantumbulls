-- Phase 7: Content Discovery & Learning Paths Schema
-- Run this in your Supabase SQL Editor

-- ===========================================
-- Courses Table (if not exists)
-- ===========================================
DROP TABLE IF EXISTS courses CASCADE;
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  tier TEXT CHECK (tier IN ('free', 'basic', 'pro', 'mentor')) DEFAULT 'free',
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  topic TEXT,
  estimated_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================
-- Lessons Table (if not exists)
-- ===========================================
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, slug)
);

CREATE INDEX idx_lessons_course ON lessons(course_id);

-- ===========================================
-- Learning Paths
-- ===========================================
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours INTEGER,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lessons within a learning path (ordered)
CREATE TABLE IF NOT EXISTS learning_path_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  UNIQUE(path_id, lesson_id)
);

CREATE INDEX idx_path_lessons_path ON learning_path_lessons(path_id);

-- User path enrollments
CREATE TABLE IF NOT EXISTS user_path_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  certificate_url TEXT,
  UNIQUE(user_id, path_id)
);

CREATE INDEX idx_path_enrollments_user ON user_path_enrollments(user_id);

-- ===========================================
-- Bookmarks & Watch Later
-- ===========================================
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('favorite', 'watch_later')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id, type)
);

CREATE INDEX idx_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX idx_bookmarks_type ON user_bookmarks(user_id, type);

-- ===========================================
-- Timestamped Notes
-- ===========================================
CREATE TABLE IF NOT EXISTS user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notes_user ON user_notes(user_id);
CREATE INDEX idx_notes_lesson ON user_notes(user_id, lesson_id);

-- ===========================================
-- User Achievements
-- ===========================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_type)
);

CREATE INDEX idx_achievements_user ON user_achievements(user_id);

-- ===========================================
-- Daily Activity Tracking
-- ===========================================
CREATE TABLE IF NOT EXISTS user_daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  minutes_watched INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_activity_user ON user_daily_activity(user_id);
CREATE INDEX idx_daily_activity_date ON user_daily_activity(user_id, date);

-- ===========================================
-- Row Level Security
-- ===========================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_path_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_activity ENABLE ROW LEVEL SECURITY;

-- Public read for courses, lessons, paths
CREATE POLICY "Public can view courses" ON courses FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Public can view paths" ON learning_paths FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view path lessons" ON learning_path_lessons FOR SELECT USING (true);

-- User-specific data policies
CREATE POLICY "Users can manage own enrollments" ON user_path_enrollments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks" ON user_bookmarks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own notes" ON user_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage achievements" ON user_achievements
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can manage own activity" ON user_daily_activity
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- Helper Functions
-- ===========================================

-- Get user's course progress percentage
CREATE OR REPLACE FUNCTION get_course_progress(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_lessons FROM lessons WHERE course_id = p_course_id;
  
  SELECT COUNT(*) INTO completed_lessons 
  FROM video_progress vp
  JOIN lessons l ON l.id::text = vp.video_id
  WHERE vp.user_id = p_user_id 
    AND l.course_id = p_course_id 
    AND vp.completed = true;
  
  IF total_lessons = 0 THEN RETURN 0; END IF;
  RETURN (completed_lessons * 100 / total_lessons);
END;
$$ LANGUAGE plpgsql;

-- Get remaining time for a course
CREATE OR REPLACE FUNCTION get_course_remaining_time(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
  remaining_seconds INTEGER;
BEGIN
  SELECT COALESCE(SUM(l.duration_seconds), 0) INTO remaining_seconds
  FROM lessons l
  LEFT JOIN video_progress vp ON l.id::text = vp.video_id AND vp.user_id = p_user_id
  WHERE l.course_id = p_course_id
    AND (vp.completed IS NULL OR vp.completed = false);
  
  RETURN remaining_seconds;
END;
$$ LANGUAGE plpgsql;
