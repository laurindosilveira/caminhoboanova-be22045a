-- 0. Drop function to avoid type mismatch
DROP FUNCTION IF EXISTS public.get_church_user_stats(UUID);

-- 1. Add is_active column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Create Profession of Faith history table
CREATE TABLE IF NOT EXISTS public.profession_of_faith_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id UUID NOT NULL,
    user_id UUID NOT NULL,
    full_name TEXT NOT NULL,
    turma_id UUID,
    turma_name TEXT,
    professed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    details JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.profession_of_faith_records ENABLE ROW LEVEL SECURITY;

-- Policies for history
DROP POLICY IF EXISTS "Admins can view their church profession history" ON public.profession_of_faith_records;
CREATE POLICY "Admins can view their church profession history" 
ON public.profession_of_faith_records 
FOR SELECT 
USING (
    church_id IN (
        SELECT church_id FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- 3. Update the member count function to only count ACTIVE users
CREATE OR REPLACE FUNCTION public.check_church_member_limit(p_church_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_count INTEGER;
    v_limit INTEGER;
BEGIN
    -- Only count ACTIVE users towards the limit
    SELECT COUNT(*) INTO v_current_count
    FROM public.profiles
    WHERE church_id = p_church_id AND is_active = TRUE;

    SELECT member_limit INTO v_limit
    FROM public.church_subscriptions
    WHERE church_id = p_church_id
    LIMIT 1;

    IF v_limit IS NULL THEN
        RETURN TRUE;
    END IF;

    RETURN v_current_count < v_limit;
END;
$$;

-- 4. Re-create the user stats RPC with the new column
CREATE OR REPLACE FUNCTION public.get_church_user_stats(p_church_id UUID)
RETURNS TABLE (
  total_users BIGINT,
  active_users BIGINT,
  pending_users BIGINT,
  inactive_users BIGINT,
  member_limit INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE is_active = TRUE)::BIGINT as total_users,
        COUNT(*) FILTER (WHERE enrollment_status = 'approved' AND is_active = TRUE)::BIGINT as active_users,
        COUNT(*) FILTER (WHERE enrollment_status = 'pending' AND is_active = TRUE)::BIGINT as pending_users,
        COUNT(*) FILTER (WHERE is_active = FALSE)::BIGINT as inactive_users,
        (SELECT cs.member_limit FROM public.church_subscriptions cs WHERE cs.church_id = p_church_id LIMIT 1) as member_limit
    FROM public.profiles
    WHERE church_id = p_church_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_church_user_stats(UUID) TO authenticated;

-- 5. Create processing function
CREATE OR REPLACE FUNCTION public.process_profession_of_faith(p_user_id UUID, p_turma_id UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile RECORD;
    v_turma_name TEXT;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
    
    IF v_profile.user_id IS NULL THEN
        RAISE EXCEPTION 'Perfil não encontrado';
    END IF;

    IF p_turma_id IS NOT NULL THEN
        SELECT name INTO v_turma_name FROM public.turmas WHERE id = p_turma_id;
    END IF;

    -- Record in history
    INSERT INTO public.profession_of_faith_records (church_id, user_id, full_name, turma_id, turma_name)
    VALUES (v_profile.church_id, v_profile.user_id, v_profile.full_name, p_turma_id, v_turma_name);

    -- Inactivate user and clear turma to free spot
    UPDATE public.profiles 
    SET is_active = FALSE, 
        turma_id = NULL,
        enrollment_status = 'archived'
    WHERE user_id = p_user_id;

    -- Log audit
    INSERT INTO public.church_audit_logs (church_id, action, details)
    VALUES (v_profile.church_id, 'profession_of_faith_completed', jsonb_build_object('user_id', p_user_id, 'name', v_profile.full_name));
END;
$$;
