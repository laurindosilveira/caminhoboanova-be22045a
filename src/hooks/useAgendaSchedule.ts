import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";

export type ScheduleEntry = {
  eventId: string;
  eventDate: Date;
  eventTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonOrder: number;
  courseId: string;
  courseTitle: string;
  courseOrder: number;
  windowStart: Date;
  /** Business-day release dates before event. Auto-limited weekly lessons include only the final 5 dates. */
  devotionalDates: Date[];
  /** Day numbers the leader chose to release. null = all released. */
  releasedDayNumbers: number[] | null;
  /** True when this event is < 10 calendar days from the previous one (auto-limit to 5 devotionals). */
  autoLimited: boolean;
  /** '5_days' = 5 devotionals with recovery week; '10_days' = 10 devotionals full window. */
  devotionalMode: "5_days" | "10_days";
};

type EventRow = {
  id: string;
  event_date: string;
  linked_lesson_id: string | null;
  title: string;
  type: string;
  area: string | null;
  community?: string | null;
  turma_id?: string | null;
  target_user_id?: string | null;
  released_devotional_days?: number[] | null;
};

type LessonRow = {
  id: string;
  title: string;
  order_num: number;
  course_id: string;
  devotional_mode: "5_days" | "10_days";
};

type CourseRow = { id: string; title: string; order_num: number };
type QueryError = { message: string };

type ScheduleQueryParams = {
  authUserId: string;
  churchId: string | null;
  community: string | null;
  currentArea: string;
  role: "user" | "admin" | "lider" | null;
  turmaId: string | null;
};

type ScheduleSubscription = {
  consumers: number;
  channel: ReturnType<typeof supabase.channel>;
};

const scheduleSubscriptions = new Map<string, ScheduleSubscription>();

async function fetchEvents(churchId: string | null) {
  const eventSelectFallbacks = [
    "id, event_date, linked_lesson_id, title, type, area, community, turma_id, target_user_id, released_devotional_days",
    "id, event_date, linked_lesson_id, title, type, area, community, turma_id, released_devotional_days",
    "id, event_date, linked_lesson_id, title, type, area, community, released_devotional_days",
    "id, event_date, linked_lesson_id, title, type, area, released_devotional_days",
    "id, event_date, linked_lesson_id, title, type, area, community, turma_id, target_user_id",
    "id, event_date, linked_lesson_id, title, type, area, community, turma_id",
    "id, event_date, linked_lesson_id, title, type, area, community",
    "id, event_date, linked_lesson_id, title, type, area",
  ];

  let events: EventRow[] | null = null;
  let error: QueryError | null = null;
  for (const selectClause of eventSelectFallbacks) {
    let query = supabase
      .from("events")
      .select(selectClause)
      .not("linked_lesson_id", "is", null)
      .order("event_date", { ascending: true });
    if (churchId) query = query.eq("church_id", churchId);
    const result = await query;
    if (!result.error) {
      events = (result.data ?? []) as unknown as EventRow[];
      break;
    }
    error = result.error;
  }

  return {
    events,
    error: events
      ? null
      : error ?? { message: "useAgendaSchedule: failed to load events with all fallbacks" },
  };
}

async function fetchLessons() {
  const result = await supabase
    .from("lessons")
    .select("id, title, order_num, course_id, devotional_mode")
    .order("order_num");

  if (!result.error) {
    return {
      lessons: (result.data ?? []).map((lesson) => ({
        ...lesson,
        devotional_mode: lesson.devotional_mode === "5_days" ? "5_days" as const : "10_days" as const,
      })),
      error: null,
    };
  }

  if (!/devotional_mode/i.test(result.error.message)) {
    return { lessons: [] as LessonRow[], error: result.error };
  }

  const fallback = await supabase
    .from("lessons")
    .select("id, title, order_num, course_id")
    .order("order_num");
  return {
    lessons: (fallback.data ?? []).map((lesson) => ({ ...lesson, devotional_mode: "10_days" as const })),
    error: fallback.error,
  };
}

