import { describe, expect, it, vi } from "vitest";
import { ignoreAsyncError } from "@/lib/safeAsync";

describe("ignoreAsyncError", () => {
  it("accepts a thenable without a catch method", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const thenable: PromiseLike<unknown> = {
      then: (_onFulfilled, onRejected) => {
        onRejected?.(new Error("audit failed"));
        return Promise.resolve();
      },
    };

    expect(() => ignoreAsyncError(thenable, "Audit test")).not.toThrow();

    await vi.waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        "[Audit test]",
        expect.objectContaining({ message: "audit failed" }),
      );
    });

    consoleError.mockRestore();
  });
});
