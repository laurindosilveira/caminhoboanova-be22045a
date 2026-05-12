-- First, clear all existing policies on prayer_requests to ensure a clean state
DROP POLICY IF EXISTS "Leaders can view all prayer requests in their area" ON public.prayer_requests;
DROP POLICY IF EXISTS "Prayer requests visibility" ON public.prayer_requests;
DROP POLICY IF EXISTS "Students can view public/anonymous requests in their turma" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can create their own prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can update their own prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can view their own prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users/Leaders can delete requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users/Leaders can update requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can view prayer requests from their community" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can insert prayer requests in their community" ON public.prayer_requests;
DROP POLICY IF EXISTS "Admins can delete prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can delete their own prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Liders can delete prayer requests in their area" ON public.prayer_requests;
DROP POLICY IF EXISTS "Users can update amen count" ON public.prayer_requests;

-- Ensure RLS is enabled
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- 1. SELECT POLICY (The most important one)
-- A user can see a prayer request if:
-- a) They are the owner
-- b) They are an admin or leader
-- c) The request is public/anonymous AND belongs to their area, community, or turma
CREATE POLICY "prayer_requests_select_all"
ON public.prayer_requests FOR SELECT
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND (
            p.role IN ('admin', 'lider') OR
            (
                visibility IN ('public', 'anonymous') AND
                (
                    p.community::text = prayer_requests.community OR
                    p.area::text = prayer_requests.area OR
                    p.turma_id = prayer_requests.turma_id
                )
            )
        )
    )
);

-- 2. INSERT POLICY
CREATE POLICY "prayer_requests_insert_own"
ON public.prayer_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE POLICY (Owner or Leaders)
CREATE POLICY "prayer_requests_update_own_or_leader"
ON public.prayer_requests FOR UPDATE
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.role IN ('admin', 'lider')
    )
);

-- 4. DELETE POLICY (Owner or Leaders)
CREATE POLICY "prayer_requests_delete_own_or_leader"
ON public.prayer_requests FOR DELETE
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.role IN ('admin', 'lider')
    )
);
