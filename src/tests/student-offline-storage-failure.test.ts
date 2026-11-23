import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { enqueueStudentAction, getQueuedStudentActions } from "@/lib/studentOffline";

afterEach(() => vi.unstubAllGlobals());

describe("offline queue storage failure", () => {
  it("reports an unreadable queue and retries when storage becomes available", async () => {
    const working = globalThis.indexedDB;
    vi.stubGlobal("indexedDB", { open: () => { throw new Error("storage unavailable"); } });
    await expect(getQueuedStudentActions("storage-test", { strict:true })).rejects.toThrow("storage unavailable");
    expect(await getQueuedStudentActions("storage-test")).toEqual([]);
    vi.stubGlobal("indexedDB", working);
    await enqueueStudentAction({ type:"save_lesson_draft", userId:"storage-test", payload:{ lessonId:"fixture", responses:{ q:"texto fictício" }, videoWatched:false, audioListened:false } });
    expect(await getQueuedStudentActions("storage-test", { strict:true })).toHaveLength(1);
  });
});
