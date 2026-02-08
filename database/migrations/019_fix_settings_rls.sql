-- Phase 24: Fix Settings RLS (Recursion Proof)
-- Fixes "Can't update settings" by using the safe is_admin() function

-- 1. Enable RLS (just in case)
ALTER TABLE IF EXISTS public.system_settings ENABLE ROW LEVEL SECURITY;

-- 2. Drop potentially recursive policies
DROP POLICY IF EXISTS "Admins manage settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON system_settings;

-- 3. Create Safe Admin Policy
CREATE POLICY "Admins can manage settings" 
ON public.system_settings FOR ALL 
USING (is_admin());

-- 4. Verify we don't have public access to secrets
-- (No public policy should exist for system_settings, or if it does, it should be filtered by key)
-- We will assume strict access for now. 
-- Only admins can read/write everything.
-- If the frontend needs 'site_name', it should probably use a public view or specific RPC, 
-- but normally Next.js fetches this server-side so it's fine with Service Role or Admin user.
