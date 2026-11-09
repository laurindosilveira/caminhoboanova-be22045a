"""Concurrency probe for the staging-only per-item guard. Synthetic fixtures only."""
import concurrent.futures
import json
import os
import statistics
import threading
import time
import uuid
import psycopg
from psycopg.types.json import Jsonb

HOST="db.nuqwwlzklqdlnvqdbpjy.supabase.co"
USER=os.environ["CODEX_LOCK_USER"]
OTHER=os.environ["CODEX_LOCK_OTHER_USER"]
LESSONS=json.loads(os.environ["CODEX_LOCK_FIXTURES"])

def connect(uid=USER):
    c=psycopg.connect(host=HOST,dbname="postgres",user=os.environ["CODEX_PG_ROLE"],password=os.environ["CODEX_PG_PASSWORD"],sslmode="require",connect_timeout=8,autocommit=True)
    c.execute("SET ROLE authenticated")
    c.execute("SELECT set_config('request.jwt.claim.sub',%s,false)",(uid,))
    c.autocommit=False
    return c

def call_guard(c,lesson,key):
    result=c.execute("SELECT public.sync_offline_learning('save_lesson_draft',%s::uuid,%s::jsonb)",(lesson,Jsonb({key:"synthetic"}))).fetchone()[0]
    if result["status"] != "synced": raise RuntimeError("unexpected conflict")

def sample(same,n):
    connections=[connect() for _ in range(n)]
    barrier=threading.Barrier(n)
    def worker(i):
        c=connections[i]; barrier.wait(timeout=15); start=time.monotonic()
        call_guard(c,LESSONS[0] if same else LESSONS[i],f"__item_probe_{same}_{i}__")
        c.commit(); return round((time.monotonic()-start)*1000,1)
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=n) as pool: values=list(pool.map(worker,range(n)))
        return {"n":n,"median_ms":round(statistics.median(values),1),"max_ms":max(values),"values_ms":sorted(values)}
    finally:
        for c in connections: c.close()

def held_case(mode):
    holder=connect(); writer=connect(OTHER if mode=="other_user" else USER)
    try:
        call_guard(holder,LESSONS[0],"__item_holder__")
        started=threading.Event()
        def write():
            started.set(); start=time.monotonic()
            target=LESSONS[1] if mode in ("other_lesson", "legacy_other_lesson") else LESSONS[0]
            if mode.startswith("legacy"):
                try:
                    writer.execute("SELECT public.save_lesson_draft(%s::uuid,%s::jsonb,false,false)",(target,Jsonb({"__legacy_probe__":"old"})))
                    writer.commit(); outcome="unexpected_success"
                except psycopg.Error as e:
                    writer.rollback(); outcome="rejected" if "APP_UPDATE_REQUIRED" in str(e) else "unexpected_error"
            else:
                call_guard(writer,target,"__item_waiter__"); writer.commit(); outcome="synced"
            return {"elapsed_ms":round((time.monotonic()-start)*1000,1),"outcome":outcome}
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            f=pool.submit(write); started.wait(5); time.sleep(1.5); pending=not f.done(); holder.commit(); result=f.result(timeout=15)
        return {"pending_after_1500ms":pending, **result}
    finally: holder.close(); writer.close()

def same_field_race():
    connections=[connect(),connect()]; barrier=threading.Barrier(2)
    key="__race_"+uuid.uuid4().hex+"__"
    def writer(i):
        c=connections[i]; barrier.wait(timeout=15)
        result=c.execute("SELECT public.sync_offline_learning('save_lesson_draft',%s::uuid,%s::jsonb,false,false,false,NULL,NULL,%s::jsonb)",(LESSONS[0],Jsonb({key:f"value-{i}"}),Jsonb({}))).fetchone()[0]
        c.commit(); return result["status"]
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: statuses=list(pool.map(writer,range(2)))
        return {"statuses":sorted(statuses),"correct":sorted(statuses)==["conflict","synced"]}
    finally:
        for c in connections: c.close()

if __name__=="__main__":
    print(json.dumps({"different_lessons":sample(False,8),"same_lesson":sample(True,8),"held_other_lesson":held_case("other_lesson"),"held_other_user":held_case("other_user"),"held_same_lesson":held_case("same_lesson"),"held_legacy_same_lesson":held_case("legacy_same"),"held_legacy_other_lesson":held_case("legacy_other_lesson"),"same_field_race":same_field_race()}))
