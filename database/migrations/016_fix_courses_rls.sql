-- Phase 21: Fix Courses RLS for Admin
-- Fixes "new row violates row-level security policy for table courses"

-- 1. Fix COURSES Policies
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Public can view active courses" ON courses;

-- Public can view active courses (existing logic likely exists, but ensuring it)
CREATE POLICY "Public can view active courses" 
ON public.courses FOR SELECT 
USING (is_active = true OR is_admin());

-- Admins can do EVERYTHING (Insert, Update, Delete)
CREATE POLICY "Admins can manage courses" 
ON public.courses FOR ALL 
USING (is_admin());

-- 2. Fix MODULES Policies
ALTER TABLE IF EXISTS public.modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage modules" ON modules;
CREATE POLICY "Admins can manage modules" 
ON public.modules FOR ALL 
USING (is_admin());

-- Public read access for modules of active courses
DROP POLICY IF EXISTS "Public can view modules of active courses" ON modules;
CREATE POLICY "Public can view modules of active courses" 
ON public.modules FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.courses 
        WHERE courses.id = modules.course_id 
        AND (courses.is_active = true OR is_admin())
    )
);

-- 3. Fix LESSONS Policies
ALTER TABLE IF EXISTS public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
CREATE POLICY "Admins can manage lessons" 
ON public.lessons FOR ALL 
USING (is_admin());

-- Public read access for lessons of active courses
DROP POLICY IF EXISTS "Public can view lessons of active courses" ON lessons;
CREATE POLICY "Public can view lessons of active courses" 
ON public.lessons FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        JOIN public.modules m ON m.course_id = c.id
        WHERE m.id = lessons.module_id 
        AND (c.is_active = true OR is_admin())
    )
);
