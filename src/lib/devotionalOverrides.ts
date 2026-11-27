export type DevotionalOverrideWindow = {
  devotional_id: string;
  available_from: string | null;
  available_until: string | null;
  is_unlocked: boolean;
};

export function isDevotionalOverrideActive(
  override: DevotionalOverrideWindow | undefined,
  now: Date,
) {
  if (!override || !override.is_unlocked) return false;
  if (override.available_from && new Date(override.available_from) > now) return false;
  if (override.available_until && new Date(override.available_until) < now) return false;
  return true;
}

export function buildActiveDevotionalOverrideMap<T extends DevotionalOverrideWindow>(
  overrides: readonly T[],
  now: Date,
) {
  const activeOverrides = new Map<string, T>();

  overrides.forEach((override) => {
    if (isDevotionalOverrideActive(override, now)) {
      activeOverrides.set(override.devotional_id, override);
    }
  });

  return activeOverrides;
}
