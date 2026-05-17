-- Update profession_of_faith_records to include performed_by
ALTER TABLE public.profession_of_faith_records ADD COLUMN IF NOT EXISTS performed_by UUID REFERENCES auth.users(id);

-- Update the process function to include performer
CREATE OR REPLACE FUNCTION public.process_profession_of_faith(p_user_id UUID, p_turma_id UUID DEFAULT NULL, p_performed_by UUID DEFAULT auth.uid())
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

    -- Record in history with performer
    INSERT INTO public.profession_of_faith_records (church_id, user_id, full_name, turma_id, turma_name, performed_by)
    VALUES (v_profile.church_id, v_profile.user_id, v_profile.full_name, p_turma_id, v_turma_name, p_performed_by);

    -- Inactivate user and clear turma to free spot
    UPDATE public.profiles 
    SET is_active = FALSE, 
        turma_id = NULL,
        enrollment_status = 'archived',
        updated_at = now()
    WHERE user_id = p_user_id;

    -- Log audit with detailed tracking
    INSERT INTO public.church_audit_logs (church_id, action, details)
    VALUES (
        v_profile.church_id, 
        'profession_of_faith_completed', 
        jsonb_build_object(
            'target_user_id', p_user_id, 
            'target_name', v_profile.full_name,
            'performed_by', p_performed_by,
            'previous_turma', v_turma_name
        )
    );
END;
$$;
