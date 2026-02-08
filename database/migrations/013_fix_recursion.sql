-- Phase 18b: Fix Infinite Recursion in RLS
-- Fixes "Session validation error" and Dashboard access issues

-- 1. Create a secure function to check admin status without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- specific lookup by ID, should be fast. 
  -- SECURITY DEFINER means this runs with owner permissions (bypassing RLS)
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix PROFILES Policy
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;

CREATE POLICY "Admins have full access to profiles" 
ON public.profiles FOR ALL 
USING (
    is_admin() OR auth.uid() = id
);

-- 3. Fix OTHER Admin Policies to be cleaner (and safe)
DROP POLICY IF EXISTS "Admins can manage all testimonials" ON testimonials;
CREATE POLICY "Admins can manage all testimonials" 
ON public.testimonials FOR ALL 
USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage market news" ON market_news;
CREATE POLICY "Admins can manage market news" 
ON public.market_news FOR ALL 
USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage all success stories" ON success_stories;
CREATE POLICY "Admins can manage all success stories" 
ON public.success_stories FOR ALL 
USING (is_admin());
