import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Participant = {
  user_id: string;
  full_name: string;
  community: string;
  area: string;
  birth_date: string;
  phone: string;
  completed_count: number;
  completed_activity_ids: string[];
};

type Activity = {
  id: string;
  type: string;
  title: string;
  points: number;
  order_num: number;
  subtitle: string | null;
};

type Props = { participant: Participant; activities: Activity[] };
type ReportMode = "summary" | "complete";

type CategoryItem = {
  id: string;
  title: string;
  subtitle: string;
  date?: string | null;
  points: number;
};

type ReportCategory = {
  key: string;
  label: string;
  count: number;
  points: number;
  color: string;
  items: CategoryItem[];
};

type LessonAnswerGroup = {
  lessonId: string;
  courseTitle: string;
  lessonTitle: string;
  lessonOrder: number;
  completedAt?: string | null;
  points: number;
  answers: Array<{ label: string; response: string }>;
};

type DevotionalAnswerGroup = {
  devotionalId: string;
  lessonTitle: string;
  lessonOrder: number;
  devotionalTitle: string;
  dayNumber: number;
  completedAt?: string | null;
  points: number;
  answers: Array<{ label: string; response: string }>;
};

type LoadedReport = {
  totalPoints: number;
  completedCount: number;
  categories: ReportCategory[];
  lessonGroups: LessonAnswerGroup[];
  devotionalGroups: DevotionalAnswerGroup[];
};

function formatDate(value?: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sem data" : date.toLocaleDateString("pt-BR");
}

function lessonQuestionLabel(
  key: string,
  content?: { icebreaker?: string | null; practice?: string | null; prayer_prompt?: string | null; questions?: string[] | null },
) {
  if (key === "icebreaker") return content?.icebreaker || "Quebra-gelo";
  if (key === "practice") return content?.practice || "Prática da semana";
  if (key === "prayer") return content?.prayer_prompt || "Oração final";
  if (/^q\d+$/.test(key)) {
    const index = Number(key.slice(1));
    return content?.questions?.[index] || `Pergunta ${index + 1}`;
  }
  return key;
}

function responseOrder(key: string) {
  if (key === "icebreaker") return 0;
  if (/^q\d+$/.test(key)) return 1 + Number(key.slice(1));
  if (key === "practice") return 1000;
  if (key === "prayer") return 1001;
  return 2000;
}

function parseManualBonus(rawKey: string) {
  if (!rawKey.startsWith("bonus_lider|")) return null;
  const parts = rawKey.split("|");
  return {
    category: parts.length >= 3 ? parts[1] || "conquista" : "conquista",
    justification: parts.length >= 3
      ? decodeURIComponent(parts.slice(2).join("|"))
      : rawKey.slice("bonus_lider|".length),
  };
}

