-- Keep user-owned records scoped to the user's church even when the client
-- forgets to send church_id. This protects multi-church reads and reports.

CREATE OR REPLACE FUNCTION public.set_church_id_from_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.church_id IS NULL AND NEW.user_id IS NOT NULL THEN
    SELECT p.church_id
    INTO NEW.church_id
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.backfill_church_id_from_user_profile(p_table regclass)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE format(
    'UPDATE %s AS target
     SET church_id = p.church_id
     FROM public.profiles p
     WHERE target.church_id IS NULL
       AND target.user_id = p.user_id
       AND p.church_id IS NOT NULL',
    p_table
  );
END;
$$;

DO $$
DECLARE
  target_table text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY[
    'achievement_unlocks',
    'attendance',
    'challenge_participants',
    'community_chat',
    'data_export_audit',
    'devotional_progress',
    'devotional_responses',
    'discipleship_plans',
    'event_photos',
    'frontend_error_logs',
    'lesson_progress',
    'lesson_responses',
    'meeting_evaluations',
    'message_reactions',
    'message_views',
    'notification_preferences',
    'pastoral_notes',
    'poll_votes',
    'prayer_requests',
    'privacy_requests',
    'push_subscriptions',
    'ranking_validation_logs',
    'spiritual_assessments',
    'testimonies',
    'user_devotional_overrides',
    'user_lesson_overrides',
    'user_progress',
    'whatsapp_reminder_log',
    'worship_attendance',
    'year_promotion_requests'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS tr_set_church_id_from_user_profile ON public.%I',
      target_table
    );

    EXECUTE format(
      'CREATE TRIGGER tr_set_church_id_from_user_profile
       BEFORE INSERT OR UPDATE OF user_id, church_id ON public.%I
       FOR EACH ROW
       EXECUTE FUNCTION public.set_church_id_from_user_profile()',
      target_table
    );

    PERFORM public.backfill_church_id_from_user_profile(format('public.%I', target_table)::regclass);
  END LOOP;
END;
$$;
