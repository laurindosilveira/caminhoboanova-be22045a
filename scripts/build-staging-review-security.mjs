import {readFileSync,writeFileSync} from "node:fs";
const src=readFileSync("supabase/rollout/completion_review_candidate.sql","utf8");
const names=["private.may_review_completion","public.request_completion_review","public.approve_completion_review"];
const parts=names.map(name=>{
 const start=src.indexOf(`CREATE FUNCTION ${name}(`);if(start<0)throw new Error(`Missing ${name}`);
 const end=src.indexOf("$$;",start);if(end<0)throw new Error(`Missing terminator ${name}`);
 return src.slice(start,end+3).replace("CREATE FUNCTION ","CREATE OR REPLACE FUNCTION ");
});
const guard=`-- STAGING ONLY: exact hash checks protect the deployed review functions.\nBEGIN;\nDO $$ BEGIN\n IF md5(replace(pg_get_functiondef(to_regprocedure('private.may_review_completion(uuid,uuid,uuid,text)')),E'\\r\\n',E'\\n')) IS DISTINCT FROM '0a5447b901da2a393e07222d27d6e7e1'\n OR md5(replace(pg_get_functiondef(to_regprocedure('public.request_completion_review(text,text,uuid)')),E'\\r\\n',E'\\n')) IS DISTINCT FROM '63b3d6745ffb557047767c081593b378'\n OR md5(replace(pg_get_functiondef(to_regprocedure('public.approve_completion_review(uuid,boolean)')),E'\\r\\n',E'\\n')) IS DISTINCT FROM 'c10873495bdd3167c72956e05be938fa' THEN\n  RAISE EXCEPTION 'STAGING_REVIEW_SECURITY_VERSION_MISMATCH';\n END IF;\nEND $$;\n`;
writeFileSync("supabase/rollout/staging_completion_review_security_20261125.sql",guard+parts.join("\n")+"\nNOTIFY pgrst,'reload schema';\nCOMMIT;\n","utf8");
console.log("Prepared staging review security upgrade.");
