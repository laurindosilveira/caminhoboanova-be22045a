"""Check guarded and legacy devotional completion using staging fixtures."""
import json, os, psycopg
from psycopg.types.json import Jsonb
uid=os.environ["CODEX_LOCK_USER"]; dev=os.environ["CODEX_TEST_DEVOTIONAL"]
conn=psycopg.connect(host="db.nuqwwlzklqdlnvqdbpjy.supabase.co",dbname="postgres",user=os.environ["CODEX_PG_ROLE"],password=os.environ["CODEX_PG_PASSWORD"],sslmode="require",connect_timeout=8,autocommit=True)
conn.execute("SET ROLE authenticated"); conn.execute("SELECT set_config('request.jwt.claim.sub',%s,false)",(uid,)); conn.autocommit=False
answers={str(i):"synthetic-new" for i in range(50)}
r=conn.execute("SELECT public.sync_offline_learning('complete_devotional',%s::uuid,%s::jsonb,false,false,false,NULL,NULL,%s::jsonb)",(dev,Jsonb(answers),Jsonb({}))).fetchone()[0]; conn.commit()
try:
    conn.execute("SELECT public.complete_devotional(%s::uuid,%s::jsonb,false,NULL,NULL)",(dev,Jsonb({str(i):"synthetic-old" for i in range(50)})))
    conn.commit(); legacy="unexpected_success"
except psycopg.Error as e:
    conn.rollback(); legacy="blocked" if "APP_UPDATE_REQUIRED" in str(e) else "unexpected_error:"+str(e).splitlines()[0]
current=conn.execute("SELECT response FROM public.devotional_responses WHERE user_id=auth.uid() AND devotional_id=%s::uuid AND question_index=0",(dev,)).fetchone()
conn.close(); print(json.dumps({"guarded_status":r["status"],"legacy":legacy,"new_answer_preserved":bool(current and current[0]=="synthetic-new")}))
