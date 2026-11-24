-- REVIEW ONLY. Requires a coordinated maintenance window and prior capture of
-- pending device queues. Reverting the guard reopens legacy overwrite risks.
-- Never apply to an unverified project or if the installed release changed.
BEGIN;
LOCK TABLE public.lesson_responses,public.lesson_progress,public.devotional_responses,public.devotional_progress,public.attendance,public.worship_attendance IN ACCESS EXCLUSIVE MODE;
DO $$ BEGIN
  IF to_regclass('private.production_policy_snapshot_20261124') IS NULL
     OR to_regclass('private.production_release_snapshot_20261124') IS NULL
     OR to_regprocedure('private.production_release_fingerprints_20261124()') IS NULL
     OR to_regclass('private.learning_write_guard') IS NULL
     OR to_regclass('private.attendance_write_guard') IS NULL
     OR to_regclass('private.worship_write_guard') IS NULL
     OR to_regclass('private.offline_worship_receipts') IS NULL
     OR to_regclass('private.production_worship_receipts_archive_20261124') IS NOT NULL
     OR to_regprocedure('private.rollback_write_freeze_20261124()') IS NOT NULL
     OR to_regprocedure('public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)') IS NULL THEN
    RAISE EXCEPTION 'PRODUCTION_ROLLBACK_PRECONDITION_FAILED';
  END IF;
  IF EXISTS (
    (SELECT * FROM private.production_release_snapshot_20261124 EXCEPT SELECT * FROM private.production_release_fingerprints_20261124())
    UNION ALL
    (SELECT * FROM private.production_release_fingerprints_20261124() EXCEPT SELECT * FROM private.production_release_snapshot_20261124)
  ) THEN RAISE EXCEPTION 'PRODUCTION_RELEASE_CHANGED'; END IF;
  IF EXISTS(SELECT 1 FROM private.learning_write_guard)
     OR EXISTS(SELECT 1 FROM private.attendance_write_guard)
     OR EXISTS(SELECT 1 FROM private.worship_write_guard) THEN
    RAISE EXCEPTION 'PRODUCTION_WRITES_STILL_ACTIVE';
  END IF;
END $$;
-- Keep authenticated writes paused after the old client is restored. Without
-- this independent freeze, its offline queue could overwrite newer data.
CREATE FUNCTION private.rollback_write_freeze_20261124()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF pg_catalog.current_setting('role',true)='authenticated' THEN
    RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='APP_UPDATE_REQUIRED',
      HINT='Keep the offline queue on this device until the service is restored.';
  END IF;
  RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
END $$;
REVOKE ALL ON FUNCTION private.rollback_write_freeze_20261124() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER aa_rollback_freeze_20261124 BEFORE INSERT OR UPDATE OR DELETE ON public.lesson_responses FOR EACH ROW EXECUTE FUNCTION private.rollback_write_freeze_20261124();
CREATE TRIGGER aa_rollback_freeze_20261124 BEFORE INSERT OR UPDATE OR DELETE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION private.rollback_write_freeze_20261124();
CREATE TRIGGER aa_rollback_freeze_20261124 BEFORE INSERT OR UPDATE OR DELETE ON public.devotional_responses FOR EACH ROW EXECUTE FUNCTION private.rollback_write_freeze_20261124();
CREATE TRIGGER aa_rollback_freeze_20261124 BEFORE INSERT OR UPDATE OR DELETE ON public.devotional_progress FOR EACH ROW EXECUTE FUNCTION private.rollback_write_freeze_20261124();
CREATE TRIGGER aa_rollback_freeze_20261124 BEFORE INSERT OR UPDATE OR DELETE ON public.attendance FOR EACH ROW EXECUTE FUNCTION private.rollback_write_freeze_20261124();
CREATE TRIGGER aa_rollback_freeze_20261124 BEFORE INSERT OR UPDATE OR DELETE ON public.worship_attendance FOR EACH ROW EXECUTE FUNCTION private.rollback_write_freeze_20261124();
DROP TRIGGER aa_lock_learning_write ON public.lesson_responses;
DROP TRIGGER aa_lock_learning_write ON public.lesson_progress;
DROP TRIGGER aa_lock_learning_write ON public.devotional_responses;
DROP TRIGGER aa_lock_learning_write ON public.devotional_progress;
DROP TRIGGER aa_guard_own_final_attendance ON public.attendance;
DROP TRIGGER aa_guard_own_worship_insert ON public.worship_attendance;
DROP FUNCTION IF EXISTS public.sync_owned_completion(uuid,uuid,uuid,text,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb);
DROP FUNCTION public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb);
DROP FUNCTION public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb);
DROP FUNCTION public.sync_owned_attendance(uuid,uuid,uuid,text,timestamptz,text,text,timestamptz,text);
DROP FUNCTION public.sync_owned_worship(uuid,uuid,text,date,text,text,text);
DROP FUNCTION private.guard_own_final_attendance();
DROP FUNCTION private.guard_own_worship_insert();
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
  FOR p IN SELECT * FROM private.production_policy_snapshot_20261124 WHERE
    tablename IN ('lesson_responses','devotional_responses') OR
    (tablename IN ('lesson_progress','devotional_progress') AND cmd='DELETE')
  LOOP
    SELECT string_agg(quote_ident(r::text),',') INTO role_list FROM unnest(p.roles) r;
    sql_text := format('CREATE POLICY %I ON public.%I AS %s FOR %s TO %s',p.policyname,p.tablename,p.permissive,p.cmd,role_list);
    IF p.qual IS NOT NULL THEN sql_text:=sql_text||format(' USING (%s)',p.qual); END IF;
    IF p.with_check IS NOT NULL THEN sql_text:=sql_text||format(' WITH CHECK (%s)',p.with_check); END IF;
    EXECUTE sql_text;
  END LOOP;
END $$;
DROP FUNCTION private.is_active_learning_owner(uuid,uuid);
DROP TABLE private.learning_write_guard;
DROP TABLE private.attendance_write_guard;
DROP TABLE private.worship_write_guard;
-- Retain idempotency receipts for reconciliation; never discard queued records.
ALTER TABLE private.offline_worship_receipts RENAME TO production_worship_receipts_archive_20261124;
-- Keep the destructive group reset suspended until history is reconciled.
DO $$ BEGIN
  IF EXISTS (
    (SELECT tablename,policyname,permissive,roles,cmd,qual,with_check FROM private.production_policy_snapshot_20261124
      EXCEPT SELECT tablename,policyname,permissive,roles,cmd,qual,with_check FROM pg_catalog.pg_policies
       WHERE schemaname='public' AND tablename IN ('lesson_responses','devotional_responses','lesson_progress','devotional_progress'))
    UNION ALL
    (SELECT tablename,policyname,permissive,roles,cmd,qual,with_check FROM pg_catalog.pg_policies
       WHERE schemaname='public' AND tablename IN ('lesson_responses','devotional_responses','lesson_progress','devotional_progress')
      EXCEPT SELECT tablename,policyname,permissive,roles,cmd,qual,with_check FROM private.production_policy_snapshot_20261124)
  ) THEN RAISE EXCEPTION 'PRODUCTION_POLICY_RESTORE_MISMATCH'; END IF;
END $$;
-- Keep the restricted metadata snapshot as evidence for later review.
NOTIFY pgrst,'reload schema';
COMMIT;
