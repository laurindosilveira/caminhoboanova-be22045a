import { describe, expect, it } from "vitest";
import {
  findActionableDevotional,
  type ActivityPushDevotional,
  type ActivityPushEvent,
  type ActivityPushLesson,
} from "../../supabase/functions/_shared/activityPushEligibility";

const profile = {
  user_id: "user-1",
  church_id: "church-1",
  area: "Área 2",
  community: "Boa Nova",
  turma_id: "turma-2",
  enrollment_status: "approved",
};
const unlocks = [{
  course_id: "course-2",
  church_id: "church-1",
  area: "Área 2",
  turma_id: "turma-2",
  access_mode: "scheduled",
}];
const lessons: ActivityPushLesson[] = [
  { id: "lesson-4", course_id: "course-2", title: "Lição antiga", order_num: 4, devotional_mode: "10_days" },
  { id: "lesson-8", course_id: "course-2", title: "Relacionamentos saudáveis", order_num: 8, devotional_mode: "10_days" },
];
const devotionals: ActivityPushDevotional[] = [
  ...Array.from({ length: 10 }, (_, index) => ({
    id: `old-${index + 1}`,
    lesson_id: "lesson-4",
    day_number: index + 1,
    church_id: null,
  })),
  ...Array.from({ length: 10 }, (_, index) => ({
    id: `current-${index + 1}`,
    lesson_id: "lesson-8",
    day_number: index + 1,
    church_id: null,
  })),
];
const events: ActivityPushEvent[] = [
  {
    id: "old-event",
    church_id: "church-1",
    event_date: "2026-06-06T19:00:00Z",
    linked_lesson_id: "lesson-4",
    area: "Área 2",
    community: null,
    turma_id: null,
    target_user_id: null,
    type: "confirmatorio",
    released_devotional_days: null,
  },
  {
    id: "current-event",
    church_id: "church-1",
    event_date: "2026-08-01T19:00:00Z",
    linked_lesson_id: "lesson-8",
    area: "Área 2",
    community: null,
    turma_id: null,
    target_user_id: null,
    type: "confirmatorio",
    released_devotional_days: null,
  },
];

describe("activity push eligibility", () => {
  it("never reminds devotionals from an expired lesson", () => {
    const result = findActionableDevotional({
      profile,
      courseUnlocks: unlocks,
      events,
      lessons,
      devotionals,
      progress: [],
      now: new Date("2026-07-28T10:00:00Z"),
    });

    expect(result).toMatchObject({
      lessonId: "lesson-8",
      lessonOrder: 8,
      devotionalId: "current-7",
      mode: "scheduled",
    });
  });

  it("does not send anything when today's devotional is already complete", () => {
    const result = findActionableDevotional({
      profile,
      courseUnlocks: unlocks,
      events,
      lessons,
      devotionals,
      progress: [{
        user_id: "user-1",
        devotional_id: "current-7",
        completed_at: "2026-07-28T09:00:00Z",
        church_id: "church-1",
      }],
      now: new Date("2026-07-28T10:00:00Z"),
    });

    expect(result).toBeNull();
  });

  it("ignores events from another group", () => {
    const result = findActionableDevotional({
      profile,
      courseUnlocks: unlocks,
      events: events.map((event) => ({ ...event, turma_id: "turma-other", area: "Área 1" })),
      lessons,
      devotionals,
      progress: [],
      now: new Date("2026-07-28T10:00:00Z"),
    });

    expect(result).toBeNull();
  });

  it("does not notify a user who is still waiting for a group", () => {
    expect(findActionableDevotional({
      profile: { ...profile, turma_id: null },
      courseUnlocks: unlocks,
      events,
      lessons,
      devotionals,
      progress: [],
      now: new Date("2026-07-28T10:00:00Z"),
    })).toBeNull();
  });

  it("keeps a leader-room open course actionable without an Agenda event", () => {
    const openUnlocks = [{ ...unlocks[0], access_mode: "open" }];
    const result = findActionableDevotional({
      profile,
      courseUnlocks: openUnlocks,
      events: [],
      lessons: [lessons[1]],
      devotionals: devotionals.filter((item) => item.lesson_id === "lesson-8"),
      progress: [],
      now: new Date("2026-07-28T10:00:00Z"),
    });

    expect(result).toMatchObject({
      lessonId: "lesson-8",
      devotionalId: "current-1",
      mode: "open_access",
    });
  });
});
