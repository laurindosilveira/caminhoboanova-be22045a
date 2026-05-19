CREATE OR REPLACE FUNCTION public.set_system_master_password(p_new_password TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.system_settings (key, value)
    VALUES ('master_password_hash', public.crypt(p_new_password, public.gen_salt('bf', 10)))
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.verify_system_master_password(p_password_attempt TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_stored_hash TEXT;
    v_is_authorized BOOLEAN;
BEGIN
    SELECT public.is_authorized_system_admin() INTO v_is_authorized;
    IF NOT v_is_authorized THEN RETURN FALSE; END IF;

    SELECT value INTO v_stored_hash FROM public.system_settings WHERE key = 'master_password_hash';
    IF v_stored_hash IS NULL THEN RETURN FALSE; END IF;

    RETURN v_stored_hash = public.crypt(p_password_attempt, v_stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
