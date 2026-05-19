-- Ensure pgcrypto extension is active in public
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Re-verify and ensure functions are using search_path properly
ALTER FUNCTION public.set_system_master_password(p_new_password TEXT) SET search_path = public;
ALTER FUNCTION public.verify_system_master_password(p_password_attempt TEXT) SET search_path = public;