export default function PastoralReportPDF({ participant: p }: Props) {
  const [reportMode, setReportMode] = useState<ReportMode>("summary");
  const [loadingData, setLoadingData] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<LoadedReport | null>(null);

  async function loadData() {
    setLoadingData(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("church_id, community, area")
        .eq("user_id", p.user_id)
        .maybeSingle();
      const churchId = profile?.church_id ?? null;
      const churchScope = churchId ? `church_id.is.null,church_id.eq.${churchId}` : "church_id.is.null";

      const [
        { data: rankingRows },
        { data: gameConfig },
        { data: lessons },
        { data: courses },
        { data: lessonProgress },
        { data: lessonResponses },
        { data: lessonContents },
        { data: devotionals },
        { data: devotionalProgress },
        { data: devotionalResponses },
        { data: attendance },
        { data: events },
        { data: worship },
        { data: achievements },
        { data: userProgress },
        { data: activityCatalog },
        { data: challenges },
        { data: challengeCatalog },
        { data: customEventTypes },
      ] = await Promise.all([
        supabase.rpc("get_community_ranking" as any, { _community: profile?.community ?? p.community, _church_id: churchId }),
        supabase.rpc("get_game_config" as any),
        supabase.from("lessons").select("id, title, course_id, order_num").or(churchScope),
        supabase.from("courses").select("id, title, order_num").or(churchScope),
        supabase.from("lesson_progress").select("lesson_id, completed_at, awarded_points").eq("user_id", p.user_id).eq("is_completed", true).or(churchScope),
        supabase.from("lesson_responses").select("lesson_id, question_key, response, created_at").eq("user_id", p.user_id).or(churchScope),
        supabase.from("lesson_content").select("lesson_id, icebreaker, practice, prayer_prompt, questions").or(churchScope),
        supabase.from("devotional_content").select("id, title, day_number, lesson_id, questions").or(churchScope),
        supabase.from("devotional_progress").select("id, devotional_id, completed_at, awarded_points, is_recovery").eq("user_id", p.user_id).or(churchScope),
        supabase.from("devotional_responses").select("devotional_id, question_index, response, created_at").eq("user_id", p.user_id).or(churchScope),
        supabase.from("attendance").select("id, event_id, status, created_at").eq("user_id", p.user_id).or(churchScope),
        supabase.from("events").select("id, title, event_date, type").or(churchScope),
        supabase.from("worship_attendance").select("id, worship_date, preacher_name, status, created_at").eq("user_id", p.user_id).eq("status", "aprovado").or(churchScope),
        supabase.from("achievement_unlocks").select("id, achievement_key, bonus_points, unlocked_at").eq("user_id", p.user_id).or(churchScope),
        supabase.from("user_progress").select("id, activity_id, completed_at").eq("user_id", p.user_id).or(churchScope),
        supabase.from("activities").select("id, title, points, type").or(churchScope),
        supabase.from("challenge_participants").select("id, challenge_id, completed_at").eq("user_id", p.user_id).eq("completed", true),
        supabase.from("community_challenges").select("id, title, emoji"),
        supabase.from("custom_event_types").select("value, gives_points, points, area, church_id").or(churchScope),
      ]);

      const cfg = new Map<string, number>((gameConfig ?? []).map((row: any) => [row.key, Number(row.value)]));
      const lessonDefault = cfg.get("lesson_points") ?? 20;
      const devotionalDefault = cfg.get("devotional_points") ?? 5;
      const devotionalWeekend = cfg.get("devotional_weekend_points") ?? 2;
      const devotionalRecovery = cfg.get("devotional_recovery_points") ?? 2;
      const attendanceDefault = cfg.get("attendance_points") ?? 15;
      const worshipDefault = cfg.get("worship_points") ?? 5;
      const challengeDefault = cfg.get("challenge_points") ?? 15;

      const lessonMap = new Map((lessons ?? []).map((item: any) => [item.id, item]));
      const courseMap = new Map((courses ?? []).map((item: any) => [item.id, item]));
      const lessonContentMap = new Map((lessonContents ?? []).map((item: any) => [item.lesson_id, item]));
      const devotionalMap = new Map((devotionals ?? []).map((item: any) => [item.id, item]));
      const eventMap = new Map((events ?? []).map((item: any) => [item.id, item]));
      const activityMap = new Map((activityCatalog ?? []).map((item: any) => [item.id, item]));
      const challengeMap = new Map((challengeCatalog ?? []).map((item: any) => [item.id, item]));

      const eventTypeMap = new Map<string, { gives_points: boolean; points: number }>();
      (customEventTypes ?? [])
        .filter((item: any) => !item.area || item.area === (profile?.area ?? p.area))
        .sort((a: any, b: any) => Number(!!a.church_id) - Number(!!b.church_id) || Number(!!a.area) - Number(!!b.area))
        .forEach((item: any) => eventTypeMap.set(item.value, { gives_points: !!item.gives_points, points: Number(item.points ?? 0) }));

      const lessonItems: CategoryItem[] = (lessonProgress ?? []).map((progress: any) => {
        const lesson = lessonMap.get(progress.lesson_id) as any;
        const course = lesson ? courseMap.get(lesson.course_id) as any : null;
        return {
          id: progress.lesson_id,
          title: lesson?.title ?? "Lição",
          subtitle: course?.title ?? "Curso",
          date: progress.completed_at,
          points: Number(progress.awarded_points ?? lessonDefault),
        };
      });

      const devotionalItems: CategoryItem[] = (devotionalProgress ?? []).map((progress: any) => {
        const devotional = devotionalMap.get(progress.devotional_id) as any;
        const completedDate = new Date(progress.completed_at);
        const weekend = [0, 6].includes(completedDate.getDay());
        const points = progress.awarded_points ?? (progress.is_recovery ? devotionalRecovery : weekend ? devotionalWeekend : devotionalDefault);
        return {
          id: progress.devotional_id,
          title: devotional?.title ?? "Devocional",
          subtitle: progress.is_recovery ? "Recuperado" : `Dia ${devotional?.day_number ?? "—"}`,
          date: progress.completed_at,
          points: Number(points),
        };
      });

      const buildAttendanceItem = (record: any): CategoryItem => {
        const event = eventMap.get(record.event_id) as any;
        const custom = eventTypeMap.get(event?.type ?? "");
        const present = record.status === "presente";
        return {
          id: record.id,
          title: event?.title ?? "Encontro",
          subtitle: present ? "Presente" : ["justificou", "justificado"].includes(record.status) ? "Falta justificada" : "Faltou",
          date: event?.event_date ?? record.created_at,
          points: present ? Number(custom?.gives_points ? custom.points : attendanceDefault) : 0,
        };
      };

      // O relatório do Ranking separa cada tipo de presença. Mantemos o mesmo
      // agrupamento aqui para que as quantidades possam ser comparadas diretamente.
      const eventCategoryItems = new Map<string, CategoryItem[]>();
      (attendance ?? []).forEach((record: any) => {
        const event = eventMap.get(record.event_id) as any;
        const category = event?.type || "encontro";
        const current = eventCategoryItems.get(category) ?? [];
        current.push(buildAttendanceItem(record));
        eventCategoryItems.set(category, current);
      });

      const worshipItems: CategoryItem[] = [...(eventCategoryItems.get("culto") ?? []), ...(worship ?? []).map((record: any) => ({
        id: record.id,
        title: `Culto · ${record.preacher_name}`,
        subtitle: "Presença aprovada",
        date: record.worship_date ?? record.created_at,
        points: worshipDefault,
      }))];
      eventCategoryItems.delete("culto");

      const achievementItems: CategoryItem[] = [];
      (achievements ?? []).forEach((record: any) => {
        const manual = parseManualBonus(record.achievement_key);
        const item: CategoryItem = {
          id: record.id,
          title: manual ? "Bônus do líder" : record.achievement_key,
          subtitle: manual?.justification || "Conquista ou bônus",
          date: record.unlocked_at,
          points: Number(record.bonus_points ?? 0),
        };

        if (!manual || manual.category === "conquista") achievementItems.push(item);
        else if (manual.category === "lesson") lessonItems.push(item);
        else if (manual.category === "devotional") devotionalItems.push(item);
        else if (manual.category === "worship") worshipItems.push(item);
        else if (manual.category === "culto") worshipItems.push(item);
        else {
          const current = eventCategoryItems.get(manual.category) ?? [];
          current.push(item);
          eventCategoryItems.set(manual.category, current);
        }
      });

      const extraItems: CategoryItem[] = (userProgress ?? []).map((record: any) => {
        const activity = activityMap.get(record.activity_id) as any;
        return {
          id: record.id,
          title: activity?.title ?? "Atividade extra",
          subtitle: "Atividade concluída",
          date: record.completed_at,
          points: Number(activity?.points ?? 0),
        };
      });

      const challengeItems: CategoryItem[] = (challenges ?? []).map((record: any) => {
        const challenge = challengeMap.get(record.challenge_id) as any;
        return {
          id: record.id,
          title: `${challenge?.emoji ?? ""} ${challenge?.title ?? "Desafio"}`.trim(),
          subtitle: "Desafio concluído",
          date: record.completed_at,
          points: challengeDefault,
        };
      });

      const ranking = (rankingRows ?? []).find((row: any) => row.user_id === p.user_id) as any;
      const courseBonus = Number(ranking?.course_bonus ?? 0);
      if (courseBonus > 0) {
        achievementItems.push({ id: "course-bonus", title: "Bônus por curso concluído", subtitle: "Conclusão de curso", points: courseBonus });
      }

      const makeCategory = (key: string, label: string, color: string, items: CategoryItem[]): ReportCategory => ({
        key,
        label,
        color,
        items,
        count: items.length,
        points: items.reduce((sum, item) => sum + item.points, 0),
      });

      const eventMeta: Record<string, { label: string; color: string; order: number }> = {
        jemiac: { label: "JEMIAC", color: "#059669", order: 1 },
        confirmatorio: { label: "Ensino Confirmatório", color: "#0D9488", order: 2 },
        encontro: { label: "Encontro", color: "#16A34A", order: 3 },
        retiro: { label: "Retiro", color: "#EA580C", order: 4 },
        evento: { label: "Evento", color: "#0284C7", order: 5 },
      };
      const eventCategories = [...eventCategoryItems.entries()]
        .sort(([left], [right]) => (eventMeta[left]?.order ?? 99) - (eventMeta[right]?.order ?? 99))
        .map(([key, items]) => makeCategory(
          `attendance-${key}`,
          eventMeta[key]?.label ?? key,
          eventMeta[key]?.color ?? "#059669",
          items,
        ));

      const categories = [
        makeCategory("devotionals", "Devocionais", "#7C3AED", devotionalItems),
        ...eventCategories,
        makeCategory("worship", "Cultos", "#D97706", worshipItems),
        makeCategory("lessons", "Lições", "#2563EB", lessonItems),
        makeCategory("achievements", "Conquistas", "#CA8A04", achievementItems),
        makeCategory("extras", "Atividades e desafios", "#475569", [...extraItems, ...challengeItems]),
      ].filter((category) => category.count > 0);

      const lessonProgressMap = new Map((lessonProgress ?? []).map((item: any) => [item.lesson_id, item]));
      const responsesByLesson = new Map<string, any[]>();
      (lessonResponses ?? []).forEach((answer: any) => {
        const current = responsesByLesson.get(answer.lesson_id) ?? [];
        current.push(answer);
        responsesByLesson.set(answer.lesson_id, current);
      });
      const lessonGroups: LessonAnswerGroup[] = [...responsesByLesson.entries()].map(([lessonId, answers]) => {
        const lesson = lessonMap.get(lessonId) as any;
        const course = lesson ? courseMap.get(lesson.course_id) as any : null;
        const content = lessonContentMap.get(lessonId) as any;
        const progress = lessonProgressMap.get(lessonId) as any;
        return {
          lessonId,
          courseTitle: course?.title ?? "Curso",
          lessonTitle: lesson?.title ?? "Lição",
          lessonOrder: Number(lesson?.order_num ?? 9999),
          completedAt: progress?.completed_at ?? answers[0]?.created_at,
          points: Number(progress?.awarded_points ?? lessonDefault),
          answers: answers
            .sort((a, b) => responseOrder(a.question_key) - responseOrder(b.question_key))
            .map((answer) => ({ label: lessonQuestionLabel(answer.question_key, content), response: answer.response || "Sem resposta" })),
        };
      }).sort((a, b) => a.courseTitle.localeCompare(b.courseTitle, "pt-BR") || a.lessonOrder - b.lessonOrder);

      const devotionalProgressMap = new Map((devotionalProgress ?? []).map((item: any) => [item.devotional_id, item]));
      const responsesByDevotional = new Map<string, any[]>();
      (devotionalResponses ?? []).forEach((answer: any) => {
        const current = responsesByDevotional.get(answer.devotional_id) ?? [];
        current.push(answer);
        responsesByDevotional.set(answer.devotional_id, current);
      });
      const devotionalGroups: DevotionalAnswerGroup[] = [...responsesByDevotional.entries()].map(([devotionalId, answers]) => {
        const devotional = devotionalMap.get(devotionalId) as any;
        const lesson = devotional?.lesson_id ? lessonMap.get(devotional.lesson_id) as any : null;
        const progress = devotionalProgressMap.get(devotionalId) as any;
        const completedDate = progress?.completed_at ? new Date(progress.completed_at) : null;
        const weekend = completedDate ? [0, 6].includes(completedDate.getDay()) : false;
        return {
          devotionalId,
          lessonTitle: lesson?.title ?? "Sem lição vinculada",
          lessonOrder: Number(lesson?.order_num ?? 9999),
          devotionalTitle: devotional?.title ?? "Devocional",
          dayNumber: Number(devotional?.day_number ?? 0),
          completedAt: progress?.completed_at ?? answers[0]?.created_at,
          points: Number(progress?.awarded_points ?? (progress?.is_recovery ? devotionalRecovery : weekend ? devotionalWeekend : devotionalDefault)),
          answers: answers
            .sort((a, b) => a.question_index - b.question_index)
            .map((answer) => ({
              label: devotional?.questions?.[answer.question_index] || `Pergunta ${answer.question_index + 1}`,
              response: answer.response || "Sem resposta",
            })),
        };
      }).sort((a, b) => a.lessonOrder - b.lessonOrder || a.dayNumber - b.dayNumber);

      setReport({
        totalPoints: Number(ranking?.faith_points ?? categories.reduce((sum, category) => sum + category.points, 0)),
        // A janela do Ranking mostra todos os itens detalhados, inclusive conquistas,
        // bônus e conclusão de curso. A RPC não inclui todos eles no completed_count.
        completedCount: categories.reduce((sum, category) => sum + category.count, 0),
        categories,
        lessonGroups,
        devotionalGroups,
      });
    } finally {
      setLoadingData(false);
    }
  }

  async function generatePDF() {
    if (!report) return;
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const width = 210;
      const height = 297;
      const margin = 15;
      const contentWidth = width - margin * 2;
      let y = 18;

      const addPage = () => {
        doc.addPage();
        y = 18;
      };
      const ensure = (needed: number) => {
        if (y + needed > height - 18) addPage();
      };
      const text = (value: string, x: number, top: number, size = 9, bold = false, color = "#1E293B") => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        doc.setTextColor(color);
        doc.text(value, x, top);
      };
      const wrapped = (value: string, x: number, maxWidth: number, size = 9, color = "#334155") => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(size);
        doc.setTextColor(color);
        const lines = doc.splitTextToSize(value || "Sem resposta", maxWidth);
        for (const line of lines) {
          ensure(5);
          doc.text(line, x, y);
          y += 4.2;
        }
      };
      const section = (title: string, color = "#1F3C88") => {
        ensure(16);
        y += 4;
        doc.setFillColor(color);
        doc.roundedRect(margin, y, contentWidth, 9, 2, 2, "F");
        text(title, margin + 4, y + 6, 11, true, "#FFFFFF");
        y += 14;
      };
      const itemHeader = (title: string, subtitle: string) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        const titleLines = doc.splitTextToSize(title, contentWidth - 8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        const subtitleLines = doc.splitTextToSize(subtitle, contentWidth - 8);
        const boxHeight = 5 + titleLines.length * 4 + subtitleLines.length * 3.5;
        ensure(boxHeight + 4);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "FD");
        let lineY = y + 5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor("#1E293B");
        titleLines.forEach((line: string) => {
          doc.text(line, margin + 4, lineY);
          lineY += 4;
        });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor("#64748B");
        subtitleLines.forEach((line: string) => {
          doc.text(line, margin + 4, lineY);
          lineY += 3.5;
        });
        y += boxHeight + 4;
      };
      const answer = (label: string, value: string) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor("#475569");
        const labelLines = doc.splitTextToSize(label || "Pergunta", contentWidth - 6);
        for (const line of labelLines) {
          ensure(5);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor("#475569");
          doc.text(line, margin + 3, y);
          y += 4.2;
        }
        y += 1;
        wrapped(value, margin + 6, contentWidth - 9, 8.5);
        y += 2;
      };

      doc.setFillColor(31, 60, 136);
      doc.rect(0, 0, width, 39, "F");
      text(reportMode === "complete" ? "RELATÓRIO COMPLETO" : "RELATÓRIO BÁSICO", margin, 15, 17, true, "#FFFFFF");
      text(p.full_name, margin, 25, 11, true, "#DBEAFE");
      text(`${p.community} · ${p.area} · Gerado em ${new Date().toLocaleDateString("pt-BR")}`, margin, 33, 8.5, false, "#BFDBFE");
      y = 48;

      section("DADOS GERAIS");
      const cardGap = 4;
      const cardWidth = (contentWidth - cardGap) / 2;
      const cards = [
        { label: "Pontos da fé", value: String(report.totalPoints) },
        { label: "Atividades concluídas", value: String(report.completedCount) },
      ];
      cards.forEach((card, index) => {
        const x = margin + index * (cardWidth + cardGap);
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(x, y, cardWidth, 21, 2, 2, "F");
        text(card.value, x + 4, y + 9, 15, true, "#1F3C88");
        text(card.label, x + 4, y + 16, 8, false, "#64748B");
      });
      y += 27;

      section("RESUMO POR CATEGORIA");
      for (const category of report.categories) {
        ensure(18);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "FD");
        doc.setFillColor(category.color);
        doc.roundedRect(margin, y, 3, 14, 1, 1, "F");
        text(category.label, margin + 7, y + 6, 9.5, true);
        text(`${category.count} registro(s)`, margin + 7, y + 11, 7.5, false, "#64748B");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(category.color);
        doc.text(`${category.points} pts`, width - margin - 5, y + 8, { align: "right" });
        y += 18;
      }

      if (reportMode === "complete") {
        for (const category of report.categories) {
          section(category.label.toUpperCase(), category.color);
          if (category.items.length === 0) {
            text("Nenhum registro nesta categoria.", margin + 3, y, 9, false, "#94A3B8");
            y += 8;
            continue;
          }
          for (const item of category.items) {
            itemHeader(item.title, `${item.subtitle} · ${formatDate(item.date)} · ${item.points} pts`);
          }
        }

        section("RESPOSTAS DAS LIÇÕES", "#2563EB");
        if (report.lessonGroups.length === 0) {
          text("Nenhuma resposta de lição registrada.", margin + 3, y, 9, false, "#94A3B8");
          y += 8;
        }
        let currentCourse = "";
        for (const group of report.lessonGroups) {
          if (group.courseTitle !== currentCourse) {
            currentCourse = group.courseTitle;
            ensure(10);
            text(currentCourse, margin, y, 11, true, "#1D4ED8");
            y += 7;
          }
          itemHeader(group.lessonTitle, `${formatDate(group.completedAt)} · ${group.points} pts · ${group.answers.length} resposta(s)`);
          for (const item of group.answers) answer(item.label, item.response);
          y += 3;
        }

        section("RESPOSTAS DOS DEVOCIONAIS", "#7C3AED");
        if (report.devotionalGroups.length === 0) {
          text("Nenhuma resposta de devocional registrada.", margin + 3, y, 9, false, "#94A3B8");
          y += 8;
        }
        let currentLesson = "";
        for (const group of report.devotionalGroups) {
          if (group.lessonTitle !== currentLesson) {
            currentLesson = group.lessonTitle;
            ensure(10);
            text(currentLesson, margin, y, 11, true, "#6D28D9");
            y += 7;
          }
          itemHeader(group.devotionalTitle, `Dia ${group.dayNumber || "—"} · ${formatDate(group.completedAt)} · ${group.points} pts`);
          for (const item of group.answers) answer(item.label, item.response);
          y += 3;
        }
      }

      const pageCount = doc.getNumberOfPages();
      for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);
        doc.setFillColor(31, 60, 136);
        doc.rect(0, 286, width, 11, "F");
        text("Caminho Boa Nova · Relatório por categorias", margin, 293, 8, false, "#DBEAFE");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor("#DBEAFE");
        doc.text(`Pág. ${page}/${pageCount}`, width - margin, 293, { align: "right" });
      }

      const prefix = reportMode === "complete" ? "Relatorio_Completo" : "Relatorio_Basico";
      doc.save(`${prefix}_${p.full_name.replace(/\s+/g, "_")}.pdf`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
        <FileText className="h-4 w-4 text-primary" />
        <p className="font-montserrat text-sm font-bold text-foreground">Relatório por categorias</p>
      </div>
      <div className="space-y-4 p-4">
        {!report ? (
          <button
            onClick={loadData}
            disabled={loadingData}
            className="w-full rounded-xl bg-muted py-2.5 font-inter text-sm font-medium text-foreground transition-colors hover:bg-muted/70 disabled:opacity-60"
          >
            {loadingData ? "Carregando dados..." : "Carregar dados do relatório"}
          </button>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReportMode("summary")}
                className={`rounded-xl border-2 p-3 text-left ${reportMode === "summary" ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <span className="block font-inter text-sm font-semibold text-foreground">Relatório básico</span>
                <span className="mt-1 block font-inter text-[11px] text-muted-foreground">Dados gerais e resumo por categoria</span>
              </button>
              <button
                type="button"
                onClick={() => setReportMode("complete")}
                className={`rounded-xl border-2 p-3 text-left ${reportMode === "complete" ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <span className="block font-inter text-sm font-semibold text-foreground">Relatório completo</span>
                <span className="mt-1 block font-inter text-[11px] text-muted-foreground">Categorias, detalhes e todas as respostas</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/30 p-3 sm:grid-cols-3">
              {report.categories.map((category) => (
                <div key={category.key} className="rounded-lg bg-background p-2">
                  <p className="truncate font-inter text-[11px] text-muted-foreground">{category.label}</p>
                  <p className="font-montserrat text-sm font-bold text-foreground">{category.count} · {category.points} pts</p>
                </div>
              ))}
            </div>

            {reportMode === "complete" && (
              <p className="rounded-xl bg-primary/5 p-3 font-inter text-xs text-muted-foreground">
                O PDF completo incluirá {report.lessonGroups.reduce((sum, group) => sum + group.answers.length, 0)} resposta(s) de lições e {report.devotionalGroups.reduce((sum, group) => sum + group.answers.length, 0)} resposta(s) de devocionais, agrupadas por curso e lição.
              </p>
            )}

            <button
              onClick={generatePDF}
              disabled={generating}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-inter text-sm font-medium text-primary-foreground disabled:opacity-70"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Download className="h-4 w-4" />
              {generating ? "Gerando PDF..." : reportMode === "complete" ? "Baixar relatório completo" : "Baixar relatório básico"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
