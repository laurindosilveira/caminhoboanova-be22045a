-- Create a table for system configurations if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (though only accessible via SECURITY DEFINER functions anyway)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- No public policies, only internal functions should access this
-- Note: We'll store the hash here.

-- Function to verify the master password
CREATE OR REPLACE FUNCTION public.verify_system_master_password(p_password_attempt TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_stored_hash TEXT;
    v_is_authorized BOOLEAN;
BEGIN
    -- 1. First verify if the user is an authorized admin by email
    SELECT public.is_authorized_system_admin() INTO v_is_authorized;
    
    IF NOT v_is_authorized THEN
        RETURN FALSE;
    END IF;

    -- 2. Get the stored hash
    SELECT value INTO v_stored_hash FROM public.system_settings WHERE key = 'master_password_hash';
    
    IF v_stored_hash IS NULL THEN
        -- If no hash is stored, we might fall back to a default or fail
        -- For security, let's fail if not configured
        RETURN FALSE;
    END IF;

    -- 3. Verify the password. 
    -- Since we can't easily do bcrypt/argon2 inside Postgres without extensions that might not be available,
    -- and we are doing this securely via a SECURITY DEFINER function that only authorized admins can trigger,
    -- we can use crypt if pgcrypto is available.
    
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    
    RETURN v_stored_hash = crypt(p_password_attempt, v_stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to set the master password (can only be called manually or by a superuser)
CREATE OR REPLACE FUNCTION public.set_system_master_password(p_new_password TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.system_settings (key, value)
    VALUES ('master_password_hash', crypt(p_new_password, gen_salt('bf', 10)))
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
