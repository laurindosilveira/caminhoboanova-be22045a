import { describe, expect, it } from "vitest";
import { getSubsequentLessonEvents } from "@/lib/lessonScheduleCascade";

const current = {
  id: "current",
  event_date: "2026-07-04T20:00:00.000Z",
  type: "confirmatorio",
  area: "Área 2",
  community: null,
  turma_id: null,
};

describe("lesson schedule cascade", () => {
  it("includes future meetings without lessons in the same area and type", () => {
    const result = getSubsequentLessonEvents([
      current,
      {
        ...current,
        id: "next-2",
        event_date: "2026-08-01T20:00:00.000Z",
      },
      {
        ...current,
        id: "next-1",
        event_date: "2026-07-18T20:00:00.000Z",
      },
    ], current);

    expect(result.map((event) => event.id)).toEqual(["next-1", "next-2"]);
  });

  it("treats confirmatory meetings as area-wide even when community differs", () => {
    const result = getSubsequentLessonEvents([
      current,
      {
        ...current,
        id: "next-community",
        community: "Martim Lutero",
        event_date: "2026-07-18T20:00:00.000Z",
      },
    ], current);

    expect(result.map((event) => event.id)).toEqual(["next-community"]);
  });

  it("does not cascade into another area, turma, or event type", () => {
    const result = getSubsequentLessonEvents([
      current,
      {
        ...current,
        id: "other-area",
        area: "Área 1",
        event_date: "2026-07-18T20:00:00.000Z",
      },
      {
        ...current,
        id: "other-type",
        type: "jemiac",
        event_date: "2026-07-18T20:00:00.000Z",
      },
      {
        ...current,
        id: "turma-event",
        area: null,
        turma_id: "turma-1",
        event_date: "2026-07-18T20:00:00.000Z",
      },
    ], current);

    expect(result).toEqual([]);
  });
});
