export type SubscriptionAccessInput = {
  subscription_status?: string | null;
  trial_ends_at?: string | null;
  is_active?: boolean | null;
} | null;

export type SubscriptionAccess = {
  allowed: boolean;
  reason: "active" | "trial" | "legacy" | "inactive" | "trial_expired" | "payment_required" | "invalid_status";
};

const paymentRequiredStatuses = new Set([
  "blocked",
  "past_due",
  "unpaid",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "paused",
  "pending_checkout",
]);

export function getSubscriptionAccess(
  subscription: SubscriptionAccessInput,
  now = Date.now(),
): SubscriptionAccess {
  // Existing churches created before subscriptions were introduced remain
  // accessible until a subscription row is provisioned for them.
  if (!subscription) return { allowed: true, reason: "legacy" };
  if (subscription.is_active === false) return { allowed: false, reason: "inactive" };

  const status = subscription.subscription_status?.trim().toLowerCase();
  if (!status) return { allowed: false, reason: "invalid_status" };
  if (paymentRequiredStatuses.has(status)) return { allowed: false, reason: "payment_required" };
  if (status === "active") return { allowed: true, reason: "active" };

  if (status === "trial") {
    const endsAt = subscription.trial_ends_at ? new Date(subscription.trial_ends_at).getTime() : Number.NaN;
    if (!Number.isFinite(endsAt) || endsAt <= now) {
      return { allowed: false, reason: "trial_expired" };
    }
    return { allowed: true, reason: "trial" };
  }

  return { allowed: false, reason: "invalid_status" };
}
