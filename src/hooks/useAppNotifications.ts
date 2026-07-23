import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isNotificationEnabled, sendNotification } from "@/lib/notifications";
import { subscribeToWebPush } from "@/lib/webPush";

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

type UserProfileLite = {
  area: string | null;
  community: string | null;
  turma_id: string | null;
};

async function getCurrentUserProfile(userId: string): Promise<UserProfileLite | null> {
  const { data } = await supabase
    .from("profiles")
    .select("area, community, turma_id")
    .eq("user_id", userId)
    .maybeSingle();

  return data ?? null;
}

function isEventRelevantToUser(
  event: {
    area?: string | null;
    community?: string | null;
    target_user_id?: string | null;
  },
  userId: string,
  profile: UserProfileLite | null,
) {
  if (event.target_user_id && event.target_user_id !== userId) return false;
  if (event.area && profile?.area && event.area !== profile.area) return false;
  if (event.community && profile?.community && event.community !== profile.community) return false;
  return true;
}

/**
 * Checks user activity and sends relevant push notifications
 * once per calendar day when the app is opened.
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
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (prefs && !prefs.master_enabled) return;

      const devocionalOn = prefs ? prefs.devocional : true;
      const eventosOn = prefs ? prefs.eventos : true;
      const streakOn = prefs ? prefs.streak : true;
      const mensagensOn = prefs ? prefs.mensagens : true;

      const checks: Promise<void>[] = [];

      if (devocionalOn && !wasSentToday("devocional")) checks.push(checkDevocional());
      if (streakOn && !wasSentToday("streak")) checks.push(checkStreak());
      if (eventosOn && !wasSentToday("eventos")) checks.push(checkUpcomingEvents());
      if (mensagensOn && !wasSentToday("mensagens")) checks.push(checkNewMessages());
      if (!wasSentToday("lesson_complete")) checks.push(checkLessonCompletion());

      await Promise.allSettled(checks);
      markRunToday();
    }

    const timer = setTimeout(checkAndNotify, 2000);
    return () => clearTimeout(timer);
  }, [user]);
}

async function checkDevocional() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const profile = await getCurrentUserProfile(user.id);
    if (!profile) return;

    const [{ data: events }, { data: devs }, { data: prog }] = await Promise.all([
      supabase.from("events").select("event_date, linked_lesson_id, area, community, turma_id, target_user_id, released_devotional_days").not("linked_lesson_id", "is", null).order("event_date"),
      supabase.from("devotional_content").select("id, lesson_id, day_number, title"),
      supabase.from("devotional_progress").select("devotional_id").eq("user_id", user.id),
    ]);
    const completedSet = new Set((prog ?? []).map((item) => item.devotional_id));
    const relevantEvents = (events ?? []).filter(event =>
      (!event.target_user_id || event.target_user_id === user.id)
      && (!event.area || event.area === profile.area)
      && (!event.turma_id || event.turma_id === profile.turma_id)
      && (!event.community || event.community === profile.community)
    );
    const today = startOfDay(new Date());
    const current = findCurrentDevotional(relevantEvents, today);
    if (!current) return;

    const devotional = (devs ?? []).find(item =>
      item.lesson_id === current.lessonId
      && item.day_number === current.dayNumber
      && !completedSet.has(item.id)
    );
    if (!devotional) return;

    await sendNotification(
      "Devocional do dia",
      devotional.title ? `${devotional.title} está esperando por você.` : "Seu devocional de hoje está esperando por você.",
    );
    markSentToday("devocional");
  } catch (err) {
    console.warn("Devocional notification check failed", err);
  }
}

type ScheduledDevotionalEvent = {
  event_date: string;
  linked_lesson_id: string | null;
  released_devotional_days: number[] | null;
};

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function businessDaysBefore(eventDate: Date, count: number) {
  const days: Date[] = [];
  const cursor = startOfDay(eventDate);
  cursor.setDate(cursor.getDate() - 1);
  while (days.length < count) {
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) days.unshift(new Date(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return days;
}

function findCurrentDevotional(events: ScheduledDevotionalEvent[], today: Date) {
  for (let index = 0; index < events.length; index++) {
    const event = events[index];
    if (!event.linked_lesson_id) continue;
    const eventDate = new Date(event.event_date);
    const previousDate = index > 0 ? new Date(events[index - 1].event_date) : null;
    const autoLimited = previousDate
      ? Math.round((eventDate.getTime() - previousDate.getTime()) / 86400000) < 10
      : false;
    const dates = businessDaysBefore(eventDate, 10);
    const effectiveDates = autoLimited ? dates.slice(5) : dates;
    const dayIndex = effectiveDates.findIndex(date => date.getTime() === today.getTime());
    if (dayIndex < 0) continue;
    const dayNumber = dayIndex + 1;
    const released = event.released_devotional_days;
    if (released && !released.includes(dayNumber)) return null;
    return { lessonId: event.linked_lesson_id, dayNumber };
  }
  return null;
}

async function checkStreak() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: progress }, { data: devProgress }] = await Promise.all([
      supabase.from("user_progress").select("completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(1),
      supabase.from("devotional_progress").select("completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(1),
    ]);

    const dates: Date[] = [];
    if (progress?.[0]?.completed_at) dates.push(new Date(progress[0].completed_at));
    if (devProgress?.[0]?.completed_at) dates.push(new Date(devProgress[0].completed_at));
    if (dates.length === 0) return;

    const lastActivity = new Date(Math.max(...dates.map((date) => date.getTime())));
    const diffDays = Math.floor((Date.now() - lastActivity.getTime()) / 86400000);

    if (diffDays >= 2) {
      const message = diffDays >= 5
        ? `Sua chama esta se apagando. Ja sao ${diffDays} dias sem atividade. Volte e reacenda seu coracao.`
        : `Nao perca sua sequencia. Ja sao ${diffDays} dias sem atividade. Um devocional por dia faz toda a diferenca.`;

      await sendNotification("Sequencia em risco!", message);
      markSentToday("streak");
    }
  } catch (err) {
    console.warn("Streak notification check failed", err);
  }
}

async function checkUpcomingEvents() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const profile = await getCurrentUserProfile(user.id);
    const now = new Date();
    const twoDaysAhead = new Date(now);
    twoDaysAhead.setDate(twoDaysAhead.getDate() + 2);

    const { data } = await supabase
      .from("events")
      .select("title, event_date, location, area, community, target_user_id")
      .gte("event_date", now.toISOString())
      .lte("event_date", twoDaysAhead.toISOString())
      .order("event_date")
      .limit(20);

    const nextRelevantEvent = (data ?? []).find((event) => isEventRelevantToUser(event as any, user.id, profile));
    if (!nextRelevantEvent) return;

    const eventDate = new Date(nextRelevantEvent.event_date);
    const isToday = eventDate.toDateString() === now.toDateString();
    const timeStr = eventDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const dayLabel = isToday ? "hoje" : "em breve";

    await sendNotification(
      `Evento ${dayLabel}!`,
      `${nextRelevantEvent.title} as ${timeStr}${nextRelevantEvent.location ? ` - ${nextRelevantEvent.location}` : ""}`,
    );
    markSentToday("eventos");
  } catch (err) {
    console.warn("Events notification check failed", err);
  }
}

async function checkNewMessages() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const since = new Date(Date.now() - 86400000).toISOString();
    const { count } = await supabase
      .from("messages")
      .select("title", { count: "exact" })
      .gte("created_at", since)
      .limit(1);

    if (count && count > 0) {
      await sendNotification(
        "Novo aviso no app!",
        "Voce tem um novo comunicado. Abra o app para conferir!",
      );
      markSentToday("mensagens");
    }
  } catch (err) {
    console.warn("Messages notification check failed", err);
  }
}

async function checkLessonCompletion() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const since = new Date(Date.now() - 86400000).toISOString();
    const { data: recentResponses } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed_at")
      .eq("user_id", user.id)
      .eq("is_completed", true)
      .gte("completed_at", since);

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
          "Licao concluida!",
          `Parabens! Voce completou a Licao ${lesson.order_num}: ${lesson.title}. Continue firme na caminhada!`,
        );
        markSentToday("lesson_complete");
        return;
      }
    }
  } catch (err) {
    console.warn("Lesson completion notification check failed", err);
  }
}
