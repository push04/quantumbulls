-- Phase 22: Create Modules and Fix RLS
-- Fixes "relation modules does not exist" and enables full course creation

-- 1. Create Modules Table (it was missing!)
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add module_id to lessons if it's missing (to link lessons to modules)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'module_id') THEN
        ALTER TABLE public.lessons ADD COLUMN module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Enable RLS for everything
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- 4. Clean up old policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage modules" ON modules;
DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
DROP POLICY IF EXISTS "Public can view active courses" ON courses;

-- 5. Create new, comprehensive policies

-- COURSES
CREATE POLICY "Public can view active courses" ON public.courses FOR SELECT 
USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL 
USING (is_admin());

-- MODULES
CREATE POLICY "Public can view modules of active courses" ON public.modules FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = module_id AND (is_active = true OR is_admin()))
);

CREATE POLICY "Admins can manage modules" ON public.modules FOR ALL 
USING (is_admin());

-- LESSONS
CREATE POLICY "Public can view lessons of active courses" ON public.lessons FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.modules m
        JOIN public.courses c ON c.id = m.course_id
        WHERE m.id = module_id AND (c.is_active = true OR is_admin())
    )
);

CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL 
USING (is_admin());