async function fetchScheduleData({
  authUserId,
  churchId,
  community,
  currentArea,
  role,
  turmaId,
}: ScheduleQueryParams): Promise<ScheduleEntry[]> {
  const [eventsResult, lessonsResult, coursesResult] = await Promise.all([
    fetchEvents(churchId),
    fetchLessons(),
    supabase.from("courses").select("id, title, order_num").order("order_num"),
  ]);

  if (eventsResult.error) throw new Error(eventsResult.error.message);
  if (lessonsResult.error) throw new Error(lessonsResult.error.message);
  if (coursesResult.error) throw coursesResult.error;

  const lessonMap = new Map<string, LessonRow>(
    lessonsResult.lessons.map((lesson) => [lesson.id, lesson]),
  );
  const courseMap = new Map<string, CourseRow>(
    ((coursesResult.data ?? []) as CourseRow[]).map((course) => [course.id, course]),
  );
  const entries: ScheduleEntry[] = [];
  const isManager = role === "admin" || role === "lider";

  for (const event of eventsResult.events ?? []) {
    if (!event.linked_lesson_id) continue;
    if (event.target_user_id && event.target_user_id !== authUserId) continue;
    if (turmaId) {
      if (event.turma_id && event.turma_id !== turmaId) continue;
      if (!event.turma_id && event.area && event.area !== currentArea) continue;
    } else {
      if (event.turma_id) continue;
      if (event.area && event.area !== currentArea) continue;
    }

    const isConfirmatorio = event.type === "confirmatorio";
    if (
      !event.turma_id
      && event.community
      && !isManager
      && !isConfirmatorio
      && event.community !== community
    ) continue;

    const lesson = lessonMap.get(event.linked_lesson_id);
    if (!lesson) continue;
    const course = courseMap.get(lesson.course_id);
    if (!course) continue;

    const rawDate = event.event_date;
    const eventDate = new Date(rawDate.includes("T") ? rawDate : `${rawDate}T12:00:00`);
    const previousEntry = entries[entries.length - 1];
    const autoLimited = previousEntry
      ? Math.round((eventDate.getTime() - previousEntry.eventDate.getTime()) / 86400000) < 10
      : false;
    const devotionalDates = getEffectiveDevotionalDates(eventDate, autoLimited);
    const rawReleased = event.released_devotional_days ?? null;
    const releasedDayNumbers = autoLimited
      ? rawReleased?.filter((day) => day <= 5) ?? [1, 2, 3, 4, 5]
      : rawReleased;

    entries.push({
      eventId: event.id,
      eventDate,
      eventTitle: event.title,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonOrder: lesson.order_num,
      courseId: course.id,
      courseTitle: course.title,
      courseOrder: course.order_num,
      windowStart: devotionalDates[0],
      devotionalDates,
      releasedDayNumbers,
      autoLimited,
      devotionalMode: lesson.devotional_mode,
    });
  }

  return entries.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
}

/**
 * Returns N business days before a given date, in chronological order.
 */
export function getBusinessDaysBefore(date: Date, count: number): Date[] {
  const days: Date[] = [];
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  current.setDate(current.getDate() - 1);
  while (days.length < count) {
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      days.unshift(new Date(current));
    }
    current.setDate(current.getDate() - 1);
  }
  return days;
}

