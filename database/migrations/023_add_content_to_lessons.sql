-- Phase 28: Add Content Column to Lessons
-- Fixes "Could not find the 'content' column" error when creating lessons

-- Add the content column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'content') THEN
        ALTER TABLE lessons ADD COLUMN content TEXT;
    END IF;
END $$;

-- Refresh permissions just in case
GRANT ALL ON lessons TO authenticated;
GRANT ALL ON lessons TO service_role;
