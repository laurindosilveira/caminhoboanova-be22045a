import { describe, expect, it } from "vitest";
import {
  AUTH_EMAIL_RATE_LIMIT_MESSAGE,
  getAuthEmailFlowErrorMessage,
  isAuthRateLimitError,
} from "@/lib/authErrorMessages";

describe("auth email flow error messages", () => {
  it("recognizes Supabase Auth email rate limit responses", () => {
    expect(isAuthRateLimitError({
      message: "Email rate limit exceeded",
      status: 429,
    })).toBe(true);

    expect(getAuthEmailFlowErrorMessage({
      message: "Too many requests",
      code: "over_email_send_rate_limit",
    }, "Erro ao criar conta")).toBe(AUTH_EMAIL_RATE_LIMIT_MESSAGE);
  });

  it("keeps unknown auth errors visible with the flow context", () => {
    expect(getAuthEmailFlowErrorMessage({
      message: "Unexpected auth failure",
    }, "Erro ao enviar email")).toBe("Erro ao enviar email: Unexpected auth failure");
  });
});
