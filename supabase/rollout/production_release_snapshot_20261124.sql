-- Metadata only. Freeze the installed function, trigger and policy definitions
-- in the same transaction, so reversal refuses an independently changed system.
CREATE FUNCTION private.production_release_fingerprints_20261124()
RETURNS TABLE(object_type text,object_name text,fingerprint text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT 'function'::text,n.nspname||'.'||p.proname||'('||pg_catalog.pg_get_function_identity_arguments(p.oid)||')',
   md5(pg_catalog.pg_get_functiondef(p.oid)||coalesce(p.proacl::text,''))
 FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
 WHERE (n.nspname='public' AND p.proname IN ('sync_owned_learning','sync_offline_learning','sync_owned_attendance','sync_owned_worship','reset_turma_journey','save_lesson_draft','complete_lesson','complete_devotional'))
    OR (n.nspname='private' AND p.proname IN ('production_release_fingerprints_20261124','learning_item_lock_key','lock_learning_write','guard_own_final_attendance','guard_own_worship_insert','is_active_learning_owner'))
 UNION ALL
 SELECT 'trigger',n.nspname||'.'||c.relname||'.'||t.tgname,md5(pg_catalog.pg_get_triggerdef(t.oid)||t.tgenabled::text)
 FROM pg_catalog.pg_trigger t JOIN pg_catalog.pg_class c ON c.oid=t.tgrelid JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND NOT t.tgisinternal AND c.relname IN ('lesson_responses','lesson_progress','devotional_responses','devotional_progress','attendance','worship_attendance')
 UNION ALL
 SELECT 'policy',p.schemaname||'.'||p.tablename||'.'||p.policyname,md5(to_jsonb(p)::text)
 FROM pg_catalog.pg_policies p WHERE p.schemaname='public' AND p.tablename IN ('lesson_responses','lesson_progress','devotional_responses','devotional_progress','attendance','worship_attendance');
$$;
REVOKE ALL ON FUNCTION private.production_release_fingerprints_20261124() FROM PUBLIC,anon,authenticated;
CREATE TABLE private.production_release_snapshot_20261124 AS SELECT * FROM private.production_release_fingerprints_20261124();
ALTER TABLE private.production_release_snapshot_20261124 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.production_release_snapshot_20261124 FROM PUBLIC,anon,authenticated;
