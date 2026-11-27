-- Verify records created after the upgrade survive the database rollback.
DO $$
DECLARE a uuid:='00000000-0000-0000-0000-000000000201';
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.lesson_responses WHERE user_id=a AND question_key='__ensaio_unificado__' AND response='[novo apos atualizacao]') THEN
  RAISE EXCEPTION 'new lesson answer disappeared after rollback'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.lesson_progress WHERE user_id=a AND is_completed) THEN
  RAISE EXCEPTION 'new lesson completion disappeared after rollback'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.devotional_progress WHERE user_id=a AND devotional_id='00000000-0000-0000-0000-000000000539') THEN
  RAISE EXCEPTION 'new devotional completion disappeared after rollback'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.devotional_responses WHERE user_id=a AND devotional_id='00000000-0000-0000-0000-000000000539' AND question_index=0 AND response='[devocional apos atualizacao]') THEN
  RAISE EXCEPTION 'new devotional answer disappeared after rollback'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.attendance WHERE user_id=a AND event_id='00000000-0000-0000-0000-000000000529' AND status='pendente_presente') THEN
  RAISE EXCEPTION 'new attendance disappeared after rollback'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.worship_attendance WHERE user_id=a AND worship_date='2026-11-25' AND worship_time='08:00' AND event_type='culto' AND status='pendente') THEN
  RAISE EXCEPTION 'new worship disappeared after rollback'; END IF;
 IF NOT EXISTS(SELECT 1 FROM private.production_worship_receipts_archive_20261124 WHERE user_id=a AND action_id='rollback-preserve-20261125') THEN
  RAISE EXCEPTION 'worship receipt disappeared after rollback'; END IF;
END $$;
