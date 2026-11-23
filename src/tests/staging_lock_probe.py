"""Run only on staging with a disposable database role and synthetic user."""
import concurrent.futures
import json
import os
import statistics
import threading
import time
import psycopg
from psycopg.types.json import Jsonb

HOST = "db.nuqwwlzklqdlnvqdbpjy.supabase.co"
user = os.environ["CODEX_LOCK_USER"]
lessons = json.loads(os.environ["CODEX_LOCK_FIXTURES"])

def connect():
    conn = psycopg.connect(host=HOST, dbname="postgres", user=os.environ["CODEX_PG_ROLE"], password=os.environ["CODEX_PG_PASSWORD"], sslmode="require", connect_timeout=8, autocommit=True)
    conn.execute("SET ROLE authenticated")
    conn.execute("SELECT set_config('request.jwt.claim.sub', %s, false)", (user,))
    conn.autocommit = False
    return conn

def sample(guarded, n):
    connections = [connect() for _ in range(n)]
    barrier = threading.Barrier(n)
    def worker(i):
        c = connections[i]
        payload = Jsonb({f"__codex_concurrency_{guarded}_{i}__": "synthetic"})
        barrier.wait(timeout=15)
        start = time.monotonic()
        if guarded:
            result = c.execute("SELECT public.sync_offline_learning('save_lesson_draft', %s::uuid, %s::jsonb)", (lessons[i], payload)).fetchone()[0]
            if result["status"] != "synced": raise RuntimeError("unexpected conflict")
        else:
            c.execute("SELECT public.save_lesson_draft(%s::uuid, %s::jsonb, false, false)", (lessons[i], payload))
        c.commit()
        return round((time.monotonic()-start)*1000, 1)
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=n) as pool:
            values = list(pool.map(worker, range(n)))
        return {"n": n, "median_ms": round(statistics.median(values), 1), "max_ms": max(values), "values_ms": sorted(values)}
    finally:
        for c in connections: c.close()

def forced_wait():
    holder, writer = connect(), connect()
    try:
        holder.execute("SELECT public.sync_offline_learning('save_lesson_draft', %s::uuid, %s::jsonb)", (lessons[0], Jsonb({"__codex_hold__": "test"}))).fetchone()
        started = threading.Event()
        def write_other_lesson():
            started.set()
            start = time.monotonic()
            writer.execute("SELECT public.save_lesson_draft(%s::uuid, %s::jsonb, false, false)", (lessons[1], Jsonb({"__codex_wait__": "test"})))
            writer.commit()
            return round((time.monotonic()-start)*1000, 1)
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(write_other_lesson)
            started.wait(5)
            time.sleep(1.5)
            blocked = not future.done()
            holder.commit()
            elapsed = future.result(timeout=15)
        return {"blocked_while_held": blocked, "writer_wait_ms": elapsed, "held_ms": 1500}
    finally:
        holder.close()
        writer.close()

if __name__ == "__main__":
    result = {"direct": sample(False,8), "guarded": sample(True,8), "held_transaction": forced_wait()}
    print(json.dumps(result))
