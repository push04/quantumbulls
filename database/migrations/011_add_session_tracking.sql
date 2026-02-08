-- Add Session Tracking columns to Profiles table
-- Fixes "Failed to update session" error in SignInForm

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_session_id UUID,
ADD COLUMN IF NOT EXISTS session_updated_at TIMESTAMPTZ DEFAULT now();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_active_session ON public.profiles(active_session_id);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name IN ('active_session_id', 'session_updated_at');
