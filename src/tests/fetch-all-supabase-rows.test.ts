import { describe, expect, it, vi } from "vitest";
import { fetchAllSupabaseRows } from "@/lib/fetchAllSupabaseRows";

describe("fetchAllSupabaseRows", () => {
  it("reads every page when a query has more than one thousand rows", async () => {
    const source = Array.from({ length: 2_125 }, (_, index) => ({ id: index + 1 }));
    const fetchPage = vi.fn(async (from: number, to: number) => ({
      data: source.slice(from, to + 1),
      error: null,
    }));

    const result = await fetchAllSupabaseRows(fetchPage);

    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(2_125);
    expect(result.data?.at(0)?.id).toBe(1);
    expect(result.data?.at(-1)?.id).toBe(2_125);
    expect(fetchPage).toHaveBeenNthCalledWith(1, 0, 999);
    expect(fetchPage).toHaveBeenNthCalledWith(2, 1_000, 1_999);
    expect(fetchPage).toHaveBeenNthCalledWith(3, 2_000, 2_999);
  });

  it("stops immediately and preserves the database error", async () => {
    const fetchPage = vi.fn(async () => ({
      data: null,
      error: { message: "consulta indisponível" },
    }));

    const result = await fetchAllSupabaseRows(fetchPage);

    expect(result).toEqual({
      data: null,
      error: { message: "consulta indisponível" },
    });
    expect(fetchPage).toHaveBeenCalledOnce();
  });

  it("supports an empty result", async () => {
    const result = await fetchAllSupabaseRows(async () => ({
      data: [],
      error: null,
    }));

    expect(result).toEqual({ data: [], error: null });
  });
});
