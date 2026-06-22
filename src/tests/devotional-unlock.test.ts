import { describe, expect, it, vi } from "vitest";
import {
  computeDevotionalStatuses,
  type DevotionalItem,
} from "@/components/home/LessonChoiceView";
import { getStudyOpenLessonIds } from "@/hooks/useAgendaSchedule";

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

describe("overlapping lesson windows", () => {
  it("releases every lesson whose window is currently open", () => {
    const now = new Date(2026, 5, 22, 12, 0, 0);
    const entries = [
      {
        lessonId: "lesson-a",
        windowStart: new Date(2026, 5, 15),
        eventDate: new Date(2026, 5, 25, 19, 0, 0),
      },
      {
        lessonId: "lesson-b",
        windowStart: new Date(2026, 5, 18),
        eventDate: new Date(2026, 5, 27, 19, 0, 0),
      },
    ];

    expect(getStudyOpenLessonIds(entries, now)).toEqual(
      new Set(["lesson-a", "lesson-b"]),
    );
  });
});
