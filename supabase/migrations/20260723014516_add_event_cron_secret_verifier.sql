CREATE OR REPLACE FUNCTION public.verify_push_cron_secret(_candidate text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    _candidate = (
      SELECT decrypted_secret
      FROM vault.decrypted_secrets
      WHERE name = 'PUSH_CRON_SECRET'
      LIMIT 1
    ),
    false
  )
$$;

REVOKE ALL ON FUNCTION public.verify_push_cron_secret(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_push_cron_secret(text) FROM anon;
REVOKE ALL ON FUNCTION public.verify_push_cron_secret(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.verify_push_cron_secret(text) TO service_role;
