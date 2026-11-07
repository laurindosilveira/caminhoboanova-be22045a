import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc } }));
import { syncLearningAction, type StudentOfflineAction } from "@/lib/studentOffline";

const action: Extract<StudentOfflineAction, { type: "save_lesson_draft" }> = {
  id: "draft-1", type: "save_lesson_draft", userId: "user-1", createdAt: "2026-01-01T00:00:00Z",
  payload: { lessonId: "lesson-1", responses: { q0: "resposta anterior" }, videoWatched: false, audioListened: false },
};

describe("offline response conflicts", () => {
  beforeEach(() => rpc.mockReset());
  it("keeps the pending action when the server reports a conflict", async () => {
    rpc.mockResolvedValue({ data: { status: "conflict", current: { q0: "mais recente" } }, error: null });
    expect(await syncLearningAction(action)).toEqual({ action, current: { q0: "mais recente" } });
    expect(rpc.mock.calls[0][1].p_expected).toBeNull();
  });
  it("sends the exact version reviewed by the user", async () => {
    rpc.mockResolvedValue({ data: { status: "synced" }, error: null });
    expect(await syncLearningAction(action, { q0: "mais recente" })).toBeNull();
    expect(rpc.mock.calls[0][1].p_expected).toEqual({ q0: "mais recente" });
  });
  it("fails closed when the guard is unavailable", async () => {
    rpc.mockResolvedValue({ data: null, error: new Error("offline") });
    await expect(syncLearningAction(action)).rejects.toThrow("offline");
  });
});
