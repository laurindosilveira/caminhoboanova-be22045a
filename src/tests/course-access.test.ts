import { describe, expect, it } from "vitest";
import {
  getCourseIdsByMode,
  isCourseVisibleInJourney,
  resolveCourseUnlocks,
  type CourseUnlockScopeRow,
} from "@/lib/courseAccess";

const rows: CourseUnlockScopeRow[] = [
  { course_id: "course-a", area: "Área 1", turma_id: null, access_mode: "open" },
  { course_id: "course-a", area: "Área 1", turma_id: "turma-1", access_mode: "scheduled" },
  { course_id: "course-b", area: "Área 1", turma_id: null, access_mode: "scheduled" },
  { course_id: "course-c", area: "Área 2", turma_id: null, access_mode: "open" },
  { course_id: "course-d", area: "Área 1", turma_id: "turma-2", access_mode: "open" },
];

describe("resolveCourseUnlocks", () => {
  it("prioritizes the exact turma row over an area fallback", () => {
    const result = resolveCourseUnlocks(rows, { turmaId: "turma-1", area: "Área 1" });

    expect(result.get("course-a")).toMatchObject({
      mode: "scheduled",
      source: "turma",
    });
  });

  it("keeps the area row as a compatibility fallback", () => {
    const result = resolveCourseUnlocks(rows, { turmaId: "turma-1", area: "Área 1" });

    expect(result.get("course-b")).toMatchObject({
      mode: "scheduled",
      source: "area",
    });
  });

  it("does not accept rows from another turma or area", () => {
    const result = resolveCourseUnlocks(rows, { turmaId: "turma-1", area: "Área 1" });

    expect(result.has("course-c")).toBe(false);
    expect(result.has("course-d")).toBe(false);
  });

  it("supports legacy users without a turma", () => {
    const result = resolveCourseUnlocks(rows, { turmaId: null, area: "Área 1" });

    expect(result.get("course-a")?.mode).toBe("open");
    expect(result.get("course-b")?.mode).toBe("scheduled");
  });

  it("returns mode-specific course sets", () => {
    const result = resolveCourseUnlocks(rows, { turmaId: "turma-1", area: "Área 1" });

    expect([...getCourseIdsByMode(result, "open")]).toEqual([]);
    expect([...getCourseIdsByMode(result, "scheduled")].sort()).toEqual(["course-a", "course-b"]);
  });
});

describe("isCourseVisibleInJourney", () => {
  const baseScope = {
    churchId: "church-1",
    isSuper: false,
    unlockedCourseIds: new Set(["course-a"]),
    releasedCourseIds: new Set(["course-a", "course-b"]),
    releasedTrackIds: new Set<string>(),
  };

  it("shows an unlocked course released to the church", () => {
    expect(isCourseVisibleInJourney(
      { id: "course-a", church_id: null, track_id: null },
      baseScope,
    )).toBe(true);
  });

  it("hides a released course while the group has not unlocked it", () => {
    expect(isCourseVisibleInJourney(
      { id: "course-b", church_id: null, track_id: null },
      baseScope,
    )).toBe(false);
  });

  it("does not let elevated platform access expose a locked course", () => {
    expect(isCourseVisibleInJourney(
      { id: "course-b", church_id: null, track_id: null },
      { ...baseScope, isSuper: true },
    )).toBe(false);
  });

  it("hides an unlocked course that is not available to the church", () => {
    expect(isCourseVisibleInJourney(
      { id: "course-a", church_id: "church-2", track_id: null },
      { ...baseScope, releasedCourseIds: new Set<string>() },
    )).toBe(false);
  });
});
