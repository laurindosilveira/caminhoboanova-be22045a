// Generates an incremental, staging-only test update; no database is contacted.
import { readFileSync, writeFileSync } from "node:fs";
const sql = readFileSync("supabase/rollout/attendance_scope_candidate.sql", "utf8");
const between = (a, b) => {
  const start = sql.indexOf(a), end = sql.indexOf(b, start);
  if (start < 0 || end < 0) throw new Error("Expected guard section missing");
  return sql.slice(start, end);
};
const attendance = between("CREATE FUNCTION private.guard_own_final_attendance()", "CREATE TRIGGER aa_guard_own_final_attendance")
  .replace("CREATE FUNCTION", "CREATE OR REPLACE FUNCTION");
const worship = sql.slice(sql.indexOf("CREATE TABLE private.worship_write_guard"));
if (!worship.startsWith("CREATE TABLE")) throw new Error("Worship guard section missing");
const updatedWorship = worship.replace("CREATE FUNCTION public.sync_owned_worship", "CREATE OR REPLACE FUNCTION public.sync_owned_worship");
const preflight = `-- STAGING ONLY: update the previously deployed candidate, preserving data.
BEGIN;
DO $$ BEGIN
 IF md5(replace(pg_get_functiondef(to_regprocedure('private.guard_own_final_attendance()')),E'\\r\\n',E'\\n')) IS DISTINCT FROM '1c8640f808eb98971a3fe7aed2f407de'
 OR md5(replace(pg_get_functiondef(to_regprocedure('public.sync_owned_worship(uuid,uuid,text,date,text,text,text)')),E'\\r\\n',E'\\n')) IS DISTINCT FROM '996804b3586f8524856baae0037f3f43'
 OR to_regclass('private.worship_write_guard') IS NOT NULL
 OR to_regprocedure('private.guard_own_worship_insert()') IS NOT NULL THEN RAISE EXCEPTION 'STAGING_LEGACY_GUARD_PRECONDITION_FAILED'; END IF;
END $$;
`;
writeFileSync("supabase/rollout/staging_legacy_guard_20261124.sql", `${preflight}\n${attendance}\n${updatedWorship}\nNOTIFY pgrst,'reload schema';\nCOMMIT;\n`, "utf8");
console.log("Prepared staging legacy-queue guard; no database was contacted.");
