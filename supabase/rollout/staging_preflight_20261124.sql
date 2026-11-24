-- STAGING ONLY: archive the pre-existing sync function and policy definitions.
-- The caller must independently identify the staging project. Never use as an
-- automatic production migration.
DO $$
DECLARE p oid := to_regprocedure('public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)');
BEGIN
  IF p IS NULL OR md5(replace(pg_get_functiondef(p), E'\r\n', E'\n')) <> '5472cbf53c14b126d97b2975eaff12e5' THEN
    RAISE EXCEPTION 'STAGING_SYNC_VERSION_MISMATCH';
  END IF;
  IF md5(replace(pg_get_functiondef(to_regprocedure('public.save_lesson_draft(uuid,jsonb,boolean,boolean)')), E'\r\n', E'\n')) IS DISTINCT FROM '4c28d8a62bb396d7fad6c0220b6fc7a4'
     OR md5(replace(pg_get_functiondef(to_regprocedure('public.complete_lesson(uuid,jsonb,boolean,boolean,integer,uuid)')), E'\r\n', E'\n')) IS DISTINCT FROM '6a9bbfb1f4ef8555aa3cfe9acd4b502c'
     OR md5(replace(pg_get_functiondef(to_regprocedure('public.complete_devotional(uuid,jsonb,boolean,integer,uuid)')), E'\r\n', E'\n')) IS DISTINCT FROM 'e1aff0837e86e689e5a7e4d92074b333' THEN
    RAISE EXCEPTION 'STAGING_LEGACY_FUNCTION_VERSION_MISMATCH';
  END IF;
  IF to_regprocedure('private.staging_original_sync_20261124(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)') IS NOT NULL
     OR to_regclass('private.staging_policy_backup_20261124') IS NOT NULL
     OR to_regclass('private.learning_write_guard') IS NOT NULL
     OR to_regclass('private.attendance_write_guard') IS NOT NULL
     OR to_regclass('private.worship_write_guard') IS NOT NULL
     OR to_regclass('private.offline_worship_receipts') IS NOT NULL THEN
    RAISE EXCEPTION 'STAGING_OBJECT_COLLISION';
  END IF;
  IF NOT has_function_privilege('authenticated',p,'EXECUTE')
     OR NOT has_function_privilege('service_role',p,'EXECUTE')
     OR EXISTS (SELECT 1 FROM pg_proc f CROSS JOIN LATERAL aclexplode(f.proacl) a
       WHERE f.oid=p AND a.privilege_type='EXECUTE'
         AND a.grantee NOT IN (f.proowner, 'authenticated'::regrole::oid, 'service_role'::regrole::oid)) THEN
    RAISE EXCEPTION 'STAGING_SYNC_GRANTS_MISMATCH';
  END IF;
  IF NOT has_function_privilege('authenticated','public.reset_turma_journey(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'STAGING_RESET_GRANTS_MISMATCH';
  END IF;
END $$;
CREATE TABLE private.staging_policy_backup_20261124 AS
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_catalog.pg_policies WHERE schemaname='public'
  AND tablename IN ('lesson_responses','devotional_responses','lesson_progress','devotional_progress');
ALTER TABLE private.staging_policy_backup_20261124 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.staging_policy_backup_20261124 FROM PUBLIC,anon,authenticated;
ALTER FUNCTION public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) SET SCHEMA private;
ALTER FUNCTION private.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) RENAME TO staging_original_sync_20261124;
REVOKE ALL ON FUNCTION private.staging_original_sync_20261124(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) FROM PUBLIC,anon,authenticated;
