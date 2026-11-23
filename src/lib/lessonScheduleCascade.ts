export type ScheduledLessonEvent = {
  id: string;
  event_date: string;
  type: string;
  area?: string | null;
  community?: string | null;
  turma_id?: string | null;
};

export type LessonScheduleCascadeOptions = {
  /** Area used by turma-scoped events to include legacy area-only meetings. */
  legacyArea?: string | null;
};

function hasSameAudience(
  event: ScheduledLessonEvent,
  reference: ScheduledLessonEvent,
) {
  if (reference.turma_id) {
    if (event.turma_id) return event.turma_id === reference.turma_id;

    // Older schedules were area-scoped. They remain visible inside a turma,
    // so they must also participate in the cascade until they are migrated.
    const isSameLegacyArea = Boolean(reference.area)
      && (event.area ?? null) === (reference.area ?? null);
    if (!isSameLegacyArea) return false;

    return reference.type === "confirmatorio"
      || (event.community ?? null) === (reference.community ?? null);
  }

  if (reference.type === "confirmatorio") {
    return !event.turma_id
      && (event.area ?? null) === (reference.area ?? null);
  }

  return !event.turma_id
    && (event.area ?? null) === (reference.area ?? null)
    && (event.community ?? null) === (reference.community ?? null);
}

export function getSubsequentLessonEvents<T extends ScheduledLessonEvent>(
  events: T[],
  reference: ScheduledLessonEvent,
  options: LessonScheduleCascadeOptions = {},
): T[] {
  const referenceTime = new Date(reference.event_date).getTime();
  const effectiveReference = reference.area || !options.legacyArea
    ? reference
    : { ...reference, area: options.legacyArea };

  return events
    .filter((event) =>
      event.id !== reference.id
      && event.type === reference.type
      && hasSameAudience(event, effectiveReference)
      && new Date(event.event_date).getTime() > referenceTime
    )
    .sort(
      (a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
    );
}
