import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildScheduledDevotionalDays, calculateScheduledDevotionalStreak } from "@/lib/devotionalStreak";
import { cachedStudentQuery, getPendingStudentOverlay, mergeByKey } from "@/lib/studentOffline";

export type UserStats = {
  faithPoints: number;
  faithLevel: number;
  streakDays: number;
  streakFrozen: boolean;
  streakAtRisk: boolean;
  faithEnergy: number;
  completedCount: number;
  nextActivity: { id: string; type: string; title: string; subtitle: string | null; points: number } | null;
  totalActivities: number;
  loading: boolean;
};

function calculateLevel(points: number, thresholds: number[]): number {
  if (points >= thresholds[3]) return 5;
  if (points >= thresholds[2]) return 4;
  if (points >= thresholds[1]) return 3;
  if (points >= thresholds[0]) return 2;
  return 1;
}

function calculateEnergy(dates: string[]): number {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent = dates.filter(d => new Date(d) >= sevenDaysAgo);
  return Math.min(5, recent.length);
}

type StatsData = Omit<UserStats, "loading">;

type StatsInputs = {
  activities: Array<{ id: string; type: string; title: string; subtitle: string | null; order_num: number; points: number | null; church_id: string | null }>;
  user_progress: Array<{ activity_id: string; completed_at: string; church_id: string | null }>;
  devotional_progress: Array<{ devotional_id: string; completed_at: string; is_recovery: boolean; awarded_points: number | null; church_id: string | null }>;
  lesson_progress: Array<{ lesson_id: string; church_id: string | null }>;
  attendance: Array<{ event_id: string; status: string; church_id: string | null }>;
  worship: Array<{ id: string; status: string; church_id: string | null }>;
  achievement_unlocks: Array<{ achievement_key: string; bonus_points: number | null; church_id: string | null }>;
  courses: Array<{ id: string; church_id: string | null }>;
  lessons: Array<{ id: string; course_id: string; church_id: string | null }>;
  challenges: Array<{ id: string; completed: boolean }>;
  game_config: Array<{ key: string; value: number }>;
  custom_event_types: Array<{ value: string; gives_points: boolean; points: number | null; area: string | null; church_id: string | null }>;
  attended_events: Array<{ id: string; type: string }> | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStatsInputs(value: unknown): StatsInputs | null {
  if (!isRecord(value)) return null;
  const array = (key: string) => Array.isArray(value[key]) ? value[key] : [];
  return {
    activities: array("activities") as StatsInputs["activities"],
    user_progress: array("user_progress") as StatsInputs["user_progress"],
    devotional_progress: array("devotional_progress") as StatsInputs["devotional_progress"],
    lesson_progress: array("lesson_progress") as StatsInputs["lesson_progress"],
    attendance: array("attendance") as StatsInputs["attendance"],
    worship: array("worship") as StatsInputs["worship"],
    achievement_unlocks: array("achievement_unlocks") as StatsInputs["achievement_unlocks"],
    courses: array("courses") as StatsInputs["courses"],
    lessons: array("lessons") as StatsInputs["lessons"],
    challenges: array("challenges") as StatsInputs["challenges"],
    game_config: array("game_config") as StatsInputs["game_config"],
    custom_event_types: array("custom_event_types") as StatsInputs["custom_event_types"],
    attended_events: array("attended_events") as StatsInputs["attended_events"],
  };
}

async function fetchUserStats(
  userId: string,
  churchId: string | null | undefined,
  currentArea?: string,
): Promise<StatsData> {
  const scope = `student-stats:${userId}:${churchId ?? "global"}:${currentArea || "all"}`;
  const bundledResult = await cachedStudentQuery<StatsInputs | null>(
    `${scope}:bundled-v1`,
    async () => {
      const result = await supabase.rpc("get_my_user_stats_inputs", {
        p_church_id: churchId ?? undefined,
      });
      return { data: parseStatsInputs(result.data), error: result.error };
    },
    null,
  );

  let inputs = bundledResult.data;
  if (!inputs) {
    const [
      activitiesRes, progressRes, devProgressRes, lessonResponsesRes, attendanceRes,
      worshipDataRes, achievementUnlocksRes, coursesDataRes, lessonsDataRes,
      challengeDataRes, gameConfigRes, customEventTypesDataRes,
    ] = await Promise.all([
      cachedStudentQuery(`${scope}:activities`, () => supabase.from("activities").select("id, type, title, subtitle, order_num, points, church_id").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : 'church_id.is.null').order("order_num"), []),
      cachedStudentQuery(`${scope}:user_progress`, () => churchId ? supabase.from("user_progress").select("activity_id, completed_at, church_id").eq("user_id", userId).eq("church_id", churchId) : supabase.from("user_progress").select("activity_id, completed_at, church_id").eq("user_id", userId), []),
      cachedStudentQuery(`${scope}:devotional_progress`, () => churchId ? supabase.from("devotional_progress").select("devotional_id, completed_at, is_recovery, awarded_points, church_id").eq("user_id", userId).eq("church_id", churchId) : supabase.from("devotional_progress").select("devotional_id, completed_at, is_recovery, awarded_points, church_id").eq("user_id", userId), []),
      churchId
        ? cachedStudentQuery(`${scope}:lesson_progress`, () => supabase.from("lesson_progress").select("lesson_id, church_id").eq("user_id", userId).eq("is_completed", true).or(`church_id.is.null,church_id.eq.${churchId}`), [])
        : cachedStudentQuery(`${scope}:lesson_progress`, () => supabase.from("lesson_progress").select("lesson_id, church_id").eq("user_id", userId).eq("is_completed", true), []),
      cachedStudentQuery(`${scope}:attendance`, () => churchId ? supabase.from("attendance").select("event_id, status, church_id").eq("user_id", userId).eq("church_id", churchId) : supabase.from("attendance").select("event_id, status, church_id").eq("user_id", userId), []),
      cachedStudentQuery(`${scope}:worship`, () => churchId ? supabase.from("worship_attendance").select("id, status, church_id").eq("user_id", userId).eq("status", "aprovado").eq("church_id", churchId) : supabase.from("worship_attendance").select("id, status, church_id").eq("user_id", userId).eq("status", "aprovado"), []),
      cachedStudentQuery(`${scope}:achievement_unlocks`, () => churchId ? supabase.from("achievement_unlocks").select("achievement_key, bonus_points, church_id").eq("user_id", userId).eq("church_id", churchId) : supabase.from("achievement_unlocks").select("achievement_key, bonus_points, church_id").eq("user_id", userId), []),
      cachedStudentQuery(`${scope}:courses`, () => supabase.from("courses").select("id, church_id").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : 'church_id.is.null'), []),
      cachedStudentQuery(`${scope}:lessons`, () => supabase.from("lessons").select("id, course_id, church_id").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : 'church_id.is.null'), []),
      cachedStudentQuery(`${scope}:challenges`, () => supabase.from("challenge_participants").select("id, completed").eq("user_id", userId).eq("completed", true), []),
      supabase.rpc("get_game_config"),
      cachedStudentQuery(`${scope}:custom_event_types`, () => supabase.from("custom_event_types").select("value, gives_points, points, area, church_id").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : 'church_id.is.null'), []),
    ]);

    inputs = {
      activities: activitiesRes.data ?? [],
      user_progress: progressRes.data ?? [],
      devotional_progress: devProgressRes.data ?? [],
      lesson_progress: lessonResponsesRes.data ?? [],
      attendance: attendanceRes.data ?? [],
      worship: worshipDataRes.data ?? [],
      achievement_unlocks: achievementUnlocksRes.data ?? [],
      courses: coursesDataRes.data ?? [],
      lessons: lessonsDataRes.data ?? [],
      challenges: challengeDataRes.data ?? [],
      game_config: gameConfigRes.data ?? [],
      custom_event_types: customEventTypesDataRes.data ?? [],
      attended_events: null,
    };
  }

  const [scheduledEventsRes, devotionalContentRes, profileRes, lessonPointsRes] = await Promise.all([
    cachedStudentQuery(`${scope}:scheduled-events`, () => supabase.from("events").select("event_date, linked_lesson_id, released_devotional_days, area, community, turma_id, target_user_id, type").not("linked_lesson_id", "is", null).order("event_date"), []),
    cachedStudentQuery(`${scope}:devotional-content`, () => supabase.from("devotional_content").select("id, lesson_id, day_number"), []),
    cachedStudentQuery(`${scope}:streak-profile`, () => supabase.from("profiles").select("area, community, turma_id").eq("user_id", userId).maybeSingle(), null),
    cachedStudentQuery(`${scope}:lesson-points`, () => churchId ? supabase.from("lesson_progress").select("lesson_id, awarded_points").eq("user_id", userId).eq("is_completed", true).or(`church_id.is.null,church_id.eq.${churchId}`) : supabase.from("lesson_progress").select("lesson_id, awarded_points").eq("user_id", userId).eq("is_completed", true), []),
  ]);
  const streakProfile = profileRes.data ?? { area: currentArea ?? null, community: null, turma_id: null };
  const scheduledEvents = scheduledEventsRes.data ?? [];
  const devotionalContent = devotionalContentRes.data ?? [];
  const overlay = await getPendingStudentOverlay(userId);
  const activities = inputs.activities;
  const progress = inputs.user_progress;
  const devProgress = mergeByKey(inputs.devotional_progress, overlay.devotionalProgress, "devotional_id");
  const lessonResponses = mergeByKey(inputs.lesson_progress, overlay.lessonProgress, "lesson_id");
  const attendance = mergeByKey(inputs.attendance, overlay.attendance, "event_id");
  const worshipData = [...inputs.worship, ...overlay.worshipAttendance];
  const achievementUnlocks = inputs.achievement_unlocks;
  const coursesData = inputs.courses;
  const lessonsData = inputs.lessons;
  const challengeData = inputs.challenges;
  const gameConfig = inputs.game_config;
  const customEventTypesData = inputs.custom_event_types;

  const cfgMap = new Map<string, number>((gameConfig ?? []).map((r) => [r.key, Number(r.value)]));
  const cfg = {
    lessonPoints:          cfgMap.get("lesson_points")             ?? 20,
    devotionalPoints:      cfgMap.get("devotional_points")         ?? 5,
    devotionalWeekendPts:  cfgMap.get("devotional_weekend_points") ?? 2,
    devotionalRecoveryPts: cfgMap.get("devotional_recovery_points") ?? 2,
    attendancePoints:      cfgMap.get("attendance_points")         ?? 10,
    worshipPoints:         cfgMap.get("worship_points")            ?? 5,
    courseBonus:           cfgMap.get("course_completion_bonus")   ?? 100,
    challengePoints:       cfgMap.get("challenge_points")          ?? 15,
  };
  const levelThresholds = [
    cfgMap.get("level_2_threshold") ?? 20,
    cfgMap.get("level_3_threshold") ?? 60,
    cfgMap.get("level_4_threshold") ?? 100,
    cfgMap.get("level_5_threshold") ?? 200,
  ];

  const completedIds = new Set(progress.map((p) => p.activity_id));
  const allDates = [
    ...progress.map((p) => p.completed_at),
    ...devProgress.map((p) => p.completed_at),
  ];
  const devotionalSchedule = buildScheduledDevotionalDays(
    scheduledEvents as any[],
    devotionalContent as any[],
    userId,
    { ...streakProfile, area: currentArea || streakProfile.area },
  );
  const devotionalStreak = calculateScheduledDevotionalStreak(
    devotionalSchedule,
    devProgress as any[],
  );

  const activityPoints = activities
    .filter((a) => completedIds.has(a.id) && a.type !== "devocional" && a.type !== "formacao" && a.type !== "encontro")
    .reduce((sum, a) => sum + (a.points ?? 0), 0);

  const devotionalPoints = devProgress.reduce((sum, dp) => {
    if (typeof dp.awarded_points === "number") return sum + dp.awarded_points;
    if (dp.is_recovery) return sum + cfg.devotionalRecoveryPts;
    const dow = new Date(dp.completed_at).getDay();
    return sum + (dow === 0 || dow === 6 ? cfg.devotionalWeekendPts : cfg.devotionalPoints);
  }, 0);

  const relevantCustomTypes = (customEventTypesData ?? []).filter((t) =>
    !t.area || !currentArea || t.area === currentArea
  );
  const customTypeMap = new Map<string, { gives_points: boolean; points: number }>();
  relevantCustomTypes.forEach((t) => {
    const existing = customTypeMap.get(t.value);
    if (!existing || t.area === currentArea) {
      customTypeMap.set(t.value, {
        gives_points: !!t.gives_points,
        points: Number(t.points ?? 0),
      });
    }
  });

  const presentAttendance = (attendance ?? []).filter((a) => a.status === "presente");
  const attendedEventIds = presentAttendance.map((a) => a.event_id).filter(Boolean);
  const eventTypeById = new Map<string, string>();
  if (inputs.attended_events !== null) {
    inputs.attended_events.forEach((event) => eventTypeById.set(event.id, event.type));
  } else if (attendedEventIds.length > 0) {
    const { data: eventsData } = await supabase
      .from("events")
      .select("id, type")
      .in("id", attendedEventIds);
    (eventsData ?? []).forEach((e) => eventTypeById.set(e.id, e.type));
  }

  const completedLessonIds = new Set((lessonResponses ?? []).map((r: any) => r.lesson_id));
  const pointsByLesson = new Map((lessonPointsRes.data ?? []).map((row) => [row.lesson_id, row.awarded_points]));
  for (const action of overlay.actions) {
    if (action.type === "complete_lesson") pointsByLesson.set(action.payload.lessonId, action.payload.isLateAccess ? 0 : action.payload.awardedPoints ?? cfg.lessonPoints);
  }
  const lessonStudyPoints = [...completedLessonIds].reduce((sum, id) => sum + (pointsByLesson.get(id) ?? cfg.lessonPoints), 0);

  const attendancePoints = presentAttendance.reduce((sum, a) => {
    const eventType = eventTypeById.get(a.event_id);
    const custom = eventType ? customTypeMap.get(eventType) : undefined;
    if (custom && custom.gives_points) return sum + custom.points;
    return sum + cfg.attendancePoints;
  }, 0);
  const worshipPoints = (worshipData ?? []).length * cfg.worshipPoints;
  const achievementBonusPoints = (achievementUnlocks ?? []).reduce((sum, a) => sum + (a.bonus_points ?? 0), 0);
  const challengePoints = (challengeData ?? []).length * cfg.challengePoints;

  let courseBonusPoints = 0;
  const allLessons = lessonsData ?? [];
  (coursesData ?? []).forEach((course) => {
    const courseLessons = allLessons.filter((l) => l.course_id === course.id);
    if (courseLessons.length > 0 && courseLessons.every((l) => completedLessonIds.has(l.id))) {
      courseBonusPoints += cfg.courseBonus;
    }
  });

  const faithPoints = activityPoints + devotionalPoints + lessonStudyPoints + attendancePoints + worshipPoints + achievementBonusPoints + courseBonusPoints + challengePoints;

  return {
    faithPoints,
    faithLevel: calculateLevel(faithPoints, levelThresholds),
    streakDays: devotionalStreak.streakDays,
    streakFrozen: devotionalStreak.frozen,
    streakAtRisk: devotionalStreak.atRisk,
    faithEnergy: calculateEnergy(allDates),
    completedCount: completedIds.size,
    nextActivity: activities.find((a) => !completedIds.has(a.id)) ?? null,
    totalActivities: activities.length,
  };
}

