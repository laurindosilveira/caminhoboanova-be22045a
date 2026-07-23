import { describe, expect, it } from "vitest";
import { calculateScheduledDevotionalStreak } from "@/lib/devotionalStreak";

const schedule = [
  { dateKey: "2026-07-01", devotionalId: "d1" },
  { dateKey: "2026-07-02", devotionalId: "d2" },
  { dateKey: "2026-07-20", devotionalId: "d3" },
];

describe("scheduled devotional streak", () => {
  it("freezes across weeks without scheduled devotionals", () => {
    const result = calculateScheduledDevotionalStreak(schedule, [
      { devotional_id: "d1", completed_at: "2026-07-01T10:00:00-03:00" },
      { devotional_id: "d2", completed_at: "2026-07-02T10:00:00-03:00" },
    ], new Date("2026-07-15T12:00:00-03:00"));

    expect(result.streakDays).toBe(2);
    expect(result.frozen).toBe(true);
  });

  it("does not erase the streak while today's devotional is still open", () => {
    const result = calculateScheduledDevotionalStreak(schedule, [
      { devotional_id: "d1", completed_at: "2026-07-01T10:00:00-03:00" },
      { devotional_id: "d2", completed_at: "2026-07-02T10:00:00-03:00" },
    ], new Date("2026-07-20T12:00:00-03:00"));

    expect(result.streakDays).toBe(2);
    expect(result.atRisk).toBe(true);
  });

  it("resets after a scheduled day is missed", () => {
    const result = calculateScheduledDevotionalStreak(schedule, [
      { devotional_id: "d1", completed_at: "2026-07-01T10:00:00-03:00" },
      { devotional_id: "d2", completed_at: "2026-07-02T10:00:00-03:00" },
    ], new Date("2026-07-21T12:00:00-03:00"));

    expect(result.streakDays).toBe(0);
  });

  it("does not restore a streak with a late recovery completion", () => {
    const result = calculateScheduledDevotionalStreak(schedule, [
      { devotional_id: "d3", completed_at: "2026-07-21T10:00:00-03:00", is_recovery: true },
    ], new Date("2026-07-22T12:00:00-03:00"));

    expect(result.streakDays).toBe(0);
  });
});
