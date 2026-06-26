import { describe, expect, it } from "vitest";
import {
  INVALID_LOGIN_CREDENTIALS_MESSAGE,
  classifyLoginDiagnostic,
  formatLoginDiagnostic,
  getPasswordLoginErrorMessage,
} from "@/lib/loginDiagnostics";

describe("login diagnostic classification", () => {
  it("identifies an offline device first", () => {
    expect(classifyLoginDiagnostic({
      online: false,
      appReachable: false,
      supabaseReachable: false,
      timedOut: false,
    })).toBe("OFFLINE");
  });

  it("distinguishes the app origin from the Supabase endpoint", () => {
    expect(classifyLoginDiagnostic({
      online: true,
      appReachable: false,
      supabaseReachable: true,
      timedOut: false,
    })).toBe("APP_UNREACHABLE");

    expect(classifyLoginDiagnostic({
      online: true,
      appReachable: true,
      supabaseReachable: false,
      timedOut: false,
    })).toBe("SUPABASE_UNREACHABLE");
  });

  it("identifies an auth timeout when both probes respond", () => {
    expect(classifyLoginDiagnostic({
      online: true,
      appReachable: true,
      supabaseReachable: true,
      timedOut: true,
    })).toBe("AUTH_TIMEOUT");
  });

  it("keeps an auth-specific failure when connectivity is healthy", () => {
    expect(classifyLoginDiagnostic({
      online: true,
      appReachable: true,
      supabaseReachable: true,
      timedOut: false,
    })).toBe("AUTH_REQUEST_FAILED");
  });
});

describe("login diagnostic report", () => {
  it("formats a report without credentials", () => {
    const report = formatLoginDiagnostic({
      code: "SUPABASE_UNREACHABLE",
      timestamp: "2026-06-22T12:00:00.000Z",
      online: true,
      app: { ok: true, status: 200, error: null },
      supabase: { ok: false, status: null, error: "TypeError: Failed to fetch" },
      authError: "AuthRetryableFetchError: Failed to fetch",
      appVersion: "1.0.0",
      buildDate: "2026-06-22T11:55:00.000Z",
      userAgent: "Test Browser",
    });

    expect(report).toContain("SUPABASE_UNREACHABLE");
    expect(report).toContain("Site: respondeu (HTTP 200)");
    expect(report).toContain("Supabase: falhou");
    expect(report).toContain("Build: 2026-06-22T11:55:00.000Z");
    expect(report).not.toContain("senha");
  });
});

describe("password login error messages", () => {
  it("shows a clear message for invalid credentials returned by message", () => {
    expect(getPasswordLoginErrorMessage({
      message: "Invalid login credentials",
      status: 400,
    })).toBe(INVALID_LOGIN_CREDENTIALS_MESSAGE);
  });

  it("shows a clear message for invalid credentials returned by auth code", () => {
    expect(getPasswordLoginErrorMessage({
      message: "Bad request",
      code: "invalid_credentials",
      status: 400,
    })).toBe(INVALID_LOGIN_CREDENTIALS_MESSAGE);
  });

  it("keeps unknown password login errors available for generic handling", () => {
    expect(getPasswordLoginErrorMessage({ message: "Unexpected auth failure" })).toBeNull();
  });
});
