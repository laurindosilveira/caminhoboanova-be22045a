"""Verify legacy own-answer writes are rejected in staging."""
import json, os, psycopg
from psycopg.types.json import Jsonb
lesson=json.loads(os.environ["CODEX_LOCK_FIXTURES"])[0]
uid=os.environ["CODEX_LOCK_USER"]
conn=psycopg.connect(host="db.nuqwwlzklqdlnvqdbpjy.supabase.co",dbname="postgres",user=os.environ["CODEX_PG_ROLE"],password=os.environ["CODEX_PG_PASSWORD"],sslmode="require",connect_timeout=8,autocommit=True)
conn.execute("SET ROLE authenticated")
conn.execute("SELECT set_config('request.jwt.claim.sub',%s,false)",(uid,))
conn.autocommit=False
answers={"icebreaker":"test","practice":"test","prayer":"test",**{f"q{i}":"test" for i in range(50)}}
checks={}
for name,query,params in [
 ("legacy_draft", "SELECT public.save_lesson_draft(%s::uuid,%s::jsonb,false,false)", (lesson,Jsonb(answers))),
 ("legacy_complete", "SELECT public.complete_lesson(%s::uuid,%s::jsonb,true,true,NULL,NULL)", (lesson,Jsonb(answers))),
 ("marker_forgery", "INSERT INTO private.learning_write_guard(transaction_id,user_id,item_kind,item_id) VALUES (txid_current(),%s::uuid,'lesson',%s::uuid)", (uid,lesson)),
]:
    try:
        conn.execute(query,params); conn.rollback(); checks[name]="unexpected_success"
    except psycopg.Error as e:
        conn.rollback(); checks[name]="blocked" if ("APP_UPDATE_REQUIRED" in str(e) or e.sqlstate=="42501") else "unexpected_error:"+str(e).splitlines()[0]
conn.close()
print(json.dumps(checks))
