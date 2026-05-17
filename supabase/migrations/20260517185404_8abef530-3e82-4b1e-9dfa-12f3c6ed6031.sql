-- Function to get detailed church user stats
CREATE OR REPLACE FUNCTION public.get_church_user_stats(p_church_id UUID)
RETURNS TABLE (
  total_users BIGINT,
  active_users BIGINT,
  pending_users BIGINT,
  member_limit INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_users,
        COUNT(*) FILTER (WHERE enrollment_status = 'approved')::BIGINT as active_users,
        COUNT(*) FILTER (WHERE enrollment_status = 'pending')::BIGINT as pending_users,
        (SELECT cs.member_limit FROM public.church_subscriptions cs WHERE cs.church_id = p_church_id LIMIT 1) as member_limit
    FROM public.profiles
    WHERE church_id = p_church_id;
END;
$$;

-- Grant access to the new function
GRANT EXECUTE ON FUNCTION public.get_church_user_stats(UUID) TO authenticated;

-- Ensure church admins can manage their users (approval/rejection/removal)
-- This assumes policies exist, but let's double check RLS on profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Admins can manage their church users'
    ) THEN
        CREATE POLICY "Admins can manage their church users" 
        ON public.profiles 
        FOR UPDATE 
        USING (
            church_id IN (
                SELECT church_id FROM public.profiles 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        );
    END IF;
END $$;
