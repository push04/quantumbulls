-- =============================================
-- QUANTUM BULL - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- Extends auth.users with additional user data
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'medium', 'advanced')),
  payment_status TEXT DEFAULT 'none' CHECK (payment_status IN ('none', 'active', 'cancelled', 'expired')),
  active_session_id UUID,
  session_updated_at TIMESTAMPTZ,
  enrolled_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- =============================================
-- TRIGGER: Auto-create profile on user signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ENABLE REALTIME for session tracking
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX idx_profiles_active_session ON public.profiles(active_session_id);
CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
