import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isNotificationEnabled, sendNotification } from "@/lib/notifications";
import { subscribeToWebPush } from "@/lib/webPush";
import {
  buildScheduledDevotionalDays,
  calculateScheduledDevotionalStreak,
} from "@/lib/devotionalStreak";

const NOTIF_SENT_PREFIX = "caminho_notif_sent_";
const NOTIF_RUN_KEY = "caminho_notif_run_today";

function wasSentToday(key: string): boolean {
  const last = localStorage.getItem(NOTIF_SENT_PREFIX + key);
  return last === new Date().toDateString();
}

function wasRunToday(): boolean {
  return localStorage.getItem(NOTIF_RUN_KEY) === new Date().toDateString();
}

function markRunToday() {
  localStorage.setItem(NOTIF_RUN_KEY, new Date().toDateString());
}

function markSentToday(key: string) {
  localStorage.setItem(NOTIF_SENT_PREFIX + key, new Date().toDateString());
}

/**
 * Foreground-only celebration. Informational reminders are sent exclusively by
 * the server, where turma, Agenda dates and expiry can be validated reliably.
 */
export function useAppNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (!isNotificationEnabled()) return;

    void supabase.functions.invoke("get-vapid-key").then(({ data, error }) => {
      if (!error && data?.publicKey) void subscribeToWebPush(data.publicKey);
    });

    if (wasRunToday()) return;

    async function checkAndNotify() {
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("master_enabled, local_enabled")
        .eq("user_id", user.id)
        .maybeSingle();

      if (prefs && (!prefs.master_enabled || prefs.local_enabled === false)) return;

      if (!wasSentToday("lesson_complete")) await checkLessonCompletion();
      markRunToday();
    }

    const timer = setTimeout(checkAndNotify, 2000);
    return () => clearTimeout(timer);
  }, [user]);
}

async function checkLessonCompletion() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const { data: recentResponses } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed_at")
      .eq("user_id", user.id)
      .eq("is_completed", true)
      .gte("completed_at", startOfToday.toISOString());

    if (!recentResponses || recentResponses.length === 0) return;

    const recentLessonIds = [
      ...new Set<string>(
        recentResponses.map((response: { lesson_id: string }) => response.lesson_id),
      ),
    ];
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, title, order_num")
      .in("id", recentLessonIds);

    if (!lessons || lessons.length === 0) return;

    const { data: devs } = await supabase
      .from("devotional_content")
      .select("id, lesson_id")
      .in("lesson_id", recentLessonIds);

    const { data: devProgress } = await supabase
      .from("devotional_progress")
      .select("devotional_id")
      .eq("user_id", user.id);

    const completedDevIds = new Set((devProgress ?? []).map((progress) => progress.devotional_id));

    for (const lesson of lessons) {
      const lessonDevs = (devs ?? []).filter((devotional) => devotional.lesson_id === lesson.id);
      const allDevsCompleted = lessonDevs.length === 0 || lessonDevs.every((devotional) => completedDevIds.has(devotional.id));

      if (allDevsCompleted) {
        await sendNotification(
          "Lição concluída!",
          `Parabéns! Você completou a Lição ${lesson.order_num}: ${lesson.title}. Continue firme na caminhada!`,
        );
        markSentToday("lesson_complete");
        return;
      }
    }
  } catch (err) {
    console.warn("Lesson completion notification check failed", err);
  }
}
