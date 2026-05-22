import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserStats = {
  faithPoints: number;
  faithLevel: number;
  streakDays: number;
  faithEnergy: number;
  completedCount: number;
  nextActivity: { id: string; type: string; title: string; subtitle: string | null; points: number } | null;
  totalActivities: number;
  loading: boolean;
};

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates.map(d => d.split("T")[0]))].sort((a, b) => b.localeCompare(a));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let check = new Date(today);

  for (const dateStr of unique) {
    const d = new Date(dateStr + "T00:00:00");
    const diff = Math.round((check.getTime() - d.getTime()) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      check = d;
    } else {
      break;
    }
  }
  return streak;
}

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

export function useUserStats(currentArea?: string): UserStats {
  const [stats, setStats] = useState<UserStats>({
    faithPoints: 0,
    faithLevel: 1,
    streakDays: 0,
    faithEnergy: 0,
    completedCount: 0,
    nextActivity: null,
    totalActivities: 0,
    loading: true,
  });

  useEffect(() => {
    async function fetchStats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { 
        console.log("useUserStats: No user found");
        setStats(s => ({ ...s, loading: false })); 
        return; 
      }

      console.log("useUserStats: Fetching stats for user", user.id, "area", currentArea);

      const { data: profile } = await supabase.from("profiles").select("church_id").eq("user_id", user.id).single();
      const churchId = profile?.church_id;

      const applyChurchFilter = (query: any) => churchId 
        ? query.eq("church_id", churchId)
        : query.is("church_id", null);

      const applyChurchOrNull = (query: any) => churchId
        ? query.or(`church_id.is.null,church_id.eq.${churchId}`)
        : query.is("church_id", null);

      console.log("useUserStats: Starting Promise.allSettled for churchId", churchId);
      const results = await Promise.allSettled([
        applyChurchOrNull(supabase.from("activities").select("id, type, title, subtitle, order_num, points, church_id")).order("order_num"),
        applyChurchFilter(supabase.from("user_progress").select("activity_id, completed_at, church_id")).eq("user_id", user.id),
        applyChurchFilter(supabase.from("devotional_progress").select("devotional_id, completed_at, is_recovery, awarded_points, church_id")).eq("user_id", user.id),
        applyChurchFilter(supabase.from("lesson_responses").select("lesson_id, church_id")).eq("user_id", user.id),
        applyChurchFilter(supabase.from("attendance").select("event_id, status, church_id")).eq("user_id", user.id),
        applyChurchFilter(supabase.from("worship_attendance").select("id, status, church_id")).eq("user_id", user.id).eq("status", "aprovado"),
        applyChurchFilter(supabase.from("achievement_unlocks").select("achievement_key, bonus_points, church_id")).eq("user_id", user.id),
        applyChurchOrNull(supabase.from("courses").select("id, church_id")),
        applyChurchOrNull(supabase.from("lessons").select("id, course_id, church_id")),
        supabase.from("challenge_participants").select("id, completed").eq("user_id", user.id).eq("completed", true),
        (supabase as any).rpc("get_game_config"),
        applyChurchOrNull(supabase.from("custom_event_types").select("value, gives_points, points, area, church_id")),
      ]);
      console.log("useUserStats: Promise.allSettled finished");

      const [
        activitiesRes, progressRes, devProgressRes, lessonResponsesRes, attendanceRes, 
        worshipDataRes, achievementUnlocksRes, coursesDataRes, lessonsDataRes, 
        challengeDataRes, gameConfigRes, customEventTypesDataRes
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

      // Include ALL activities from user_progress (matches fixed RPC)
      const activityPoints = activities
        .filter((a: any) => completedIds.has(a.id))
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
      let eventTypeById = new Map<string, string>();
      if (attendedEventIds.length > 0) {
        const { data: eventsData } = await supabase
          .from("events")
          .select("id, type")
          .in("id", attendedEventIds);
        (eventsData ?? []).forEach((e: any) => eventTypeById.set(e.id, e.type));
      }

      const completedLessonIds = new Set((lessonResponses ?? []).map((r: any) => r.lesson_id));
      const lessonStudyPoints = completedLessonIds.size * cfg.lessonPoints;

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
      (coursesData ?? []).forEach((course: any) => {
        const courseLessons = (lessonsData ?? []).filter((l: any) => l.course_id === course.id);
        if (courseLessons.length > 0 && courseLessons.every((l: any) => completedLessonIds.has(l.id))) {
          courseBonusPoints += cfg.courseBonus;
        }
      });

      const faithPoints = activityPoints + devotionalPoints + lessonStudyPoints + attendancePoints + worshipPoints + achievementBonusPoints + courseBonusPoints + challengePoints;

      const faithLevel = calculateLevel(faithPoints, levelThresholds);
      const streakDays = calculateStreak(allDates);
      const faithEnergy = calculateEnergy(allDates);
      const completedCount = completedIds.size;

      const nextActivity = activities.find((a: any) => !completedIds.has(a.id)) ?? null;

      setStats({
        faithPoints,
        faithLevel,
        streakDays,
        faithEnergy,
        completedCount,
        nextActivity,
        totalActivities: activities.length,
        loading: false,
      });
    }
    fetchStats();
  }, [currentArea]);

  return stats;
}
