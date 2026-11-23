export type ActivityPushProfile = {
  user_id: string;
  church_id: string;
  area: string | null;
  community: string | null;
  turma_id: string | null;
  enrollment_status?: string | null;
};

export type ActivityPushCourseUnlock = {
  course_id: string;
  church_id: string;
  area: string | null;
  turma_id: string | null;
  access_mode: string | null;
};

export type ActivityPushEvent = {
  id: string;
  church_id: string;
  event_date: string;
  linked_lesson_id: string | null;
  area: string | null;
  community: string | null;
  turma_id: string | null;
  target_user_id: string | null;
  type?: string | null;
  released_devotional_days?: number[] | null;
};

export type ActivityPushLesson = {
  id: string;
  course_id: string;
  title: string;
  order_num: number;
  devotional_mode?: string | null;
};

export type ActivityPushDevotional = {
  id: string;
  lesson_id: string | null;
  day_number: number;
  church_id: string | null;
};

export type ActivityPushProgress = {
  user_id: string;
  devotional_id: string;
  completed_at: string | null;
  church_id: string | null;
};

export type ActivityPushOverride = {
  user_id: string;
  devotional_id: string;
  is_unlocked: boolean;
  available_from: string | null;
  available_until: string | null;
};

export type ActionableDevotional = {
  devotionalId: string;
  lessonId: string;
  lessonOrder: number;
  lessonTitle: string;
  mode: "scheduled" | "weekend_recovery" | "open_access" | "manual_override";
};

type EligibilityInput = {
  profile: ActivityPushProfile;
  courseUnlocks: readonly ActivityPushCourseUnlock[];
  events: readonly ActivityPushEvent[];
  lessons: readonly ActivityPushLesson[];
  devotionals: readonly ActivityPushDevotional[];
  progress: readonly ActivityPushProgress[];
  overrides?: readonly ActivityPushOverride[];
  now?: Date;
  timezone?: string;
};

