import { describe, expect, it } from "vitest";
import { resolveJourneyFocus } from "@/lib/journeyFocus";

const course = {
  id: "course-2",
  order_num: 2,
  lessons: Array.from({ length: 8 }, (_, index) => ({
    id: `lesson-${index + 1}`,
    order_num: index + 1,
  })),
};

describe("resolveJourneyFocus", () => {
  it("uses the lesson currently in force in the Agenda instead of the first incomplete lesson", () => {
    const currentEntry = {
      courseId: course.id,
      lessonId: "lesson-8",
      eventDate: new Date("2026-08-01T19:00:00Z"),
    };

    expect(resolveJourneyFocus({
      courses: [course],
      unlockedCourseIds: new Set([course.id]),
      openAccessCourseIds: new Set(),
      fullyCompletedLessonIds: new Set(["lesson-1", "lesson-2"]),
      currentAgendaEntry: currentEntry,
      schedule: [currentEntry],
      now: new Date("2026-07-26T21:00:00Z"),
    })).toEqual({
      courseId: "course-2",
      lessonId: "lesson-8",
      mode: "current_agenda",
    });
  });

  it("uses the next scheduled lesson before its official window starts", () => {
    const upcomingEntry = {
      courseId: course.id,
      lessonId: "lesson-8",
      eventDate: new Date("2026-08-01T19:00:00Z"),
    };

    expect(resolveJourneyFocus({
      courses: [course],
      unlockedCourseIds: new Set([course.id]),
      openAccessCourseIds: new Set(),
      fullyCompletedLessonIds: new Set(["lesson-1", "lesson-2"]),
      currentAgendaEntry: null,
      schedule: [upcomingEntry],
      now: new Date("2026-07-01T12:00:00Z"),
    })?.mode).toBe("upcoming_agenda");
  });

  it("uses personal completion order only for an open-access course", () => {
    expect(resolveJourneyFocus({
      courses: [course],
      unlockedCourseIds: new Set([course.id]),
      openAccessCourseIds: new Set([course.id]),
      fullyCompletedLessonIds: new Set(["lesson-1", "lesson-2"]),
      currentAgendaEntry: null,
      schedule: [],
    })).toEqual({
      courseId: "course-2",
      lessonId: "lesson-3",
      mode: "open_access",
    });
  });

  it("does not use a schedule entry from a locked course", () => {
    const lockedCourse = {
      id: "course-3",
      order_num: 3,
      lessons: [{ id: "locked-lesson", order_num: 1 }],
    };

    expect(resolveJourneyFocus({
      courses: [course, lockedCourse],
      unlockedCourseIds: new Set([course.id]),
      openAccessCourseIds: new Set([course.id]),
      fullyCompletedLessonIds: new Set(["lesson-1", "lesson-2"]),
      currentAgendaEntry: {
        courseId: lockedCourse.id,
        lessonId: "locked-lesson",
        eventDate: new Date("2026-08-01T19:00:00Z"),
      },
      schedule: [],
    })?.lessonId).toBe("lesson-3");
  });
});
