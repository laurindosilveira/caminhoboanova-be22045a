DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'event-reminders-daily') THEN
    PERFORM cron.unschedule('event-reminders-daily');
  END IF;
END
$$;

SELECT cron.schedule(
  'event-reminders-daily',
  '15 11 * * *',
  $cron$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL')
        || '/functions/v1/event-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-caminho-cron-secret',
        (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'PUSH_CRON_SECRET')
      ),
      body := '{"source":"scheduled"}'::jsonb
    );
  $cron$
);
