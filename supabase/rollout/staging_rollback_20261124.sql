-- STAGING ONLY, inverse of staging_coordinated_candidate_20261124.sql.
-- Never delete queued data: preserve worship receipts if any were created.
BEGIN;
DO $$ BEGIN
  IF to_regclass('private.staging_policy_backup_20261124') IS NULL
     OR to_regprocedure('private.staging_original_sync_20261124(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)') IS NULL
     OR to_regprocedure('public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)') IS NULL
     OR to_regclass('private.learning_write_guard') IS NULL
     OR to_regclass('private.attendance_write_guard') IS NULL
     OR to_regclass('private.offline_worship_receipts') IS NULL THEN
    RAISE EXCEPTION 'STAGING_ROLLBACK_PRECONDITION_FAILED';
  END IF;
  IF EXISTS(SELECT 1 FROM private.learning_write_guard) OR EXISTS(SELECT 1 FROM private.attendance_write_guard) THEN
    RAISE EXCEPTION 'STAGING_WRITES_STILL_ACTIVE';
  END IF;
  IF to_regclass('private.worship_write_guard') IS NOT NULL THEN
    IF EXISTS(SELECT 1 FROM private.worship_write_guard) THEN RAISE EXCEPTION 'STAGING_WRITES_STILL_ACTIVE'; END IF;
  END IF;
  IF to_regclass('private.staging_preserved_worship_receipts_20261124') IS NOT NULL THEN
    RAISE EXCEPTION 'STAGING_RECEIPT_ARCHIVE_COLLISION';
  END IF;
  IF to_regprocedure('public.get_leader_participant_summaries(uuid,text,uuid)') IS NOT NULL
     AND md5(replace(pg_get_functiondef(to_regprocedure('public.get_leader_participant_summaries(uuid,text,uuid)')), E'\r\n', E'\n')) <> 'fdea43482788a32ff05d2a1f3f13dddb' THEN
    RAISE EXCEPTION 'STAGING_SUMMARY_CHANGED';
  END IF;
  IF to_regprocedure('private.staging_original_care_20261124(uuid,text,uuid)') IS NOT NULL
     AND md5(replace(pg_get_functiondef(to_regprocedure('private.get_leader_care_dashboard(uuid,text,uuid)')), E'\r\n', E'\n')) IS DISTINCT FROM '713faac288e6eb28eed3d06c4580970c' THEN
    RAISE EXCEPTION 'STAGING_CARE_CHANGED';
  END IF;
END $$;
DROP FUNCTION IF EXISTS public.get_leader_participant_summaries(uuid,text,uuid);
DO $$ BEGIN
 IF to_regprocedure('private.staging_original_care_20261124(uuid,text,uuid)') IS NOT NULL THEN
   DROP FUNCTION private.get_leader_care_dashboard(uuid,text,uuid);
   ALTER FUNCTION private.staging_original_care_20261124(uuid,text,uuid) RENAME TO get_leader_care_dashboard;
 END IF;
END $$;
DROP TRIGGER aa_lock_learning_write ON public.lesson_responses;
DROP TRIGGER aa_lock_learning_write ON public.lesson_progress;
DROP TRIGGER aa_lock_learning_write ON public.devotional_responses;
DROP TRIGGER aa_lock_learning_write ON public.devotional_progress;
DROP TRIGGER aa_guard_own_final_attendance ON public.attendance;
DROP TRIGGER IF EXISTS aa_guard_own_worship_insert ON public.worship_attendance;

-- Preserve outstanding review metadata for later reconciliation.
DROP FUNCTION IF EXISTS public.approve_completion_review(uuid,boolean);
DROP FUNCTION IF EXISTS public.list_completion_reviews(uuid);
DROP FUNCTION IF EXISTS public.request_completion_review(text,text,uuid);
DROP FUNCTION IF EXISTS private.may_review_completion(uuid,uuid,uuid,text);
DO $$ BEGIN
 IF to_regclass('private.completion_review_events') IS NOT NULL THEN
  IF to_regclass('private.completion_review_events_archive_20261125') IS NOT NULL THEN RAISE EXCEPTION 'COMPLETION_EVENTS_ARCHIVE_EXISTS'; END IF;
  ALTER TABLE private.completion_review_events RENAME TO completion_review_events_archive_20261125;
 END IF;
 IF to_regclass('private.completion_review_requests') IS NOT NULL THEN
  IF to_regclass('private.completion_review_archive_20261125') IS NOT NULL THEN RAISE EXCEPTION 'COMPLETION_REVIEW_ARCHIVE_EXISTS'; END IF;
  ALTER TABLE private.completion_review_requests RENAME TO completion_review_archive_20261125;
 END IF;
