import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isNotificationEnabled, sendNotification, scheduleDailyReminder } from "@/lib/notifications";

const NOTIF_SENT_PREFIX = "caminho_notif_sent_";

function wasSentToday(key: string): boolean {
  const last = localStorage.getItem(NOTIF_SENT_PREFIX + key);
  return last === new Date().toDateString();
}

function markSentToday(key: string) {
  localStorage.setItem(NOTIF_SENT_PREFIX + key, new Date().toDateString());
}

/**
 * Hook that checks user activity and sends relevant push notifications
 * when the app is opened. Respects per-category notification preferences.
 */
export function useAppNotifications() {
  const { user } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user || hasRun.current) return;
    if (!isNotificationEnabled()) return;
    hasRun.current = true;

    async function checkAndNotify() {
      // 1. Load notification preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      // If no prefs saved or master disabled, skip
      if (prefs && !prefs.master_enabled) return;

      // Default all on if no record exists
      const devocionalOn = prefs ? prefs.devocional : true;
      const eventosOn = prefs ? prefs.eventos : true;
      const streakOn = prefs ? prefs.streak : true;
      const mensagensOn = prefs ? prefs.mensagens : true;

      // Schedule the daily 7AM devocional reminder (setTimeout-based)
      if (devocionalOn) {
        scheduleDailyReminder();
      }

      // Run checks in parallel
      const checks: Promise<void>[] = [];

      // --- DEVOCIONAL check ---
      if (devocionalOn && !wasSentToday("devocional")) {
        checks.push(checkDevocional());
      }

      // --- STREAK check ---
      if (streakOn && !wasSentToday("streak")) {
        checks.push(checkStreak());
      }

      // --- EVENTOS check ---
      if (eventosOn && !wasSentToday("eventos")) {
        checks.push(checkUpcomingEvents());
      }

      // --- MENSAGENS check ---
      if (mensagensOn && !wasSentToday("mensagens")) {
        checks.push(checkNewMessages());
      }

      await Promise.allSettled(checks);
    }

    // Small delay so the app has time to render
    const timer = setTimeout(checkAndNotify, 3000);
    return () => clearTimeout(timer);
  }, [user]);
}

async function checkDevocional() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: devs }, { data: prog }] = await Promise.all([
      supabase.from("devotional_content").select("id, lesson_id"),
      supabase.from("devotional_progress").select("devotional_id").eq("user_id", user.id),
    ]);

    const completedSet = new Set((prog ?? []).map((p) => p.devotional_id));
    const pending = (devs ?? []).filter((d) => !completedSet.has(d.id));

    if (pending.length > 0) {
      await sendNotification(
        "📖 Devocional pendente!",
        `Você tem ${pending.length} devocional${pending.length > 1 ? "is" : ""} esperando por você. Não perca sua caminhada!`
      );
      markSentToday("devocional");
    }
  } catch (err) {
    console.warn("Devocional notification check failed", err);
  }
}

async function checkStreak() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: prog }, { data: devProg }] = await Promise.all([
      supabase.from("user_progress").select("completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(1),
      supabase.from("devotional_progress").select("completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(1),
    ]);

    const dates: Date[] = [];
    if (prog?.[0]?.completed_at) dates.push(new Date(prog[0].completed_at));
    if (devProg?.[0]?.completed_at) dates.push(new Date(devProg[0].completed_at));

    if (dates.length === 0) return; // Never active, don't nag

    const lastActivity = new Date(Math.max(...dates.map((d) => d.getTime())));
    const diffDays = Math.floor((Date.now() - lastActivity.getTime()) / 86400000);

    if (diffDays >= 2) {
      const msg = diffDays >= 5
        ? `Sua chama está se apagando! Já são ${diffDays} dias sem atividade. Volte e reacenda seu coração! 🔥`
        : `Não perca sua sequência! Já são ${diffDays} dias sem atividade. Um devocional por dia faz toda a diferença! 💪`;

      await sendNotification("🔥 Sequência em risco!", msg);
      markSentToday("streak");
    }
  } catch (err) {
    console.warn("Streak notification check failed", err);
  }
}

async function checkUpcomingEvents() {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 2);

    const { data } = await supabase
      .from("events")
      .select("title, event_date, location")
      .gte("event_date", now.toISOString())
      .lte("event_date", tomorrow.toISOString())
      .order("event_date")
      .limit(1);

    if (data && data.length > 0) {
      const ev = data[0];
      const evDate = new Date(ev.event_date);
      const isToday = evDate.toDateString() === now.toDateString();
      const timeStr = evDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const dayLabel = isToday ? "hoje" : "em breve";

      await sendNotification(
        `📅 Evento ${dayLabel}!`,
        `${ev.title} às ${timeStr}${ev.location ? ` • 📍 ${ev.location}` : ""}`
      );
      markSentToday("eventos");
    }
  } catch (err) {
    console.warn("Events notification check failed", err);
  }
}

async function checkNewMessages() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check for messages from the last 24h
    const since = new Date(Date.now() - 86400000).toISOString();
    const { data, count } = await supabase
      .from("messages")
      .select("title", { count: "exact" })
      .gte("created_at", since)
      .limit(1);

    if (count && count > 0 && data && data.length > 0) {
      await sendNotification(
        "💬 Nova mensagem do pastor!",
        count === 1 ? data[0].title : `Você tem ${count} novas mensagens. Confira!`
      );
      markSentToday("mensagens");
    }
  } catch (err) {
    console.warn("Messages notification check failed", err);
  }
}