const DEFAULT_STATS: StatsData = {
  faithPoints: 0,
  faithLevel: 1,
  streakDays: 0,
  streakFrozen: false,
  streakAtRisk: false,
  faithEnergy: 0,
  completedCount: 0,
  nextActivity: null,
  totalActivities: 0,
};

export function useUserStats(
  userId: string | null | undefined,
  churchId: string | null | undefined,
  currentArea?: string,
): UserStats {
  const persistedKey = userId
    ? `caminho:user-stats:v1:${userId}:${churchId ?? "global"}:${currentArea || "all"}`
    : null;
  let initialData: StatsData | undefined;
  if (persistedKey) {
    try {
      const stored = localStorage.getItem(persistedKey);
      initialData = stored ? JSON.parse(stored) as StatsData : undefined;
    } catch {
      initialData = undefined;
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ["userStats", userId, churchId, currentArea],
    queryFn: async () => {
      const stats = await fetchUserStats(userId!, churchId, currentArea);
      if (persistedKey) {
        try {
          localStorage.setItem(persistedKey, JSON.stringify(stats));
        } catch {
          // Best effort only; live stats still render normally.
        }
      }
      return stats;
    },
    enabled: !!userId,
    initialData,
    initialDataUpdatedAt: initialData ? 0 : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return { ...(data ?? DEFAULT_STATS), loading: isLoading && !data };
}
