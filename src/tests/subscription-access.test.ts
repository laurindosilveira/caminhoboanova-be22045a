import { describe, expect, it } from "vitest";
import { getSubscriptionAccess } from "@/lib/subscriptionAccess";

const now = Date.parse("2026-07-21T12:00:00.000Z");

describe("getSubscriptionAccess", () => {
  it("keeps legacy churches without a subscription row accessible", () => {
    expect(getSubscriptionAccess(null, now)).toEqual({ allowed: true, reason: "legacy" });
  });

  it.each(["blocked", "past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "paused", "pending_checkout"])(
    "blocks %s subscriptions",
    (subscription_status) => {
      expect(getSubscriptionAccess({ subscription_status, is_active: true }, now).allowed).toBe(false);
    },
  );

  it("allows active subscriptions", () => {
    expect(getSubscriptionAccess({ subscription_status: "active", is_active: true }, now).allowed).toBe(true);
  });

  it("allows a current trial and blocks an expired trial", () => {
    expect(getSubscriptionAccess({ subscription_status: "trial", trial_ends_at: "2026-07-22T12:00:00.000Z", is_active: true }, now).allowed).toBe(true);
    expect(getSubscriptionAccess({ subscription_status: "trial", trial_ends_at: "2026-07-20T12:00:00.000Z", is_active: true }, now)).toEqual({ allowed: false, reason: "trial_expired" });
  });

  it("blocks inactive and unknown subscription records", () => {
    expect(getSubscriptionAccess({ subscription_status: "active", is_active: false }, now).allowed).toBe(false);
    expect(getSubscriptionAccess({ subscription_status: "unexpected", is_active: true }, now).allowed).toBe(false);
  });
});
