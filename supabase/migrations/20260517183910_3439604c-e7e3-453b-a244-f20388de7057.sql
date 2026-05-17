-- Trigger function to enforce member limits
CREATE OR REPLACE FUNCTION public.enforce_church_member_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.check_church_member_limit(NEW.church_id) THEN
        RAISE EXCEPTION 'Limite de membros atingido para esta igreja. Faça o upgrade do plano para adicionar mais usuários.';
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS tr_enforce_church_member_limit ON public.profiles;
CREATE TRIGGER tr_enforce_church_member_limit
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_church_member_limit();

-- Set search_path for security
ALTER FUNCTION public.enforce_church_member_limit() SET search_path = public;
ALTER FUNCTION public.check_church_member_limit(UUID) SET search_path = public;
ALTER FUNCTION public.log_church_audit(uuid, text, jsonb) SET search_path = public;
