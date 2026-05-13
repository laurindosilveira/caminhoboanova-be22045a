-- Add church_id to core content tables
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id);
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id);
ALTER TABLE public.lesson_content ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id);
ALTER TABLE public.devotional_content ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id);
ALTER TABLE public.custom_event_types ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id);

-- Add church_id to user data tables for better isolation
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id);
ALTER TABLE public.devotional_progress ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id);
ALTER TABLE public.lesson_responses ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id);
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id);
ALTER TABLE public.worship_attendance ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id);
ALTER TABLE public.achievement_unlocks ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id);

-- Fill existing data with the default church ID
DO $$
DECLARE
  default_church_id UUID;
BEGIN
  SELECT id INTO default_church_id FROM public.churches LIMIT 1;
  
  IF default_church_id IS NOT NULL THEN
    UPDATE public.activities SET church_id = default_church_id WHERE church_id IS NULL;
    UPDATE public.events SET church_id = default_church_id WHERE church_id IS NULL;
    UPDATE public.lessons SET church_id = default_church_id WHERE church_id IS NULL;
    UPDATE public.lesson_content SET church_id = default_church_id WHERE church_id IS NULL;
    UPDATE public.devotional_content SET church_id = default_church_id WHERE church_id IS NULL;
    UPDATE public.custom_event_types SET church_id = default_church_id WHERE church_id IS NULL;
    UPDATE public.user_progress SET church_id = default_church_id WHERE church_id IS NULL;
    UPDATE public.devotional_progress SET church_id = default_church_id WHERE church_id IS NULL;
    UPDATE public.lesson_responses SET church_id = default_church_id WHERE church_id IS NULL;
    UPDATE public.attendance SET church_id = default_church_id WHERE church_id IS NULL;
    UPDATE public.worship_attendance SET church_id = default_church_id WHERE church_id IS NULL;
    UPDATE public.achievement_unlocks SET church_id = default_church_id WHERE church_id IS NULL;
  END IF;
END $$;

-- RLS Policies for Multi-Tenancy

-- 1. Helpers for RLS
CREATE OR REPLACE FUNCTION public.get_auth_church_id()
RETURNS UUID AS $$
  SELECT church_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND (role = 'super_admin' OR (role = 'admin' AND church_id IS NULL))
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 2. Enable RLS on all tables
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotional_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 3. Unified Policies for Content (Read: Own Church + Official, Write: Own Church Admins)

-- Courses
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Courses are viewable by own church or official" ON public.courses;
CREATE POLICY "Courses are viewable by own church or official" 
ON public.courses FOR SELECT 
USING (church_id IS NULL OR church_id = public.get_auth_church_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Admins can manage courses for their church" ON public.courses;
CREATE POLICY "Admins can manage courses for their church" 
ON public.courses FOR ALL
USING (public.is_super_admin() OR (church_id = public.get_auth_church_id() AND (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('admin', 'lider')));

-- Lessons
DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON public.lessons;
DROP POLICY IF EXISTS "Lessons are viewable by own church or official" ON public.lessons;
CREATE POLICY "Lessons are viewable by own church or official" 
ON public.lessons FOR SELECT 
USING (church_id IS NULL OR church_id = public.get_auth_church_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Admins can manage lessons for their church" ON public.lessons;
CREATE POLICY "Admins can manage lessons for their church" 
ON public.lessons FOR ALL
USING (public.is_super_admin() OR (church_id = public.get_auth_church_id() AND (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('admin', 'lider')));

-- Events (Agenda)
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Events are viewable by own church" ON public.events;
CREATE POLICY "Events are viewable by own church" 
ON public.events FOR SELECT 
USING (church_id = public.get_auth_church_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Admins can manage events for their church" ON public.events;
CREATE POLICY "Admins can manage events for their church" 
ON public.events FOR ALL
USING (public.is_super_admin() OR (church_id = public.get_auth_church_id() AND (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('admin', 'lider')));

-- Activities
DROP POLICY IF EXISTS "Activities are viewable by everyone" ON public.activities;
DROP POLICY IF EXISTS "Activities are viewable by own church or official" ON public.activities;
CREATE POLICY "Activities are viewable by own church or official" 
ON public.activities FOR SELECT 
USING (church_id IS NULL OR church_id = public.get_auth_church_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Admins can manage activities for their church" ON public.activities;
CREATE POLICY "Admins can manage activities for their church" 
ON public.activities FOR ALL
USING (public.is_super_admin() OR (church_id = public.get_auth_church_id() AND (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('admin', 'lider')));

-- Lesson Content
DROP POLICY IF EXISTS "Lesson content is viewable by everyone" ON public.lesson_content;
DROP POLICY IF EXISTS "Lesson content is viewable by own church or official" ON public.lesson_content;
CREATE POLICY "Lesson content is viewable by own church or official" 
ON public.lesson_content FOR SELECT 
USING (church_id IS NULL OR church_id = public.get_auth_church_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Admins can manage lesson content for their church" ON public.lesson_content;
CREATE POLICY "Admins can manage lesson content for their church" 
ON public.lesson_content FOR ALL
USING (public.is_super_admin() OR (church_id = public.get_auth_church_id() AND (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('admin', 'lider')));

-- Devotional Content
DROP POLICY IF EXISTS "Devotional content is viewable by everyone" ON public.devotional_content;
DROP POLICY IF EXISTS "Devotional content is viewable by own church or official" ON public.devotional_content;
CREATE POLICY "Devotional content is viewable by own church or official" 
ON public.devotional_content FOR SELECT 
USING (church_id IS NULL OR church_id = public.get_auth_church_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Admins can manage devotional content for their church" ON public.devotional_content;
CREATE POLICY "Admins can manage devotional content for their church" 
ON public.devotional_content FOR ALL
USING (public.is_super_admin() OR (church_id = public.get_auth_church_id() AND (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('admin', 'lider')));
