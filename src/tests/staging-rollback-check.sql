DO $$ BEGIN
 IF md5(replace(pg_get_functiondef(to_regprocedure('public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)')), E'\r\n', E'\n')) <> '5472cbf53c14b126d97b2975eaff12e5'
    OR NOT has_function_privilege('authenticated','public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)','EXECUTE')
    OR NOT has_function_privilege('authenticated','public.reset_turma_journey(uuid)','EXECUTE')
    OR to_regprocedure('public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)') IS NOT NULL
    OR to_regclass('private.staging_preserved_worship_receipts_20261124') IS NULL THEN
   RAISE EXCEPTION 'STAGING_ROLLBACK_VERIFICATION_FAILED';
 END IF;
END $$;
