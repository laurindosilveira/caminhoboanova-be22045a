-- 1. Restrict system admins table to only the allowed email
-- First remove any other potential admins (safety)
DELETE FROM public.authorized_system_admins 
WHERE lower(email) != 'laurindosilveira@gmail.com';

-- 2. Update function to check for MFA (Multi-Factor Authentication)
-- This function will now check if the user has an active MFA session
CREATE OR REPLACE FUNCTION public.is_authorized_system_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_is_mfa BOOLEAN;
    v_is_authorized BOOLEAN;
BEGIN
    -- Check if user is in authorized table
    SELECT EXISTS (
        SELECT 1
        FROM public.authorized_system_admins asa
        JOIN auth.users au ON lower(au.email) = lower(asa.email)
        WHERE au.id = auth.uid()
          AND asa.is_active = true
          AND lower(asa.email) = 'laurindosilveira@gmail.com'
    ) INTO v_is_authorized;

    -- If not even authorized by email, return false immediately
    IF NOT v_is_authorized THEN
        RETURN FALSE;
    END IF;

    -- Check for MFA status using the auth.mfa_for_user() or level
    -- The aal (Authenticator Assurance Level) 'aal2' means MFA is active for this session
    -- aal1 = password only, aal2 = MFA verified
    SELECT (auth.jwt() ->> 'aal') = 'aal2' INTO v_is_mfa;

    RETURN v_is_mfa;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
