import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  buildScheduledDevotionalDays,
  calculateScheduledDevotionalStreak,
} from "@/lib/devotionalStreak";

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

async function fetchUserStats(
  userId: string,
  churchId: string | null | undefined,
  currentArea?: string,
): Promise<StatsData> {
  const results = await Promise.allSettled([
    supabase.from("activities").select("id, type, title, subtitle, order_num, points, church_id").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : 'church_id.is.null').order("order_num"),
    churchId ? supabase.from("user_progress").select("activity_id, completed_at, church_id").eq("user_id", userId).eq("church_id", churchId) : supabase.from("user_progress").select("activity_id, completed_at, church_id").eq("user_id", userId),
    churchId ? supabase.from("devotional_progress").select("devotional_id, completed_at, is_recovery, awarded_points, church_id").eq("user_id", userId).eq("church_id", churchId) : supabase.from("devotional_progress").select("devotional_id, completed_at, is_recovery, awarded_points, church_id").eq("user_id", userId),
    churchId
      ? supabase.from("lesson_progress").select("lesson_id, awarded_points, church_id").eq("user_id", userId).eq("is_completed", true).or(`church_id.is.null,church_id.eq.${churchId}`)
      : supabase.from("lesson_progress").select("lesson_id, awarded_points, church_id").eq("user_id", userId).eq("is_completed", true),
    churchId ? supabase.from("attendance").select("event_id, status, church_id").eq("user_id", userId).eq("church_id", churchId) : supabase.from("attendance").select("event_id, status, church_id").eq("user_id", userId),
    churchId ? supabase.from("worship_attendance").select("id, status, church_id").eq("user_id", userId).eq("status", "aprovado").eq("church_id", churchId) : supabase.from("worship_attendance").select("id, status, church_id").eq("user_id", userId).eq("status", "aprovado"),
    churchId ? supabase.from("achievement_unlocks").select("achievement_key, bonus_points, church_id").eq("user_id", userId).eq("church_id", churchId) : supabase.from("achievement_unlocks").select("achievement_key, bonus_points, church_id").eq("user_id", userId),
    supabase.from("courses").select("id, church_id").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : 'church_id.is.null'),
    supabase.from("lessons").select("id, course_id, church_id").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : 'church_id.is.null'),
    supabase.from("challenge_participants").select("id, completed").eq("user_id", userId).eq("completed", true),
    (supabase as any).rpc("get_game_config"),
    supabase.from("custom_event_types").select("value, gives_points, points, area, church_id").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : 'church_id.is.null'),
    supabase.from("events").select("event_date, linked_lesson_id, released_devotional_days, area, community, turma_id, target_user_id, type").not("linked_lesson_id", "is", null).order("event_date"),
    supabase.from("devotional_content").select("id, lesson_id, day_number"),
    supabase.from("profiles").select("area, community, turma_id").eq("user_id", userId).maybeSingle(),
  ]);

  const [
    activitiesRes, progressRes, devProgressRes, lessonResponsesRes, attendanceRes,
    worshipDataRes, achievementUnlocksRes, coursesDataRes, lessonsDataRes,
    challengeDataRes, gameConfigRes, customEventTypesDataRes,
    scheduledEventsRes, devotionalContentRes, profileRes,
  ] = results.map(r => r.status === 'fulfilled' ? r.value : { data: null, error: (r as any).reason });

  const activities = activitiesRes.data ?? [];
  const progress = progressRes.data ?? [];
  const devProgress = devProgressRes.data ?? [];
  const lessonResponses = lessonResponsesRes.data ?? [];
  const attendance = attendanceRes.data ?? [];
  const worshipData = worshipDataRes.data ?? [];
  const achievementUnlocks = achievementUnlocksRes.data ?? [];
  const coursesData = coursesDataRes.data ?? [];
  const lessonsData = lessonsDataRes.data ?? [];
  const challengeData = challengeDataRes.data ?? [];
  const gameConfig = gameConfigRes.data ?? [];
  const customEventTypesData = customEventTypesDataRes.data ?? [];
  const scheduledEvents = scheduledEventsRes.data ?? [];
  const devotionalContent = devotionalContentRes.data ?? [];
  const streakProfile = profileRes.data ?? { area: currentArea ?? null, community: null, turma_id: null };

  const cfgMap = new Map<string, number>((gameConfig ?? []).map((r: any) => [r.key, Number(r.value)]));
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

  const completedIds = new Set(progress.map((p: any) => p.activity_id));
  const allDates = [
    ...progress.map((p: any) => p.completed_at),
    ...devProgress.map((p: any) => p.completed_at),
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
    .filter((a: any) => completedIds.has(a.id) && a.type !== "devocional" && a.type !== "formacao" && a.type !== "encontro")
    .reduce((sum: number, a: any) => sum + (a.points ?? 0), 0);

  const devotionalPoints = devProgress.reduce((sum: number, dp: any) => {
    if (typeof dp.awarded_points === "number") return sum + dp.awarded_points;
    if (dp.is_recovery) return sum + cfg.devotionalRecoveryPts;
    const dow = new Date(dp.completed_at).getDay();
    return sum + (dow === 0 || dow === 6 ? cfg.devotionalWeekendPts : cfg.devotionalPoints);
  }, 0);

  const relevantCustomTypes = (customEventTypesData ?? []).filter((t: any) =>
    !t.area || !currentArea || t.area === currentArea
  );
  const customTypeMap = new Map<string, { gives_points: boolean; points: number }>();
  relevantCustomTypes.forEach((t: any) => {
    const existing = customTypeMap.get(t.value);
    if (!existing || t.area === currentArea) {
      customTypeMap.set(t.value, {
        gives_points: !!t.gives_points,
        points: Number(t.points ?? 0),
      });
    }
  });

  const presentAttendance = (attendance ?? []).filter((a: any) => a.status === "presente");
  const attendedEventIds = presentAttendance.map((a: any) => a.event_id).filter(Boolean);
  const eventTypeById = new Map<string, string>();
  if (attendedEventIds.length > 0) {
    const { data: eventsData } = await supabase
      .from("events")
      .select("id, type")
      .in("id", attendedEventIds);
    (eventsData ?? []).forEach((e: any) => eventTypeById.set(e.id, e.type));
  }

  const completedLessonIds = new Set((lessonResponses ?? []).map((r: any) => r.lesson_id));
  const lessonStudyPoints = (lessonResponses ?? []).reduce((sum: number, lesson: any) =>
    sum + (typeof lesson.awarded_points === "number" ? lesson.awarded_points : cfg.lessonPoints), 0);

  const attendancePoints = presentAttendance.reduce((sum: number, a: any) => {
    const eventType = eventTypeById.get(a.event_id);
    const custom = eventType ? customTypeMap.get(eventType) : undefined;
    if (custom && custom.gives_points) return sum + custom.points;
    return sum + cfg.attendancePoints;
  }, 0);
  const worshipPoints = (worshipData ?? []).length * cfg.worshipPoints;
  const achievementBonusPoints = (achievementUnlocks ?? []).reduce((sum: number, a: any) => sum + (a.bonus_points ?? 0), 0);
  const challengePoints = (challengeData ?? []).length * cfg.challengePoints;

  let courseBonusPoints = 0;
  const allLessons = lessonsData ?? [];
  (coursesData ?? []).forEach((course: any) => {
    const courseLessons = allLessons.filter((l: any) => l.course_id === course.id);
    if (courseLessons.length > 0 && courseLessons.every((l: any) => completedLessonIds.has(l.id))) {
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
    nextActivity: activities.find((a: any) => !completedIds.has(a.id)) ?? null,
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
  const { data, isLoading } = useQuery({
    queryKey: ["userStats", userId, churchId, currentArea],
    queryFn: () => fetchUserStats(userId!, churchId, currentArea),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return { ...(data ?? DEFAULT_STATS), loading: isLoading && !data };
}
