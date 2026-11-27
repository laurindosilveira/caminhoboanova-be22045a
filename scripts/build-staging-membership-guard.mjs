import {readFileSync,writeFileSync} from "node:fs";
const src=readFileSync("supabase/rollout/20261123_owned_learning_guard.sql","utf8");
const start=src.indexOf("CREATE FUNCTION public.sync_owned_learning(");
if(start<0) throw new Error("Missing owned learning function");
const body=src.slice(start).replace("CREATE FUNCTION public.sync_owned_learning(","CREATE OR REPLACE FUNCTION public.sync_owned_learning(");
const pre=`-- STAGING ONLY. Verify exact earlier hosted state before changing anything.\nBEGIN;\nDO $$ BEGIN\n IF md5(replace(pg_get_functiondef(to_regprocedure('public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)')),E'\\r\\n',E'\\n')) IS DISTINCT FROM '00e64eb6e4a435501b3ef928d9e77999'\n OR to_regclass('private.learning_membership_version') IS NOT NULL\n OR to_regprocedure('public.get_owned_learning_scope(uuid)') IS NOT NULL\n OR EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.profiles'::regclass AND tgname='aa_rotate_learning_membership' AND NOT tgisinternal) THEN\n   RAISE EXCEPTION 'STAGING_MEMBERSHIP_PRECONDITION_FAILED';\n END IF;\nEND $$;\n`;
writeFileSync("supabase/rollout/staging_membership_guard_20261125.sql",pre+body+"\nNOTIFY pgrst,'reload schema';\nCOMMIT;\n","utf8");
console.log("Prepared staging-only membership upgrade.");
