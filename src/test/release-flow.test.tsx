import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { getBusinessDaysBefore } from "@/hooks/useAgendaSchedule";
import { computeDevotionalStatuses } from "@/components/home/LessonChoiceView";
import CourseTrailSection from "@/components/home/discipleship/CourseTrailSection";
import { useState } from "react";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
  },
}));

type DevotionalItem = {
  id: string;
  lesson_id: string;
  day_number: number;
  title: string;
  bible_text: string;
  bible_reference: string;
  reflection: string;
  prayer: string;
  practice: string;
  questions: string[];
};

describe("release flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("computes the 10 business day release window and first 5 devotional dates from the agenda event", () => {
    const eventDate = new Date("2026-03-16T19:00:00");
    const businessDays = getBusinessDaysBefore(eventDate, 10);

    expect(businessDays).toHaveLength(10);
    expect(businessDays[0].toISOString().slice(0, 10)).toBe("2026-03-02");
    expect(businessDays[9].toISOString().slice(0, 10)).toBe("2026-03-13");
    expect(businessDays.slice(0, 5).map((date) => date.toISOString().slice(0, 10))).toEqual([
      "2026-03-02",
      "2026-03-03",
      "2026-03-04",
      "2026-03-05",
      "2026-03-06",
    ]);
  });

  it("releases one devotional per scheduled day and keeps future ones blocked", () => {
    vi.setSystemTime(new Date("2026-03-03T10:00:00"));

    const devotionals: DevotionalItem[] = [
      { id: "d1", lesson_id: "l1", day_number: 1, title: "", bible_text: "", bible_reference: "", reflection: "", prayer: "", practice: "", questions: [] },
      { id: "d2", lesson_id: "l1", day_number: 2, title: "", bible_text: "", bible_reference: "", reflection: "", prayer: "", practice: "", questions: [] },
      { id: "d3", lesson_id: "l1", day_number: 3, title: "", bible_text: "", bible_reference: "", reflection: "", prayer: "", practice: "", questions: [] },
    ];

    const scheduledDates = [
      new Date("2026-03-02T00:00:00"),
      new Date("2026-03-03T00:00:00"),
      new Date("2026-03-04T00:00:00"),
    ];

    const { statuses } = computeDevotionalStatuses(devotionals, new Map(), scheduledDates);

    expect(statuses.get("d1")).toBe("locked");
    expect(statuses.get("d2")).toBe("available");
    expect(statuses.get("d3")).toBe("future");
  });

  it("allows weekend recovery only for devotionals scheduled in the current week", () => {
    vi.setSystemTime(new Date("2026-03-07T10:00:00"));

    const devotionals: DevotionalItem[] = [
      { id: "d1", lesson_id: "l1", day_number: 1, title: "", bible_text: "", bible_reference: "", reflection: "", prayer: "", practice: "", questions: [] },
      { id: "d2", lesson_id: "l1", day_number: 2, title: "", bible_text: "", bible_reference: "", reflection: "", prayer: "", practice: "", questions: [] },
      { id: "d3", lesson_id: "l1", day_number: 3, title: "", bible_text: "", bible_reference: "", reflection: "", prayer: "", practice: "", questions: [] },
    ];

    const scheduledDates = [
      new Date("2026-03-02T00:00:00"),
      new Date("2026-03-05T00:00:00"),
      new Date("2026-02-27T00:00:00"),
    ];

    const { statuses } = computeDevotionalStatuses(devotionals, new Map(), scheduledDates);

    expect(statuses.get("d1")).toBe("available");
    expect(statuses.get("d2")).toBe("available");
    expect(statuses.get("d3")).toBe("locked");
  });

  it("opens the course when a lesson is scheduled even without manual course unlock", () => {
    function Wrapper() {
      const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

      return (
        <CourseTrailSection
          courses={[
            {
              id: "c1",
              order_num: 1,
              title: "Curso 1",
              subtitle: null,
              lessons: [
                { id: "l1", order_num: 1, title: "Lição 1", objective: null, topics: null, course_id: "c1" },
              ],
            },
          ]}
          expandedCourse={expandedCourse}
          onExpandCourse={setExpandedCourse}
          unlockedCourseIds={new Set()}
          completedLessonIds={new Set()}
          fullyCompletedLessonIds={new Set()}
          agendaSchedule={{
            loading: false,
            hasScheduledEvents: true,
            scheduledLessonIds: new Set(["l1"]),
            studyOpenLessonIds: new Set(),
            lateAccessLessonIds: new Set(),
            lessonEventDate: new Map(),
            lessonDevotionalDates: new Map(),
            schedule: [{ lessonId: "l1", windowStart: new Date("2026-03-02T00:00:00") }],
          }}
          isLeaderOrAdmin={false}
          onSelectLesson={() => {}}
        />
      );
    }

    render(<Wrapper />);

    expect(screen.queryByText(/curso ainda não liberado/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Curso 1"));
    expect(screen.getByText("Lição 1")).toBeInTheDocument();
  });
});
