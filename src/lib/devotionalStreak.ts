export type ScheduledDevotionalEvent = {
  event_date: string;
  linked_lesson_id: string | null;
  released_devotional_days?: number[] | null;
  area?: string | null;
  community?: string | null;
  turma_id?: string | null;
  target_user_id?: string | null;
  type?: string | null;
};

export type DevotionalContentRef = {
  id: string;
  lesson_id: string | null;
  day_number: number;
};

export type DevotionalCompletionRef = {
  devotional_id: string;
  completed_at: string;
  is_recovery?: boolean | null;
};

export type StreakProfile = {
  area?: string | null;
  community?: string | null;
  turma_id?: string | null;
};

export type ScheduledDevotionalDay = {
  dateKey: string;
  devotionalId: string;
};

function startOfLocalDay(value: Date) {
  const result = new Date(value);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function localDateKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function businessDaysBefore(eventDate: Date, count: number) {
  const dates: Date[] = [];
  const cursor = startOfLocalDay(eventDate);
  cursor.setDate(cursor.getDate() - 1);
  while (dates.length < count) {
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) dates.unshift(new Date(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return dates;
}

function eventIsRelevant(
  event: ScheduledDevotionalEvent,
  userId: string,
  profile: StreakProfile,
) {
  if (event.target_user_id && event.target_user_id !== userId) return false;
  if (event.area && event.area !== profile.area) return false;
  if (event.turma_id && event.turma_id !== profile.turma_id) return false;
  if (event.community && event.type !== "confirmatorio" && event.community !== profile.community) return false;
  return true;
}

export function buildScheduledDevotionalDays(
  events: ScheduledDevotionalEvent[],
  devotionals: DevotionalContentRef[],
  userId: string,
  profile: StreakProfile,
) {
  const relevantEvents = events
    .filter((event) => event.linked_lesson_id && eventIsRelevant(event, userId, profile))
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  const devotionalByLessonAndDay = new Map(
    devotionals.map((item) => [`${item.lesson_id}:${item.day_number}`, item.id]),
  );
  const daysByDate = new Map<string, ScheduledDevotionalDay>();

  relevantEvents.forEach((event, index) => {
    const eventDate = new Date(event.event_date);
    const previous = relevantEvents[index - 1];
    const autoLimited = previous
      ? Math.round((eventDate.getTime() - new Date(previous.event_date).getTime()) / 86400000) < 10
      : false;
    const allDates = businessDaysBefore(eventDate, 10);
    const dates = autoLimited ? allDates.slice(5) : allDates;
    const releasedDays = Array.isArray(event.released_devotional_days)
      ? new Set(event.released_devotional_days)
      : null;

    dates.forEach((date, dayIndex) => {
      const dayNumber = dayIndex + 1;
      if (releasedDays && !releasedDays.has(dayNumber)) return;
      const devotionalId = devotionalByLessonAndDay.get(`${event.linked_lesson_id}:${dayNumber}`);
      if (!devotionalId) return;
      daysByDate.set(localDateKey(date), { dateKey: localDateKey(date), devotionalId });
    });
  });

  return [...daysByDate.values()].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

export function calculateScheduledDevotionalStreak(
  schedule: ScheduledDevotionalDay[],
  completions: DevotionalCompletionRef[],
  now = new Date(),
) {
  const todayKey = localDateKey(now);
  const validCompletionKeys = new Set(
    completions
      .filter((completion) => !completion.is_recovery)
      .map((completion) => `${completion.devotional_id}:${localDateKey(completion.completed_at)}`),
  );
  const dueDays = schedule.filter((day) => day.dateKey <= todayKey);
  const today = dueDays.find((day) => day.dateKey === todayKey) ?? null;
  const completedToday = !!today && validCompletionKeys.has(`${today.devotionalId}:${today.dateKey}`);
  let cursor = dueDays.length - 1;

  // A devotional that is still open today puts the streak at risk, but does not
  // erase it before the day has ended.
  if (today && !completedToday) cursor -= 1;

  let streakDays = 0;
  for (; cursor >= 0; cursor -= 1) {
    const day = dueDays[cursor];
    if (!validCompletionKeys.has(`${day.devotionalId}:${day.dateKey}`)) break;
    streakDays += 1;
  }

  return {
    streakDays,
    scheduledToday: !!today,
    completedToday,
    frozen: !today,
    atRisk: !!today && !completedToday,
  };
}
