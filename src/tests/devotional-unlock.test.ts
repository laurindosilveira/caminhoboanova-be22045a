import { describe, expect, it, vi } from "vitest";
import {
  computeDevotionalStatuses,
  type DevotionalItem,
} from "@/components/home/LessonChoiceView";
import {
  getEffectiveDevotionalDates,
  getStudyOpenLessonIds,
} from "@/hooks/useAgendaSchedule";

function devotional(id: string, day: number): DevotionalItem {
  return {
    id,
    lesson_id: "lesson-1",
    day_number: day,
    title: `Dia ${day}`,
    bible_text: "",
    bible_reference: "",
    reflection: "",
    prayer: "",
    practice: "",
    questions: [],
  };
}

describe("devotional daily release", () => {
  it("keeps today's devotional available after another devotional was completed today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 22, 12, 0, 0));

    const devotionals = [devotional("recovery", 1), devotional("today", 2)];
    const completed = new Map([
      ["recovery", new Date(2026, 5, 22, 9, 0, 0).toISOString()],
    ]);
    const scheduledDates = [
      new Date(2026, 5, 19),
      new Date(2026, 5, 22),
    ];

    const result = computeDevotionalStatuses(
      devotionals,
      completed,
      new Set(["recovery"]),
      scheduledDates,
      "10_days",
      null,
      new Map(),
    );

    expect(result.statuses.get("recovery")).toBe("completed");
    expect(result.statuses.get("today")).toBe("available");
    expect(result.lockedSet.has("today")).toBe(false);

    vi.useRealTimers();
  });
});

describe("weekly lesson windows", () => {
  it("starts an auto-limited weekly lesson on the final 5 business days before the event", () => {
    const dates = getEffectiveDevotionalDates(
      new Date(2026, 6, 11, 19, 0, 0),
      true,
    );

    expect(dates.map((date) => date.toLocaleDateString("pt-BR"))).toEqual([
      "06/07/2026",
      "07/07/2026",
      "08/07/2026",
      "09/07/2026",
      "10/07/2026",
    ]);
  });

  it("keeps the following weekly lesson locked until its 5-day window starts", () => {
    const now = new Date(2026, 6, 1, 12, 0, 0);
    const lessonSevenDates = getEffectiveDevotionalDates(
      new Date(2026, 6, 11, 19, 0, 0),
      true,
    );
    const entries = [
      {
        lessonId: "lesson-6",
        windowStart: new Date(2026, 5, 22),
        eventDate: new Date(2026, 6, 4, 19, 0, 0),
      },
      {
        lessonId: "lesson-7",
        windowStart: lessonSevenDates[0],
        eventDate: new Date(2026, 6, 11, 19, 0, 0),
      },
    ];

    expect(getStudyOpenLessonIds(entries, now)).toEqual(
      new Set(["lesson-6"]),
    );
  });
});
