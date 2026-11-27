DO $$ BEGIN
 IF to_regprocedure('public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)') IS NOT NULL
    OR to_regprocedure('public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)') IS NOT NULL
    OR to_regclass('private.production_worship_receipts_archive_20261124') IS NULL
    OR to_regclass('private.learning_membership_version_archive_20261125') IS NULL
    OR to_regclass('private.completion_review_archive_20261125') IS NULL
    OR to_regclass('private.completion_review_events_archive_20261125') IS NULL
    OR to_regprocedure('private.rollback_write_freeze_20261124()') IS NULL
    OR (SELECT count(*) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND NOT t.tgisinternal AND t.tgname='aa_rollback_freeze_20261124') <> 6
    OR has_function_privilege('authenticated','public.reset_turma_journey(uuid)','EXECUTE')
    OR EXISTS(SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND NOT t.tgisinternal AND t.tgname IN ('aa_lock_learning_write','aa_guard_own_final_attendance','aa_guard_own_worship_insert')) THEN
   RAISE EXCEPTION 'PRODUCTION_ROLLBACK_VERIFICATION_FAILED';
 END IF;
END $$;
