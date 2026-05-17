-- V2 function with stricter logic and MFA check
CREATE OR REPLACE FUNCTION public.is_authorized_system_admin_v2()
RETURNS BOOLEAN AS $$
DECLARE
    v_is_mfa BOOLEAN;
    v_is_authorized BOOLEAN;
BEGIN
    -- 1. Check if user is exactly the allowed email
    SELECT EXISTS (
        SELECT 1
        FROM auth.users
        WHERE id = auth.uid()
          AND lower(email) = 'laurindosilveira@gmail.com'
    ) INTO v_is_authorized;

    -- If not even authorized by email, return false immediately
    IF NOT v_is_authorized THEN
        RETURN FALSE;
    END IF;

    -- 2. Check for MFA status using session claims
    -- aal2 means the user has completed a second factor check in this session
    SELECT (auth.jwt() ->> 'aal') = 'aal2' INTO v_is_mfa;

    RETURN COALESCE(v_is_mfa, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
