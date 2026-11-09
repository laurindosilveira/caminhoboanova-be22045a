import { describe, expect, it } from "vitest";
import { getPasswordRecoveryRedirect, isPasswordRecoveryUrl } from "@/lib/passwordRecoveryRedirect";

describe("Password recovery redirect detection", () => {
  it("detects recovery links that arrive with tokens in the hash", () => {
    expect(isPasswordRecoveryUrl("/login", "", "#access_token=abc&type=recovery")).toBe(true);
    expect(getPasswordRecoveryRedirect("/login", "", "#access_token=abc&type=recovery")).toBe(
      "/redefinir-senha#access_token=abc&type=recovery"
    );
  });

  it("detects recovery links that arrive on login with a code", () => {
    expect(isPasswordRecoveryUrl("/login", "?code=abc", "")).toBe(true);
    expect(getPasswordRecoveryRedirect("/login", "?code=abc", "")).toBe("/redefinir-senha?code=abc");
  });

  it("does not redirect when already on the reset password route", () => {
    expect(getPasswordRecoveryRedirect("/redefinir-senha", "?code=abc", "")).toBeNull();
    expect(isPasswordRecoveryUrl("/redefinir-senha", "?code=abc", "")).toBe(true);
  });

  it("does not treat an invited first-access PKCE code as password recovery", () => {
    expect(isPasswordRecoveryUrl("/primeiro-acesso", "?code=invite-code", "")).toBe(false);
    expect(getPasswordRecoveryRedirect("/primeiro-acesso", "?code=invite-code", "")).toBeNull();
  });

  it("does not treat normal public routes as recovery links", () => {
    expect(isPasswordRecoveryUrl("/login", "", "")).toBe(false);
    expect(getPasswordRecoveryRedirect("/apresentacao", "", "")).toBeNull();
  });
});
