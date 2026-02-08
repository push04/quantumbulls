-- Phase 16b: Fix Course Tiers validation
-- Run this in Supabase SQL Editor to support 'mentor' tier

-- 1. Drop the old constraint that only allowed (free, basic, medium, pro)
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_tier_check;

-- 2. Add the new constraint including 'mentor'
ALTER TABLE courses 
ADD CONSTRAINT courses_tier_check 
CHECK (tier IN ('free', 'basic', 'pro', 'mentor'));

-- 3. Update any existing 'medium' courses to 'pro' if necessary (cleanup old data)
UPDATE courses SET tier = 'pro' WHERE tier = 'medium';
