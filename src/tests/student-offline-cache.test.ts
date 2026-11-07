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
});
