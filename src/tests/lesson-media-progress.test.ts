import { beforeEach, describe, expect, it } from "vitest";
import {
  getStoredLessonMediaProgress,
  storeLessonMediaProgress,
} from "@/lib/lessonMediaProgress";

describe("lesson media progress", () => {
  beforeEach(() => window.localStorage.clear());

  it("persists media progress synchronously and never changes true back to false", () => {
    storeLessonMediaProgress("user-1", "lesson-11", { videoWatched: true });
    storeLessonMediaProgress("user-1", "lesson-11", {
      videoWatched: false,
      audioListened: true,
    });

    expect(getStoredLessonMediaProgress("user-1", "lesson-11")).toEqual({
      videoWatched: true,
      audioListened: true,
    });
  });

  it("keeps progress isolated by user and lesson", () => {
    storeLessonMediaProgress("user-1", "lesson-11", { audioListened: true });

    expect(getStoredLessonMediaProgress("user-1", "lesson-12").audioListened).toBe(false);
    expect(getStoredLessonMediaProgress("user-2", "lesson-11").audioListened).toBe(false);
  });
});
