-- Phase 18: Admin Permissions & RLS Fixes
-- Run this to fix "No users found" and enable Admin capabilities

-- =====================================================
-- PROFILES RLS
-- =====================================================

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (safely)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;

-- 1. Public Read (needed for social features, leaderboards, etc.)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- 2. Users can insert their own profile (during signup triggers)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Admins have FULL access (CRUD)
CREATE POLICY "Admins have full access to profiles" 
ON public.profiles FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
    OR 
    auth.uid() = id -- Admin can always access their own row via this too
);

-- =====================================================
-- TESTIMONIALS RLS
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage all testimonials" ON testimonials;

CREATE POLICY "Admins can manage all testimonials" 
ON public.testimonials FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
);

-- =====================================================
-- SUCCESS STORIES RLS
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage all success stories" ON success_stories;

CREATE POLICY "Admins can manage all success stories" 
ON public.success_stories FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
);

-- =====================================================
-- MARKET NEWS RLS
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage market news" ON market_news;
DROP POLICY IF EXISTS "Public can read market news" ON market_news;

-- Public can read
CREATE POLICY "Public can read market news" 
ON public.market_news FOR SELECT 
USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage market news" 
ON public.market_news FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
);
