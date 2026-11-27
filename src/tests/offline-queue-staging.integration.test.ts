import "fake-indexeddb/auto";
import { afterAll, describe, expect, it, vi } from "vitest";

const bridge = vi.hoisted(() => ({ userId: process.env.CODEX_STAGING_USER ?? "" }));
vi.mock("@/integrations/supabase/client", async () => {
  if (process.env.CODEX_STAGING_HTTP === "1") {
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient("https://nuqwwlzklqdlnvqdbpjy.supabase.co", process.env.CODEX_STAGING_PUBLIC_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const login = await client.auth.signInWithPassword({
      email: process.env.CODEX_STAGING_EMAIL!, password: process.env.CODEX_STAGING_PASSWORD!,
      options: { captchaToken: "XXXX.DUMMY.TOKEN.XXXX" },
    });
    if (login.error || login.data.user?.id !== bridge.userId) throw new Error("Falha de autenticacao da conta de homologacao");
    const rpc = async (name: string, args: Record<string, unknown>) => {
      if (name === "test_read") {
        const result = await client.from("lesson_responses").select("response")
          .eq("user_id", bridge.userId).eq("lesson_id", args.p_lesson_id).eq("question_key", args.p_key).maybeSingle();
        return { data: result.data?.response ?? null, error: result.error };
      }
      return client.rpc(name, args);
    };
    return { supabase: { rpc, auth: { getUser: () => client.auth.getUser() } } };
  }
  const { spawn } = await import("node:child_process");
  const rpc = async (name: string, args: Record<string, unknown>) => new Promise<{ data: unknown; error: unknown }>((resolve, reject) => {
    const child = spawn(process.env.CODEX_PYTHON_BIN!, ["src/tests/staging_rpc_bridge.py"], { env: process.env });
    let output = "", errors = "";
    child.stdout.on("data", chunk => { output += chunk.toString(); });
    child.stderr.on("data", chunk => { errors += chunk.toString(); });
    child.on("error", reject);
    child.on("close", code => {
      if (code !== 0) reject(new Error(errors || "staging bridge failed"));
      else { try { resolve(JSON.parse(output)); } catch (error) { reject(error); } }
    });
    child.stdin.end(JSON.stringify({ name, args }));
  });
  return { supabase: { rpc, auth: { getUser: async () => ({ data: { user: { id: bridge.userId } } }) } } };
});
import { supabase } from "@/integrations/supabase/client";
import { enqueueStudentAction, getQueuedStudentActions, resolveOfflineConflict, syncStudentOfflineQueue } from "@/lib/studentOffline";

const enabled = process.env.CODEX_STAGING_INTEGRATION === "1";
const lesson = process.env.CODEX_STAGING_LESSON ?? "";

describe.skipIf(!enabled)("IndexedDB queue and staging database", () => {
  it("retains a stale answer, checks again on review and only then replaces it", async () => {
    const uid = bridge.userId;
    if (!uid || !lesson || (!process.env.CODEX_PYTHON_BIN && process.env.CODEX_STAGING_HTTP !== "1")) throw new Error("missing staging fixture");
    const key = `__codex_offline_${Date.now()}_${Math.random().toString(36).slice(2)}__`;
    await enqueueStudentAction({ type: "save_lesson_draft", userId: uid, payload: { lessonId: lesson, responses: { [key]: "rascunho offline" }, videoWatched: false, audioListened: false } });
    const legacy = await supabase.rpc("save_lesson_draft", { p_lesson_id: lesson, p_responses: { [key]: "versao antiga" }, p_video_watched: false, p_audio_listened: false });
    const enforceLegacyBlock = process.env.CODEX_STAGING_ENFORCE === "1";
    if (enforceLegacyBlock) {
      expect(legacy.error).toBeTruthy();
      expect(String((legacy.error as { message?: string }).message)).toContain("APP_UPDATE_REQUIRED");
    } else {
      expect(legacy.error).toBeNull();
    }
    const newer = await supabase.rpc("sync_offline_learning" as never, { p_kind: "save_lesson_draft", p_item_id: lesson, p_responses: { [key]: "outro aparelho" }, p_expected: enforceLegacyBlock ? {} : { [key]: "versao antiga" } } as never);
    expect(newer.error).toBeNull();
    expect((newer.data as { status: string }).status).toBe("synced");
    const result = await syncStudentOfflineQueue(uid);
    expect(result.conflict?.current[key]).toBe("outro aparelho");
    expect(await getQueuedStudentActions(uid)).toHaveLength(1);
    const latest = await supabase.rpc("sync_offline_learning" as never, { p_kind: "save_lesson_draft", p_item_id: lesson, p_responses: { [key]: "alterou novamente" }, p_expected: { [key]: "outro aparelho" } } as never);
    expect(latest.error).toBeNull();
    expect((latest.data as { status: string }).status).toBe("synced");
    const changedAgain = await resolveOfflineConflict(result.conflict!, "offline");
    expect(changedAgain?.current[key]).toBe("alterou novamente");
    expect(await getQueuedStudentActions(uid)).toHaveLength(1);
    expect(await resolveOfflineConflict(changedAgain!, "offline")).toBeNull();
    expect(await getQueuedStudentActions(uid)).toHaveLength(0);
    const verified = await supabase.rpc("test_read" as never, { p_lesson_id: lesson, p_key: key } as never);
    expect(verified.error).toBeNull();
    expect(verified.data).toBe("rascunho offline");

    // A missing server answer may have been deleted on another device. An
    // older queue entry without a baseline must not recreate it silently.
    const missingKey = `${key}_ausente`;
    await enqueueStudentAction({ type: "save_lesson_draft", userId: uid, payload: { lessonId: lesson, responses: { [missingKey]: "resposta antiga" }, videoWatched: false, audioListened: false } });
    const missing = await syncStudentOfflineQueue(uid);
    expect(missing.conflict).toBeTruthy();
    expect(missing.conflict?.current[missingKey]).toBeUndefined();
    expect(await getQueuedStudentActions(uid)).toHaveLength(1);
    const absent = await supabase.rpc("test_read" as never, { p_lesson_id: lesson, p_key: missingKey } as never);
    expect(absent.error).toBeNull();
    expect(absent.data).toBeNull();
    expect(await resolveOfflineConflict(missing.conflict!, "offline")).toBeNull();
    expect(await getQueuedStudentActions(uid)).toHaveLength(0);
  }, 90000);
});
