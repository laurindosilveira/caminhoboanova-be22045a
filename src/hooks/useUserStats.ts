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

function calculateLevel(points: number): number {
  if (points >= 200) return 5;
  if (points >= 100) return 4;
  if (points >= 60) return 3;
  if (points >= 20) return 2;
  return 1;
}

function calculateEnergy(dates: string[]): number {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent = dates.filter(d => new Date(d) >= sevenDaysAgo);
  return Math.min(5, recent.length);
}

export function useUserStats(): UserStats {
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
      if (!user) { setStats(s => ({ ...s, loading: false })); return; }

      const [{ data: activities }, { data: progress }, { data: devProgress }, { data: lessonResponses }, { data: attendance }] = await Promise.all([
        supabase.from("activities").select("id, type, title, subtitle, order_num, points").order("order_num"),
        supabase.from("user_progress").select("activity_id, completed_at").eq("user_id", user.id),
        supabase.from("devotional_progress").select("devotional_id, completed_at").eq("user_id", user.id),
        supabase.from("lesson_responses").select("lesson_id").eq("user_id", user.id),
        supabase.from("attendance").select("event_id, status").eq("user_id", user.id),
      ]);

      const acts = activities ?? [];
      const prog = progress ?? [];
      const devProg = devProgress ?? [];
      const completedIds = new Set(prog.map(p => p.activity_id));
      const allDates = [
        ...prog.map(p => p.completed_at),
        ...devProg.map(p => p.completed_at),
      ];

      // New formula: Activity pts + Lesson study (20pts) + Devotionals (5pts) + Attendance (10pts)
      const activityPoints = acts
        .filter(a => completedIds.has(a.id))
        .reduce((sum, a) => sum + (a.points ?? 0), 0);
      const devotionalPoints = devProg.length * 5;
      const lessonStudyPoints = new Set((lessonResponses ?? []).map(r => r.lesson_id)).size * 20;
      const attendancePoints = (attendance ?? []).filter(a => a.status === "presente").length * 10;
      const faithPoints = activityPoints + devotionalPoints + lessonStudyPoints + attendancePoints;

      const faithLevel = calculateLevel(faithPoints);
      const streakDays = calculateStreak(allDates);
      const faithEnergy = calculateEnergy(allDates);
      const completedCount = completedIds.size;

      // Next uncompleted activity in order
      const nextActivity = acts.find(a => !completedIds.has(a.id)) ?? null;

      setStats({
        faithPoints,
        faithLevel,
        streakDays,
        faithEnergy,
        completedCount,
        nextActivity,
        totalActivities: acts.length,
        loading: false,
      });
    }
    fetchStats();
  }, []);

  return stats;
}
