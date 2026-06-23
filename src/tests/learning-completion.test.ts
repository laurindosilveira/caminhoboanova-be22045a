import { describe, expect, it } from "vitest";
import {
  buildDevotionalResponsePayload,
  canCompleteLesson,
  getLessonRequiredKeys,
  hasAllRequiredResponses,
} from "@/lib/learningCompletion";

describe("learning completion rules", () => {
  it("does not complete a lesson from a partial autosave", () => {
    const responses = { icebreaker: "Uma resposta" };

    expect(
      canCompleteLesson({
        responses,
        questionCount: 2,
        videoRequired: false,
        videoWatched: false,
        audioRequired: false,
        audioListened: false,
      }),
    ).toBe(false);
  });

  it("requires every response and required media", () => {
    const responses = {
      icebreaker: "Resposta",
      q0: "Resposta 1",
      q1: "Resposta 2",
      practice: "Prática",
      prayer: "Oração",
    };

    expect(hasAllRequiredResponses(responses, getLessonRequiredKeys(2))).toBe(true);
    expect(
      canCompleteLesson({
        responses,
        questionCount: 2,
        videoRequired: true,
        videoWatched: true,
        audioRequired: true,
        audioListened: false,
      }),
    ).toBe(false);
    expect(
      canCompleteLesson({
        responses,
        questionCount: 2,
        videoRequired: true,
        videoWatched: true,
        audioRequired: true,
        audioListened: true,
      }),
    ).toBe(true);
  });

  it("builds stable devotional response keys for idempotent upserts", () => {
    expect(buildDevotionalResponsePayload({ 0: "A", 1: "B" }, 2)).toEqual({
      "0": "A",
      "1": "B",
    });
  });
});
