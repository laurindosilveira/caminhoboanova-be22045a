-- 1. Ensure all profiles have the default church_id if missing
UPDATE public.profiles 
SET church_id = (SELECT id FROM public.churches WHERE slug = 'boa-nova' LIMIT 1)
WHERE church_id IS NULL;

-- 2. Fix profiles policy to avoid recursion
-- Instead of selecting from the same table in USING, we use a more efficient check
DROP POLICY IF EXISTS "Profiles are viewable by same church members" ON public.profiles;
CREATE POLICY "Profiles are viewable by same church members" 
ON public.profiles FOR SELECT 
USING (
    church_id = (SELECT p.church_id FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 3. Fix communities policy
DROP POLICY IF EXISTS "Communities are viewable by church" ON public.communities;
CREATE POLICY "Communities are viewable by church" 
ON public.communities FOR SELECT 
USING (
    church_id = (SELECT p.church_id FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 4. Fix areas policy
DROP POLICY IF EXISTS "Areas are viewable by church" ON public.areas;
CREATE POLICY "Areas are viewable by church" 
ON public.areas FOR SELECT 
USING (
    church_id = (SELECT p.church_id FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 5. Helper function for RLS to make it cleaner and faster
CREATE OR REPLACE FUNCTION public.get_my_church_id()
RETURNS UUID AS $$
    SELECT church_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Re-apply policies using the helper function
DROP POLICY IF EXISTS "Profiles are viewable by same church members" ON public.profiles;
CREATE POLICY "Profiles are viewable by same church members" 
ON public.profiles FOR SELECT 
USING (church_id = get_my_church_id());

DROP POLICY IF EXISTS "Communities are viewable by church" ON public.communities;
CREATE POLICY "Communities are viewable by church" 
ON public.communities FOR SELECT 
USING (church_id = get_my_church_id());

DROP POLICY IF EXISTS "Areas are viewable by church" ON public.areas;
CREATE POLICY "Areas are viewable by church" 
ON public.areas FOR SELECT 
USING (church_id = get_my_church_id());

-- 6. Ensure related tables allow selection if the profile church matches
ALTER TABLE public.lesson_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own lesson responses" ON public.lesson_responses;
CREATE POLICY "Users can view their own lesson responses" 
ON public.lesson_responses FOR SELECT 
USING (auth.uid() = user_id);

ALTER TABLE public.devotional_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own devotional progress" ON public.devotional_progress;
CREATE POLICY "Users can view their own devotional progress" 
ON public.devotional_progress FOR SELECT 
USING (auth.uid() = user_id);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own attendance" ON public.attendance;
CREATE POLICY "Users can view their own attendance" 
ON public.attendance FOR SELECT 
USING (auth.uid() = user_id);

ALTER TABLE public.worship_attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own worship attendance" ON public.worship_attendance;
CREATE POLICY "Users can view their own worship attendance" 
ON public.worship_attendance FOR SELECT 
USING (auth.uid() = user_id);