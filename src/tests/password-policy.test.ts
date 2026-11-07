import { describe, expect, it } from "vitest";
import { getPasswordPolicyError, strongPasswordSchema } from "@/lib/passwordPolicy";

describe("password policy", () => {
  it("accepts a long password with letters and numbers", () => {
    expect(strongPasswordSchema.safeParse("Caminho2026").success).toBe(true);
  });

  it("rejects short or single-category passwords", () => {
    expect(getPasswordPolicyError("abc123")).not.toBeNull();
    expect(getPasswordPolicyError("somenteletras")).not.toBeNull();
    expect(getPasswordPolicyError("1234567890")).not.toBeNull();
  });
});
