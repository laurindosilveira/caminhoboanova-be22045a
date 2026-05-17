-- Function to get profession of faith report data
CREATE OR REPLACE FUNCTION public.get_profession_of_faith_report(p_church_id UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  turma_name TEXT,
  professed_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.user_id,
        pr.full_name,
        pr.turma_name,
        pr.professed_at
    FROM public.profession_of_faith_records pr
    WHERE pr.church_id = p_church_id
    ORDER BY pr.professed_at DESC;
END;
$$;

-- Grant access
GRANT EXECUTE ON FUNCTION public.get_profession_of_faith_report(UUID) TO authenticated;

-- Ensure real-time broadcast when profession of faith is completed
CREATE OR REPLACE FUNCTION public.notify_subscription_stats_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify about profile changes (approvals, inactivations) to refresh MinhaIgreja counts
  PERFORM pg_notify('pgrst', 'stats_changed');
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_subscription_stats ON public.profiles;
CREATE TRIGGER tr_notify_subscription_stats
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH STATEMENT
EXECUTE FUNCTION public.notify_subscription_stats_change();