function dateKey(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function shiftDateKey(key: string, days: number) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function weekdayFromKey(key: string) {
  return new Date(`${key}T12:00:00Z`).getUTCDay();
}

function businessDaysBefore(eventDate: Date, count: number, timezone: string) {
  const dates: string[] = [];
  let cursor = shiftDateKey(dateKey(eventDate, timezone), -1);
  while (dates.length < count) {
    const weekday = weekdayFromKey(cursor);
    if (weekday !== 0 && weekday !== 6) dates.unshift(cursor);
    cursor = shiftDateKey(cursor, -1);
  }
  return dates;
}

function addBusinessDays(start: string, count: number) {
  let cursor = start;
  let added = 0;
  while (added < count) {
    cursor = shiftDateKey(cursor, 1);
    const weekday = weekdayFromKey(cursor);
    if (weekday !== 0 && weekday !== 6) added++;
  }
  return cursor;
}

function isWeekendRecoveryDate(scheduledDate: string, today: string) {
  const weekday = weekdayFromKey(today);
  if (weekday !== 0 && weekday !== 6) return false;
  const monday = shiftDateKey(today, -(weekday === 0 ? 6 : 5));
  const friday = shiftDateKey(monday, 4);
  return scheduledDate >= monday && scheduledDate <= friday;
}

function isEventRelevant(event: ActivityPushEvent, profile: ActivityPushProfile) {
  if (event.church_id !== profile.church_id) return false;
  if (event.target_user_id && event.target_user_id !== profile.user_id) return false;

  if (profile.turma_id) {
    if (event.turma_id) return event.turma_id === profile.turma_id;
    if (event.area && event.area !== profile.area) return false;
  } else {
    if (event.turma_id) return false;
    if (event.area && event.area !== profile.area) return false;
  }

  const isConfirmatory = event.type === "confirmatorio";
  if (!event.turma_id && event.community && !isConfirmatory) {
    return event.community === profile.community;
  }
  return true;
}

function resolveCourseModes(
  rows: readonly ActivityPushCourseUnlock[],
  profile: ActivityPushProfile,
) {
  const resolved = new Map<string, { mode: "open" | "scheduled"; rank: number }>();
  for (const row of rows) {
    if (row.church_id !== profile.church_id) continue;
    const exactTurma = Boolean(profile.turma_id) && row.turma_id === profile.turma_id;
    const areaFallback = row.turma_id === null
      && Boolean(profile.area)
      && row.area === profile.area;
    if (!exactTurma && !areaFallback) continue;

    const rank = exactTurma ? 2 : 1;
    const mode = row.access_mode === "open" ? "open" : "scheduled";
    const current = resolved.get(row.course_id);
    if (
      !current
      || rank > current.rank
      || (rank === current.rank && current.mode === "open" && mode === "scheduled")
    ) {
      resolved.set(row.course_id, { mode, rank });
    }
  }
  return resolved;
}

function activeOverride(
  override: ActivityPushOverride,
  now: Date,
) {
  if (!override.is_unlocked) return false;
  if (override.available_from && new Date(override.available_from) > now) return false;
  if (override.available_until && new Date(override.available_until) < now) return false;
  return true;
}

export function findActionableDevotional({
  profile,
  courseUnlocks,
  events,
  lessons,
  devotionals,
  progress,
  overrides = [],
  now = new Date(),
  timezone = "America/Sao_Paulo",
}: EligibilityInput): ActionableDevotional | null {
  if (!profile.turma_id) return null;
  if (profile.enrollment_status && !["approved", "active"].includes(profile.enrollment_status)) {
    return null;
  }

  const courseModes = resolveCourseModes(courseUnlocks, profile);
  if (courseModes.size === 0) return null;

  const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const completedIds = new Set(
    progress
      .filter((item) =>
        item.user_id === profile.user_id
        && (!item.church_id || item.church_id === profile.church_id)
      )
      .map((item) => item.devotional_id),
  );
  const today = dateKey(now, timezone);

  for (const override of overrides) {
    if (
      override.user_id !== profile.user_id
      || completedIds.has(override.devotional_id)
      || !activeOverride(override, now)
    ) continue;
    const devotional = devotionals.find((item) => item.id === override.devotional_id);
    const lesson = devotional?.lesson_id ? lessonMap.get(devotional.lesson_id) : null;
    if (!lesson || !courseModes.has(lesson.course_id)) continue;
    return {
      devotionalId: override.devotional_id,
      lessonId: lesson.id,
      lessonOrder: lesson.order_num,
      lessonTitle: lesson.title,
      mode: "manual_override",
    };
  }

  const relevantEvents = events
    .filter((event) => event.linked_lesson_id && isEventRelevant(event, profile))
    .filter((event) => {
      const lesson = event.linked_lesson_id ? lessonMap.get(event.linked_lesson_id) : null;
      return lesson && courseModes.get(lesson.course_id)?.mode === "scheduled";
    })
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  for (let index = 0; index < relevantEvents.length; index++) {
    const event = relevantEvents[index];
    const lesson = event.linked_lesson_id ? lessonMap.get(event.linked_lesson_id) : null;
    if (!lesson) continue;

    const eventDate = new Date(event.event_date);
    const previous = index > 0 ? relevantEvents[index - 1] : null;
    const autoLimited = previous
      ? Math.round((eventDate.getTime() - new Date(previous.event_date).getTime()) / 86_400_000) < 10
      : false;
    const allDates = businessDaysBefore(eventDate, 10, timezone);
    const scheduledDates = autoLimited ? allDates.slice(5) : allDates;
    const released = event.released_devotional_days
      ? new Set(event.released_devotional_days)
      : null;
    const lessonDevotionals = devotionals
      .filter((item) =>
        item.lesson_id === lesson.id
        && (!item.church_id || item.church_id === profile.church_id)
        && (lesson.devotional_mode !== "5_days" || item.day_number <= 5)
      )
      .sort((a, b) => a.day_number - b.day_number);

    for (const devotional of lessonDevotionals) {
      if (completedIds.has(devotional.id)) continue;
      if (released && !released.has(devotional.day_number)) continue;
      const scheduledDate = scheduledDates[devotional.day_number - 1];
      if (!scheduledDate) continue;
      if (scheduledDate === today || isWeekendRecoveryDate(scheduledDate, today)) {
        return {
          devotionalId: devotional.id,
          lessonId: lesson.id,
          lessonOrder: lesson.order_num,
          lessonTitle: lesson.title,
          mode: scheduledDate === today ? "scheduled" : "weekend_recovery",
        };
      }
    }
  }

  const openLessons = lessons
    .filter((lesson) => courseModes.get(lesson.course_id)?.mode === "open")
    .sort((a, b) => a.order_num - b.order_num);
  const completionMap = new Map(
    progress
      .filter((item) => item.user_id === profile.user_id && item.completed_at)
      .map((item) => [item.devotional_id, item.completed_at!]),
  );

  for (const lesson of openLessons) {
    const lessonDevotionals = devotionals
      .filter((item) =>
        item.lesson_id === lesson.id
        && (!item.church_id || item.church_id === profile.church_id)
      )
      .sort((a, b) => a.day_number - b.day_number);
    const dayOne = lessonDevotionals.find((item) => item.day_number === 1);
    if (!dayOne) continue;

    if (!completedIds.has(dayOne.id)) {
      return {
        devotionalId: dayOne.id,
        lessonId: lesson.id,
        lessonOrder: lesson.order_num,
        lessonTitle: lesson.title,
        mode: "open_access",
      };
    }

    const dayOneCompletedAt = completionMap.get(dayOne.id);
    if (!dayOneCompletedAt) continue;
    const startDate = dateKey(new Date(dayOneCompletedAt), timezone);
    for (const devotional of lessonDevotionals) {
      if (completedIds.has(devotional.id)) continue;
      const scheduledDate = addBusinessDays(startDate, Math.max(0, devotional.day_number - 1));
      if (scheduledDate === today) {
        return {
          devotionalId: devotional.id,
          lessonId: lesson.id,
          lessonOrder: lesson.order_num,
          lessonTitle: lesson.title,
          mode: "open_access",
        };
      }
    }
  }

  return null;
}
