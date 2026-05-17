CREATE OR REPLACE FUNCTION public.get_church_member_count(p_church_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT count(*)::INTEGER
        FROM public.profiles
        WHERE church_id = p_church_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
