export type ScheduledLessonEvent = {
  id: string;
  event_date: string;
  type: string;
  area?: string | null;
  community?: string | null;
  turma_id?: string | null;
};

function hasSameAudience(
  event: ScheduledLessonEvent,
  reference: ScheduledLessonEvent,
) {
  if (reference.turma_id) {
    return event.turma_id === reference.turma_id;
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
): T[] {
  const referenceTime = new Date(reference.event_date).getTime();

  return events
    .filter((event) =>
      event.id !== reference.id
      && event.type === reference.type
      && hasSameAudience(event, reference)
      && new Date(event.event_date).getTime() > referenceTime
    )
    .sort(
      (a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
    );
}