END $$;
DROP TRIGGER IF EXISTS aa_rotate_learning_membership ON public.profiles;
DROP FUNCTION IF EXISTS public.get_owned_learning_scope(uuid);
DROP FUNCTION IF EXISTS public.sync_owned_completion(uuid,uuid,uuid,text,uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb);
DROP FUNCTION IF EXISTS private.rotate_learning_membership_version();
DO $$ BEGIN
 IF to_regclass('private.learning_membership_version') IS NOT NULL THEN
  IF to_regclass('private.learning_membership_version_archive_20261125') IS NOT NULL THEN RAISE EXCEPTION 'MEMBERSHIP_VERSION_ARCHIVE_EXISTS'; END IF;
  ALTER TABLE private.learning_membership_version RENAME TO learning_membership_version_archive_20261125;
 END IF;
END $$;
DROP FUNCTION public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb);
DROP FUNCTION public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb);
DROP FUNCTION public.sync_owned_attendance(uuid,uuid,uuid,text,timestamptz,text,text,timestamptz,text);
DROP FUNCTION public.sync_owned_worship(uuid,uuid,text,date,text,text,text);
DROP FUNCTION private.guard_own_final_attendance();
DROP FUNCTION IF EXISTS private.guard_own_worship_insert();
DROP FUNCTION private.lock_learning_write();
DROP FUNCTION private.learning_item_lock_key(uuid,text,uuid);

DO $$
DECLARE p record; role_list text; sql_text text; v_table text; v_policy text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['lesson_responses','devotional_responses'] LOOP
    FOREACH v_policy IN ARRAY ARRAY['historical answers owner select','answers owner insert','answers owner update','answers owner delete'] LOOP
      EXECUTE format('DROP POLICY %I ON public.%I',v_policy,v_table);
    END LOOP;
  END LOOP;
  FOREACH v_table IN ARRAY ARRAY['lesson_progress','devotional_progress'] LOOP
    EXECUTE format('DROP POLICY %I ON public.%I','progress owner delete',v_table);
  END LOOP;
  FOR p IN SELECT * FROM private.staging_policy_backup_20261124 WHERE
    tablename IN ('lesson_responses','devotional_responses') OR
    (tablename IN ('lesson_progress','devotional_progress') AND cmd='DELETE')
  LOOP
    SELECT string_agg(quote_ident(r::text),',') INTO role_list FROM unnest(p.roles) r;
    sql_text := format('CREATE POLICY %I ON public.%I AS %s FOR %s TO %s',p.policyname,p.tablename,p.permissive,p.cmd,role_list);
    IF p.qual IS NOT NULL THEN sql_text := sql_text || format(' USING (%s)',p.qual); END IF;
    IF p.with_check IS NOT NULL THEN sql_text := sql_text || format(' WITH CHECK (%s)',p.with_check); END IF;
    EXECUTE sql_text;
  END LOOP;
END $$;
DROP FUNCTION private.is_active_learning_owner(uuid,uuid);
DROP TABLE private.learning_write_guard;
DROP TABLE private.attendance_write_guard;
DROP TABLE IF EXISTS private.worship_write_guard;
ALTER TABLE private.offline_worship_receipts RENAME TO staging_preserved_worship_receipts_20261124;
GRANT EXECUTE ON FUNCTION public.reset_turma_journey(uuid) TO authenticated;
ALTER FUNCTION private.staging_original_sync_20261124(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) RENAME TO sync_offline_learning;
ALTER FUNCTION private.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) SET SCHEMA public;
GRANT EXECUTE ON FUNCTION public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) TO authenticated;
DO $$ BEGIN
  IF EXISTS (
    (SELECT tablename,policyname,permissive,roles,cmd,qual,with_check FROM private.staging_policy_backup_20261124
      EXCEPT SELECT tablename,policyname,permissive,roles,cmd,qual,with_check FROM pg_catalog.pg_policies
       WHERE schemaname='public' AND tablename IN ('lesson_responses','devotional_responses','lesson_progress','devotional_progress'))
    UNION ALL
    (SELECT tablename,policyname,permissive,roles,cmd,qual,with_check FROM pg_catalog.pg_policies
       WHERE schemaname='public' AND tablename IN ('lesson_responses','devotional_responses','lesson_progress','devotional_progress')
      EXCEPT SELECT tablename,policyname,permissive,roles,cmd,qual,with_check FROM private.staging_policy_backup_20261124)
  ) THEN RAISE EXCEPTION 'STAGING_POLICY_RESTORE_MISMATCH'; END IF;
END $$;
DROP TABLE private.staging_policy_backup_20261124;
NOTIFY pgrst, 'reload schema';
COMMIT;
