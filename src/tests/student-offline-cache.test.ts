import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cachedStudentQuery,
  invalidateCachedStudentQueries,
} from "@/lib/studentOffline";

describe("cachedStudentQuery live cache", () => {
  beforeEach(() => {
    invalidateCachedStudentQueries();
  });

  it("reuses a recent successful query", async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: ["lesson-1"] });

    const first = await cachedStudentQuery("test:recent", fetcher, [] as string[]);
    const second = await cachedStudentQuery("test:recent", fetcher, [] as string[]);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(first).toEqual({ data: ["lesson-1"], fromCache: false });
    expect(second).toEqual({ data: ["lesson-1"], fromCache: true });
  });

  it("deduplicates concurrent requests for the same key", async () => {
    let resolveFetch: ((value: { data: string[] }) => void) | undefined;
    const fetcher = vi.fn(
      () => new Promise<{ data: string[] }>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const first = cachedStudentQuery("test:pending", fetcher, [] as string[]);
    const second = cachedStudentQuery("test:pending", fetcher, [] as string[]);
    resolveFetch?.({ data: ["shared"] });

    await expect(first).resolves.toEqual({ data: ["shared"], fromCache: false });
    await expect(second).resolves.toEqual({ data: ["shared"], fromCache: false });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("allows an explicit refresh to bypass the live cache", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ data: ["old"] })
      .mockResolvedValueOnce({ data: ["fresh"] });

    await cachedStudentQuery("test:force", fetcher, [] as string[]);
    const refreshed = await cachedStudentQuery("test:force", fetcher, [] as string[], { force: true });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(refreshed).toEqual({ data: ["fresh"], fromCache: false });
  });

  it("does not let a late older response replace a newer forced refresh", async () => {
    let finishOld!: (result: { data: string[] }) => void;
    const old = cachedStudentQuery("test:race", () => new Promise<{ data: string[] }>(resolve => { finishOld = resolve; }), [] as string[]);
    const fresh = await cachedStudentQuery("test:race", async () => ({ data:["new"] }), [] as string[], { force:true });
    finishOld({ data:["old"] }); await old;
    const cached = await cachedStudentQuery("test:race", async () => ({ data:["unexpected"] }), [] as string[]);
    expect(fresh.data).toEqual(["new"]); expect(cached.data).toEqual(["new"]);
  });

  it("does not clear a newer in-flight request when the earlier request finishes", async () => {
    let finishOld!: (result: { data: string[] }) => void;
    let finishNew!: (result: { data: string[] }) => void;
    const old=cachedStudentQuery("test:inflight", () => new Promise<{ data: string[] }>(resolve => { finishOld=resolve; }), [] as string[]);
    const newFetcher=vi.fn(() => new Promise<{data:string[]}>(resolve => { finishNew=resolve; }));
    const fresh=cachedStudentQuery("test:inflight", newFetcher, [] as string[], { force:true });
    finishOld({data:["old"]}); await old;
    const duplicate=cachedStudentQuery("test:inflight", newFetcher, [] as string[]);
    expect(newFetcher).toHaveBeenCalledTimes(1);
    finishNew({data:["new"]});
    expect((await fresh).data).toEqual(["new"]); expect((await duplicate).data).toEqual(["new"]);
  });

  it("does not repopulate an invalidated cache with an earlier request", async () => {
    let finishOld!: (result: { data: string[] }) => void;
    const old=cachedStudentQuery("test:invalidate", () => new Promise<{ data: string[] }>(resolve => { finishOld=resolve; }), [] as string[]);
    invalidateCachedStudentQueries("test:invalidate");
    const fresh=await cachedStudentQuery("test:invalidate", async () => ({data:["new"]}), [] as string[]);
    finishOld({data:["old"]}); await old;
    const cached=await cachedStudentQuery("test:invalidate", async () => ({data:["unexpected"]}), [] as string[]);
    expect(fresh.data).toEqual(["new"]); expect(cached.data).toEqual(["new"]);
  });
});
