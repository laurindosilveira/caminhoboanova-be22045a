export type TextResponses = Record<string, string>;

export function getLessonRequiredKeys(questionCount: number): string[] {
  return [
    "icebreaker",
    ...Array.from({ length: Math.max(0, questionCount) }, (_, index) => `q${index}`),
    "practice",
    "prayer",
  ];
}

export function hasAllRequiredResponses(
  responses: TextResponses,
  requiredKeys: string[],
): boolean {
  return requiredKeys.every((key) => (responses[key] ?? "").trim().length > 0);
}

export function canCompleteLesson({
  responses,
  questionCount,
  videoRequired,
  videoWatched,
  audioRequired,
  audioListened,
}: {
  responses: TextResponses;
  questionCount: number;
  videoRequired: boolean;
  videoWatched: boolean;
  audioRequired: boolean;
  audioListened: boolean;
}): boolean {
  return (
    hasAllRequiredResponses(responses, getLessonRequiredKeys(questionCount))
    && (!videoRequired || videoWatched)
    && (!audioRequired || audioListened)
  );
}

export function buildDevotionalResponsePayload(
  answers: Record<number, string>,
  questionCount: number,
): TextResponses {
  return Object.fromEntries(
    Array.from(
      { length: Math.max(0, questionCount) },
      (_, index) => [String(index), answers[index] ?? ""],
    ),
  );
}