function startOfLocalDay(date: Date): Date {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

export function getStudyOpenLessonIds(
  schedule: Pick<ScheduleEntry, "lessonId" | "windowStart" | "eventDate">[],
  now = new Date(),
): Set<string> {
  const today = startOfLocalDay(now);
  return new Set(
    schedule
      .filter((entry) => today >= entry.windowStart && now < entry.eventDate)
      .map((entry) => entry.lessonId),
  );
}

export function getEffectiveDevotionalDates(
  eventDate: Date,
  autoLimited: boolean,
): Date[] {
  const devotionalDates = getBusinessDaysBefore(eventDate, 10);
  return autoLimited ? devotionalDates.slice(5) : devotionalDates;
}

export function useAgendaSchedule() {
  const { profile, role, user } = useAuth();
  const { effectiveArea, effectiveTurmaId } = useAreaSwitch();
  const currentArea = effectiveArea || profile?.area || "";
  const profileUserId = profile?.user_id ?? null;
  const churchId = profile?.church_id ?? null;
  const turmaId = effectiveTurmaId ?? profile?.turma_id ?? null;
  const community = profile?.community ?? null;
  const authUserId = user?.id ?? null;
  const queryClient = useQueryClient();
  const enabled = Boolean(profileUserId && authUserId);
  const scopeKey = [
    authUserId,
    profileUserId,
    churchId ?? "global",
    turmaId ?? "no-group",
    currentArea || "all",
    community ?? "all",
    role ?? "user",
  ].join(":");
  const queryKey = ["agenda-schedule", scopeKey] as const;

  const { data: schedule = [], isLoading: loading, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchScheduleData({
      authUserId: authUserId!,
      churchId,
      community,
      currentArea,
      role,
      turmaId,
    }),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (!enabled) return;

    let subscription = scheduleSubscriptions.get(scopeKey);
    if (!subscription) {
      const channel = supabase
        .channel(`agenda-events:${profileUserId}:${(turmaId ?? currentArea) || "all"}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => {
          void queryClient.invalidateQueries({ queryKey: ["agenda-schedule", scopeKey] });
        })
        .subscribe();
      subscription = { consumers: 0, channel };
      scheduleSubscriptions.set(scopeKey, subscription);
    }
    subscription.consumers += 1;

    return () => {
      const current = scheduleSubscriptions.get(scopeKey);
      if (!current) return;
      current.consumers -= 1;
      if (current.consumers <= 0) {
        scheduleSubscriptions.delete(scopeKey);
        void supabase.removeChannel(current.channel);
      }
    };
  }, [currentArea, enabled, profileUserId, queryClient, scopeKey, turmaId]);

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const releasedLessonIds = new Set<string>();
  const studyOpenLessonIds = getStudyOpenLessonIds(schedule, now);
  const lateAccessLessonIds = new Set<string>();
  const lessonDevotionalDates = new Map<string, Date[]>();
  const lessonEventDate = new Map<string, Date>();
  const lessonReleasedDays = new Map<string, number[] | null>();
  const lessonDevotionalMode = new Map<string, "5_days" | "10_days">();

  for (const entry of schedule) {
    const eventDay = startOfLocalDay(entry.eventDate);
    if (today >= eventDay) releasedLessonIds.add(entry.lessonId);
    if (now >= entry.eventDate) lateAccessLessonIds.add(entry.lessonId);
    lessonDevotionalDates.set(entry.lessonId, entry.devotionalDates);
    lessonEventDate.set(entry.lessonId, entry.eventDate);
    lessonReleasedDays.set(entry.lessonId, entry.releasedDayNumbers);
    lessonDevotionalMode.set(entry.lessonId, entry.devotionalMode);
  }

  const scheduledLessonIds = new Set(schedule.map((e) => e.lessonId));
  const nextScheduledEvent = schedule.find((e) => e.eventDate >= now) ?? null;
  const currentEntry = schedule.find((e) => today >= e.windowStart && e.eventDate >= now) ?? null;

  return {
    schedule,
    loading: enabled && loading,
    releasedLessonIds,
    studyOpenLessonIds,
    lateAccessLessonIds,
    scheduledLessonIds,
    lessonDevotionalDates,
    lessonEventDate,
    lessonReleasedDays,
    lessonDevotionalMode,
    nextScheduledEvent,
    currentEntry,
    hasScheduledEvents: schedule.length > 0,
    refetch,
  };
}
