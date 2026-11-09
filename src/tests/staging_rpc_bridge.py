"""Test-only bridge to staging Postgres; never accepts a host argument."""
import json, os, sys, uuid
import psycopg
from psycopg.types.json import Jsonb

uid = str(uuid.UUID(os.environ["CODEX_STAGING_USER"]))
req = json.load(sys.stdin)
args = req["args"]
role = os.environ["CODEX_PG_ROLE"]
password = os.environ["CODEX_PG_PASSWORD"]
try:
    with psycopg.connect(host="db.nuqwwlzklqdlnvqdbpjy.supabase.co", dbname="postgres", user=role, password=password, sslmode="require", connect_timeout=8) as conn:
        conn.execute("SET LOCAL ROLE authenticated")
        conn.execute("SELECT set_config('request.jwt.claim.sub', %s, true)", (uid,))
        if req["name"] == "save_lesson_draft":
            row = conn.execute("SELECT public.save_lesson_draft(%s::uuid,%s::jsonb,%s,%s)", (args["p_lesson_id"],Jsonb(args["p_responses"]),args["p_video_watched"],args["p_audio_listened"])).fetchone()
        elif req["name"] == "sync_offline_learning":
            row = conn.execute("SELECT public.sync_offline_learning(%s,%s::uuid,%s::jsonb,%s,%s,%s,%s,%s::uuid,%s::jsonb)", (args["p_kind"],args["p_item_id"],Jsonb(args["p_responses"]),args.get("p_video_watched",False),args.get("p_audio_listened",False),args.get("p_is_recovery",False),args.get("p_awarded_points"),args.get("p_override_release_id"),Jsonb(args["p_expected"]) if args.get("p_expected") is not None else None)).fetchone()
        elif req["name"] == "test_read":
            row = conn.execute("SELECT response FROM public.lesson_responses WHERE user_id=auth.uid() AND lesson_id=%s::uuid AND question_key=%s", (args["p_lesson_id"],args["p_key"])).fetchone()
        else:
            raise ValueError("unexpected test request")
        print(json.dumps({"data": row[0] if row else None, "error": None}))
except Exception as exc:
    print(json.dumps({"data": None, "error": {"message": str(exc)}}))
