import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart, BookOpen, GraduationCap, Flame, CheckCircle2,
  Send, Sparkles, AlertCircle, ChevronRight, ChevronDown, CalendarDays, Lock
} from "lucide-react";
import JourneyLessonView from "@/components/home/JourneyLessonView";
import LessonChoiceView from "@/components/home/LessonChoiceView";
import { useAgendaSchedule } from "@/hooks/useAgendaSchedule";

import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────
type Assessment = {
  id: string; month: number; year: number;
  prayer_score: number | null; presence_score: number | null;
  struggle_score: number | null; doubt_score: number | null;
  needs_pastor: boolean; notes: string | null;
};
type Plan = {
  objectives: string | null; challenges: string | null;
  recommendations: string | null; next_steps: string | null;
  health_status: string;
};
type Activity = { id: string; type: string; title: string; points: number };
type Progress = { activity_id: string };
type Lesson = { id: string; title: string; order_num: number; objective: string | null; topics: string[] | null; course_id: string };
type Course = { id: string; order_num: number; title: string; subtitle: string | null; lessons: Lesson[] };
type AttendanceRecord = { event_id: string; status: string };
type EventRecord = { id: string; title: string; event_date: string; type: string };

// ─── Emoji scale ─────────────────────────────────────────
const EMOJIS = ["😔", "😐", "🙂", "😊", "🔥"];

function EmojiScale({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2 justify-center">
      {EMOJIS.map((emoji, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`text-2xl p-1.5 rounded-xl transition-all ${
            value === i + 1 ? "bg-primary/15 scale-125 ring-2 ring-primary" : "opacity-50 hover:opacity-80 hover:scale-110"
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

// ─── Health status pill ──────────────────────────────────
function HealthBadge({ status }: { status: string }) {
  const cfg = {
    saudavel: { label: "🟢 Saudável", bg: "bg-brand-green/10", text: "text-brand-green" },
    atencao:  { label: "🟡 Atenção", bg: "bg-accent/20", text: "text-accent-foreground" },
    critico:  { label: "🔴 Precisa de cuidado", bg: "bg-destructive/10", text: "text-destructive" },
  }[status] ?? { label: "🟡 Atenção", bg: "bg-accent/20", text: "text-accent-foreground" };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-inter font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

// ─── Compute health from scores ──────────────────────────
function computeHealth(a: Assessment | null): string {
  if (!a) return "atencao";
  const pos = ((a.prayer_score ?? 3) + (a.presence_score ?? 3)) / 2;
  const neg = ((a.struggle_score ?? 3) + (a.doubt_score ?? 3)) / 2;
  const score = pos - (neg - 3) * 0.5;
  if (score >= 3.8) return "saudavel";
  if (score >= 2.5) return "atencao";
  return "critico";
}

// ─── Section card ────────────────────────────────────────
function SectionCard({ icon, title, children }: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2.5 border-b border-border bg-muted/30">
        {icon}
        <p className="font-montserrat font-bold text-foreground text-sm">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Progress ring ────────────────────────────────────────
function ProgressRing({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────
type DiscipleshipTabProps = {
  targetLessonId?: string | null;
  onTargetLessonConsumed?: () => void;
};

export default function DiscipleshipTab({ targetLessonId, onTargetLessonConsumed }: DiscipleshipTabProps = {}) {
  const { profile } = useAuth();
  const agendaSchedule = useAgendaSchedule();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLessonMode, setSelectedLessonMode] = useState<"choice" | "study">("choice");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  // Lesson IDs that have at least one saved response
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  // Track full lesson completion: study done + all devotionals done
  const [fullyCompletedLessonIds, setFullyCompletedLessonIds] = useState<Set<string>>(new Set());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [recentEvents, setRecentEvents] = useState<EventRecord[]>([]);
  const [allAssessments, setAllAssessments] = useState<Assessment[]>([]);
  const [worshipCount, setWorshipCount] = useState(0);
  const [unlockedCourseIds, setUnlockedCourseIds] = useState<Set<string>>(new Set());
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpType, setHelpType] = useState<"crise" | "conversar" | "oracao" | null>(null);
  const [helpMessage, setHelpMessage] = useState("");
  const [helpSending, setHelpSending] = useState(false);
  const [helpSent, setHelpSent] = useState(false);

  const [form, setForm] = useState({
    prayer_score: null as number | null,
    presence_score: null as number | null,
    struggle_score: null as number | null,
    doubt_score: null as number | null,
    needs_pastor: false,
    notes: "",
  });

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => { fetchAll(); }, []);

  // Auto-open lesson when navigating from agenda
  useEffect(() => {
    if (targetLessonId && !loading && courses.length > 0) {
      const lesson = courses.flatMap(c => c.lessons).find(l => l.id === targetLessonId);
      if (lesson) {
        setSelectedLesson(lesson);
        setSelectedLessonMode("choice");
        // Expand the course containing this lesson
        const course = courses.find(c => c.lessons.some(l => l.id === targetLessonId));
        if (course) setExpandedCourse(course.id);
      }
      onTargetLessonConsumed?.();
    }
  }, [targetLessonId, loading, courses]);

  async function fetchAll() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [{ data: acts }, { data: prog }, { data: assess }, { data: planData }, { data: coursesData }, { data: lessonsData }, { data: responsesData }, { data: eventsData }, { data: attendanceData }, { data: allAssess }, { data: devContentData }, { data: devProgressData }, { data: worshipData }, { data: unlocksData }] = await Promise.all([
      supabase.from("activities").select("id, type, title, points"),
      supabase.from("user_progress").select("activity_id").eq("user_id", user.id),
      supabase.from("spiritual_assessments").select("*").eq("user_id", user.id).eq("month", month).eq("year", year).maybeSingle(),
      supabase.from("discipleship_plans").select("objectives,challenges,recommendations,next_steps,health_status").eq("user_id", user.id).maybeSingle(),
      supabase.from("courses").select("*").order("order_num"),
      supabase.from("lessons").select("id, title, order_num, objective, topics, course_id").order("order_num"),
      supabase.from("lesson_responses").select("lesson_id").eq("user_id", user.id),
      supabase.from("events").select("id, title, event_date, type").order("event_date", { ascending: false }).limit(10),
      supabase.from("attendance").select("event_id, status").eq("user_id", user.id),
      supabase.from("spiritual_assessments").select("*").eq("user_id", user.id).order("year", { ascending: true }).order("month", { ascending: true }),
      supabase.from("devotional_content").select("id, lesson_id").not("lesson_id", "is", null),
      supabase.from("devotional_progress").select("devotional_id").eq("user_id", user.id),
      supabase.from("worship_attendance").select("id").eq("user_id", user.id).eq("status", "aprovado"),
      supabase.from("course_unlocks").select("course_id").eq("area", profile?.area ?? ""),
    ]);

    setActivities(acts ?? []);
    setProgress(prog ?? []);
    setAssessment(assess ?? null);
    setPlan(planData ?? null);

    // Track which lessons have at least one response
    const lessonIdsWithResponses = new Set((responsesData ?? []).map(r => r.lesson_id));
    setCompletedLessonIds(lessonIdsWithResponses);

    // Compute fully completed lessons: has responses + all devotionals done
    const devsByLesson: Record<string, string[]> = {};
    (devContentData ?? []).forEach((d: any) => {
      if (d.lesson_id) {
        if (!devsByLesson[d.lesson_id]) devsByLesson[d.lesson_id] = [];
        devsByLesson[d.lesson_id].push(d.id);
      }
    });
    const completedDevIds = new Set((devProgressData ?? []).map((p: any) => p.devotional_id));
    const fullyDone = new Set<string>();
    // A lesson is fully complete if: has study responses AND all its devotionals are completed
    (lessonsData ?? []).forEach((l: any) => {
      const hasStudy = lessonIdsWithResponses.has(l.id);
      const lessonDevs = devsByLesson[l.id] ?? [];
      const allDevsDone = lessonDevs.length === 0 || lessonDevs.every(devId => completedDevIds.has(devId));
      if (hasStudy && allDevsDone) {
        fullyDone.add(l.id);
      }
    });
    setFullyCompletedLessonIds(fullyDone);

    // Build courses with lessons nested
    const courseList = (coursesData ?? []).map(c => ({
      ...c,
      lessons: (lessonsData ?? []).filter(l => l.course_id === c.id),
    }));
    setCourses(courseList);
    setUnlockedCourseIds(new Set((unlocksData ?? []).map((u: any) => u.course_id)));
    // Auto-expand first unlocked course
    const unlockedSet = new Set((unlocksData ?? []).map((u: any) => u.course_id));
    const firstUnlocked = courseList.find(c => unlockedSet.has(c.id));
    if (firstUnlocked) setExpandedCourse(firstUnlocked.id);
    else if (courseList.length > 0) setExpandedCourse(courseList[0].id);

    // Attendance history
    setRecentEvents((eventsData ?? []) as EventRecord[]);
    setAttendanceRecords((attendanceData ?? []) as AttendanceRecord[]);

    // All assessments for evolution chart
    setAllAssessments((allAssess ?? []) as Assessment[]);
    setWorshipCount((worshipData ?? []).length);

    setLoading(false);
  }

  async function handleSaveAssessment() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const health = computeHealth({ ...form, id: "", month, year, created_at: "" } as any);

    await supabase.from("spiritual_assessments").upsert({
      user_id: user.id, month, year,
      prayer_score: form.prayer_score,
      presence_score: form.presence_score,
      struggle_score: form.struggle_score,
      doubt_score: form.doubt_score,
      needs_pastor: form.needs_pastor,
      notes: form.notes || null,
    }, { onConflict: "user_id,month,year" });

    await supabase.from("discipleship_plans").upsert({
      user_id: user.id, health_status: health,
    }, { onConflict: "user_id" });

    setSaving(false);
    setShowAssessment(false);
    fetchAll();
  }

  async function handleSendHelp() {
    if (!helpType) return;
    setHelpSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setHelpSending(false); return; }

    // Flag needs_pastor on current assessment
    await supabase.from("spiritual_assessments").upsert({
      user_id: user.id, month, year,
      needs_pastor: true,
      notes: `[PEDIDO DE AJUDA - ${helpType.toUpperCase()}] ${helpMessage}`.trim(),
    }, { onConflict: "user_id,month,year" });

    // Also ensure discipleship plan reflects urgency
    await supabase.from("discipleship_plans").upsert({
      user_id: user.id,
      health_status: helpType === "crise" ? "critico" : "atencao",
      is_priority: true,
    }, { onConflict: "user_id" });

    setHelpSending(false);
    setHelpSent(true);
    setShowHelpModal(false);
    setHelpType(null);
    setHelpMessage("");
    toast.success("🙏 Seu pedido foi enviado ao pastor. Ele será notificado.");
    fetchAll();
  }


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 animate-pulse">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <p className="text-muted-foreground font-inter text-sm">Carregando sua caminhada...</p>
      </div>
    );
  }

  const completedIds = new Set(progress.map(p => p.activity_id));
  const totalActs = activities.length;
  const completedActs = activities.filter(a => completedIds.has(a.id)).length;
  const pct = totalActs > 0 ? Math.round((completedActs / totalActs) * 100) : 0;

  const devocionais = activities.filter(a => a.type === "devocional");
  const formacoes = activities.filter(a => a.type === "formacao");
  const encontros = activities.filter(a => a.type === "encontro");
  const doneDev = devocionais.filter(a => completedIds.has(a.id)).length;
  const doneForm = formacoes.filter(a => completedIds.has(a.id)).length;
  const doneEnc = encontros.filter(a => completedIds.has(a.id)).length;

  const healthStatus = plan?.health_status ?? computeHealth(assessment);
  const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  // ── Termômetro do Discipulado ──
  const totalLessonsCount = courses.reduce((s, c) => s + c.lessons.length, 0);
  const completedLessonsCount = fullyCompletedLessonIds.size;
  const attendancePresent = attendanceRecords.filter(a => a.status === "presente").length;
  const totalEventsCount = recentEvents.length;

  // Fé: based on prayer + presence scores (assessment)
  const feScore = assessment
    ? Math.round((((assessment.prayer_score ?? 3) + (assessment.presence_score ?? 3)) / 2) * 20)
    : 50;
  // Comunhão: attendance percentage
  const comunhaoScore = totalEventsCount > 0
    ? Math.round((attendancePresent / totalEventsCount) * 100)
    : 0;
  // Conhecimento: lessons progress
  const conhecimentoScore = totalLessonsCount > 0
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
    : 0;
  // Testemunho: worship + activities progress combined
  const testemunhoBase = totalActs > 0 ? (completedActs / totalActs) : 0;
  const worshipBase = Math.min(worshipCount / 4, 1); // 4 worships = 100%
  const testemunhoScore = Math.round(((testemunhoBase + worshipBase) / 2) * 100);

  const thermometerDimensions = [
    { label: "Fé", emoji: "🟢", score: feScore, color: "hsl(142, 71%, 45%)", bg: "bg-brand-green/10" },
    { label: "Comunhão", emoji: "🟡", score: comunhaoScore, color: "hsl(45, 93%, 47%)", bg: "bg-accent/15" },
    { label: "Conhecimento", emoji: "🔵", score: conhecimentoScore, color: "hsl(217, 91%, 60%)", bg: "bg-primary/10" },
    { label: "Testemunho", emoji: "🟠", score: testemunhoScore, color: "hsl(28, 100%, 50%)", bg: "bg-secondary/10" },
  ];

  // ── Recompensas Espirituais ──
  // Compute streak from allAssessments + devotional/attendance data
  const devDoneCount = doneDev;
  const avgThermo = Math.round((feScore + comunhaoScore + conhecimentoScore + testemunhoScore) / 4);

  const spiritualRewards: { icon: string; title: string; subtitle: string; earned: boolean; bg: string }[] = [];

  // Streak-based
  if (worshipCount >= 4) {
    spiritualRewards.push({ icon: "⛪", title: "Adorador fiel", subtitle: `${worshipCount} cultos confirmados`, earned: true, bg: "bg-primary/10" });
  }
  if (attendancePresent >= 3) {
    spiritualRewards.push({ icon: "🤝", title: "Presença que edifica", subtitle: `${attendancePresent} encontros presentes`, earned: true, bg: "bg-brand-green/10" });
  }
  if (pct >= 80) {
    spiritualRewards.push({ icon: "🏆", title: "Caminhada exemplar", subtitle: `${pct}% das atividades concluídas`, earned: true, bg: "bg-secondary/10" });
  } else if (pct >= 50) {
    spiritualRewards.push({ icon: "💪", title: "Perseverante na fé", subtitle: `${pct}% das atividades concluídas`, earned: true, bg: "bg-accent/15" });
  }
  if (completedLessonsCount >= 3) {
    spiritualRewards.push({ icon: "📖", title: "Estudante da Palavra", subtitle: `${completedLessonsCount} lições completas`, earned: true, bg: "bg-primary/10" });
  }
  if (avgThermo >= 75) {
    spiritualRewards.push({ icon: "🔥", title: "Exemplo de fé da turma", subtitle: "Termômetro espiritual acima de 75%", earned: true, bg: "bg-secondary/10" });
  }
  if (assessment && (assessment.prayer_score ?? 0) >= 4 && (assessment.presence_score ?? 0) >= 4) {
    spiritualRewards.push({ icon: "🙏", title: "Vida de oração forte", subtitle: "Oração e presença de Deus em alta", earned: true, bg: "bg-brand-green/10" });
  }
  if (healthStatus === "saudavel") {
    spiritualRewards.push({ icon: "🕊️", title: "Coração saudável", subtitle: "Saúde espiritual plena", earned: true, bg: "bg-brand-green/10" });
  }
  // Always show some aspirational ones if few earned
  if (spiritualRewards.length < 3) {
    if (!spiritualRewards.some(r => r.icon === "⛪")) {
      spiritualRewards.push({ icon: "⛪", title: "Adorador fiel", subtitle: "Confirme 4 cultos para desbloquear", earned: false, bg: "bg-muted" });
    }
    if (!spiritualRewards.some(r => r.icon === "🔥")) {
      spiritualRewards.push({ icon: "🔥", title: "Exemplo de fé da turma", subtitle: "Alcance 75% no termômetro", earned: false, bg: "bg-muted" });
    }
  }

  if (selectedLesson) {
    if (selectedLessonMode === "study") {
      return (
        <div className="px-5 pt-5 pb-6">
          <JourneyLessonView lesson={selectedLesson} onBack={() => { setSelectedLesson(null); setSelectedLessonMode("choice"); }} />
        </div>
      );
    }
    return (
      <LessonChoiceView
        lesson={selectedLesson}
        onBack={() => { setSelectedLesson(null); setSelectedLessonMode("choice"); }}
        onOpenStudy={() => setSelectedLessonMode("study")}
        scheduledDevotionalDates={agendaSchedule.lessonDevotionalDates.get(selectedLesson.id)}
        eventDate={agendaSchedule.lessonEventDate.get(selectedLesson.id) ?? undefined}
      />
    );
  }

  return (
    <div className="px-5 pt-5 pb-6 space-y-4">
      {/* Hero */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-6 translate-x-6 pointer-events-none" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl border border-white/20">
            🕊️
          </div>
          <div>
            <p className="text-primary-foreground/60 font-inter text-xs">Minha caminhada espiritual</p>
            <h2 className="font-montserrat font-black text-primary-foreground text-lg leading-tight">
              {profile?.full_name?.split(" ")[0] ?? "Discípulo"}
            </h2>
            <p className="text-primary-foreground/70 text-xs font-inter">{profile?.community}</p>
          </div>
        </div>
        <HealthBadge status={healthStatus} />
        <p className="text-primary-foreground/80 font-inter text-xs mt-2 italic">
          {healthStatus === "saudavel"
            ? "🔥 Continue firme! Sua caminhada está inspirando outros!"
            : healthStatus === "atencao"
            ? "💛 Deus está com você. Um passo de cada vez!"
            : "🙏 Não desista. O Senhor é sua força nos dias difíceis."}
        </p>
      </div>

      {/* ── BOTÃO PEDIR AJUDA ────────────────────── */}
      {!helpSent ? (
        <button
          onClick={() => setShowHelpModal(true)}
          className="w-full rounded-2xl p-4 border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🕊️</span>
          </div>
          <div className="text-left flex-1">
            <p className="font-montserrat font-bold text-foreground text-sm">Pedir Ajuda</p>
            <p className="text-muted-foreground font-inter text-[10px]">
              Está em crise, quer conversar ou precisa de oração? Seu pastor será avisado.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </button>
      ) : (
        <div className="w-full rounded-2xl p-4 bg-brand-green/10 border border-brand-green/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-green/15 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-brand-green" />
          </div>
          <div className="text-left">
            <p className="font-montserrat font-bold text-brand-green text-sm">Pedido enviado</p>
            <p className="text-muted-foreground font-inter text-[10px]">Seu pastor foi notificado e vai entrar em contato com você.</p>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in" onClick={() => setShowHelpModal(false)}>
          <div
            className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <span className="text-3xl">🕊️</span>
              <h3 className="font-montserrat font-black text-foreground text-lg mt-2">Pedir Ajuda</h3>
              <p className="text-muted-foreground font-inter text-xs mt-1">
                Você não está sozinho. Escolha como podemos te ajudar:
              </p>
            </div>

            <div className="space-y-2">
              {([
                { type: "crise" as const, icon: "🆘", label: "Estou em crise", desc: "Preciso de ajuda urgente", bg: "bg-destructive/10 border-destructive/20", active: "ring-destructive" },
                { type: "conversar" as const, icon: "💬", label: "Quero conversar", desc: "Preciso falar com alguém", bg: "bg-primary/10 border-primary/20", active: "ring-primary" },
                { type: "oracao" as const, icon: "🙏", label: "Preciso de oração", desc: "Ore por mim, por favor", bg: "bg-accent/15 border-accent/20", active: "ring-accent" },
              ]).map(opt => (
                <button
                  key={opt.type}
                  onClick={() => setHelpType(opt.type)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${opt.bg} ${
                    helpType === opt.type ? `ring-2 ${opt.active} scale-[1.02]` : "hover:scale-[1.01]"
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div className="text-left">
                    <p className="font-montserrat font-bold text-foreground text-sm">{opt.label}</p>
                    <p className="font-inter text-[10px] text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {helpType && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                <textarea
                  value={helpMessage}
                  onChange={e => setHelpMessage(e.target.value)}
                  placeholder="Quer contar mais? (opcional)"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 font-inter text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setShowHelpModal(false); setHelpType(null); setHelpMessage(""); }}
                className="flex-1 py-3 rounded-xl font-inter text-sm font-semibold text-muted-foreground bg-muted hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendHelp}
                disabled={!helpType || helpSending}
                className="flex-1 py-3 rounded-xl font-inter text-sm font-bold text-primary-foreground transition-all disabled:opacity-40"
                style={{ background: "var(--gradient-hero)" }}
              >
                {helpSending ? "Enviando..." : "🕊️ Enviar pedido"}
              </button>
            </div>

            <p className="text-center text-muted-foreground font-inter text-[10px]">
              💚 Tudo que você compartilhar é confidencial.
            </p>
          </div>
        </div>
      )}

      {/* ── SAÚDE ESPIRITUAL ────────────────────── */}
      <SectionCard icon={<Flame className="w-4 h-4 text-secondary" />} title="Saúde Espiritual">
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: "Devocionais", done: doneDev, total: devocionais.length, color: "#2ECC71" },
            { label: "Formações", done: doneForm, total: formacoes.length, color: "#1F3C88" },
            { label: "Encontros", done: doneEnc, total: encontros.length, color: "#FF7A00" },
          ].map(({ label, done, total, color }) => {
            const p = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="relative">
                  <ProgressRing pct={p} color={color} size={60} />
                  <span className="absolute inset-0 flex items-center justify-center font-montserrat font-black text-foreground text-xs">{p}%</span>
                </div>
                <p className="font-inter text-[10px] text-muted-foreground text-center">{label}</p>
                <p className="font-montserrat font-bold text-foreground text-xs">{done}/{total}</p>
              </div>
            );
          })}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{
            width: `${pct}%`,
            background: pct >= 70 ? "var(--gradient-green)" : pct >= 34 ? "var(--gradient-orange)" : "hsl(var(--destructive))",
          }} />
        </div>
        <p className="text-center text-muted-foreground font-inter text-xs mt-1.5">{completedActs}/{totalActs} atividades concluídas · {pct}%</p>
      </SectionCard>

      {/* ── TERMÔMETRO DO DISCIPULADO ────────────── */}
      <SectionCard icon={<Sparkles className="w-4 h-4 text-secondary" />} title="Termômetro do Discipulado">
        <div className="space-y-3">
          {thermometerDimensions.map(({ label, emoji, score, color, bg }) => (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{emoji}</span>
                  <span className="font-montserrat font-bold text-foreground text-sm">{label}</span>
                </div>
                <span className="font-montserrat font-bold text-xs" style={{ color }}>{score}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${score}%`, backgroundColor: color }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground font-inter text-[10px] mt-3 text-center">
          Baseado na sua autoavaliação, presença, estudos e atividades
        </p>
      </SectionCard>

      {/* ── RECOMPENSAS ESPIRITUAIS ────────────── */}
      {spiritualRewards.length > 0 && (
        <SectionCard icon={<Sparkles className="w-4 h-4 text-accent-foreground" />} title="Recompensas Espirituais">
          <p className="text-muted-foreground font-inter text-[10px] mb-3 text-center">
            Reconhecimento pela sua dedicação — não é competição, é celebração! 🎉
          </p>
          <div className="grid grid-cols-2 gap-2">
            {spiritualRewards.map((reward, i) => (
              <div
                key={i}
                className={`rounded-xl p-3 text-center transition-all ${
                  reward.earned
                    ? `${reward.bg} border border-transparent`
                    : "bg-muted/30 border border-dashed border-border opacity-60"
                }`}
              >
                <span className={`text-2xl ${reward.earned ? "" : "grayscale opacity-40"}`}>{reward.icon}</span>
                <p className={`font-montserrat font-bold text-xs mt-1 ${reward.earned ? "text-foreground" : "text-muted-foreground"}`}>
                  {reward.title}
                </p>
                <p className="font-inter text-[10px] text-muted-foreground mt-0.5 leading-tight">
                  {reward.subtitle}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── AUTOAVALIAÇÃO ────────────────────────── */}
      <SectionCard icon={<Heart className="w-4 h-4 text-primary" />} title={`Autoavaliação — ${MONTH_NAMES[month-1]}`}>
        {assessment && !showAssessment ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-between">
              <span className="text-muted-foreground font-inter text-xs">Vida de oração</span>
              <span className="text-xl">{EMOJIS[(assessment.prayer_score ?? 3) - 1]}</span>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <span className="text-muted-foreground font-inter text-xs">Sentir Deus perto</span>
              <span className="text-xl">{EMOJIS[(assessment.presence_score ?? 3) - 1]}</span>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <span className="text-muted-foreground font-inter text-xs">Tentações / dificuldades</span>
              <span className="text-xl">{EMOJIS[(assessment.struggle_score ?? 3) - 1]}</span>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <span className="text-muted-foreground font-inter text-xs">Dúvidas na fé</span>
              <span className="text-xl">{EMOJIS[(assessment.doubt_score ?? 3) - 1]}</span>
            </div>
            {assessment.needs_pastor && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-primary/10 rounded-xl">
                <AlertCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="font-inter text-xs text-primary">Solicitou conversa com o pastor</p>
              </div>
            )}
            {assessment.notes && (
              <p className="font-inter text-xs text-muted-foreground italic mt-1">"{assessment.notes}"</p>
            )}
            <button onClick={() => setShowAssessment(true)} className="w-full mt-2 py-2 rounded-xl bg-muted text-muted-foreground font-inter text-xs font-medium">
              Atualizar avaliação
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="font-inter text-sm text-foreground mb-2">Como está sua vida de oração?</p>
              <EmojiScale value={form.prayer_score} onChange={v => setForm(f => ({ ...f, prayer_score: v }))} />
            </div>
            <div>
              <p className="font-inter text-sm text-foreground mb-2">Você sente Deus perto de você?</p>
              <EmojiScale value={form.presence_score} onChange={v => setForm(f => ({ ...f, presence_score: v }))} />
            </div>
            <div>
              <p className="font-inter text-sm text-foreground mb-2">Está enfrentando tentações ou dificuldades?</p>
              <EmojiScale value={form.struggle_score} onChange={v => setForm(f => ({ ...f, struggle_score: v }))} />
            </div>
            <div>
              <p className="font-inter text-sm text-foreground mb-2">Tem dúvidas sobre a fé?</p>
              <EmojiScale value={form.doubt_score} onChange={v => setForm(f => ({ ...f, doubt_score: v }))} />
            </div>
            <div>
              <p className="font-inter text-sm text-foreground mb-2">Uma palavra sobre sua semana (opcional):</p>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2} placeholder="Como você está se sentindo..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.needs_pastor} onChange={e => setForm(f => ({ ...f, needs_pastor: e.target.checked }))}
                className="w-4 h-4 rounded border-border accent-primary" />
              <span className="font-inter text-sm text-foreground">Preciso conversar com o pastor 🙏</span>
            </label>
            <button onClick={handleSaveAssessment} disabled={saving || !form.prayer_score || !form.presence_score || !form.struggle_score || !form.doubt_score}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-inter text-sm font-medium text-primary-foreground disabled:opacity-50 transition-opacity"
              style={{ background: "var(--gradient-hero)" }}>
              <Send className="w-4 h-4" /> {saving ? "Salvando..." : "Enviar avaliação"}
            </button>
          </div>
        )}
      </SectionCard>

      {/* ── EVOLUÇÃO MENSAL ──────────────────────── */}
      {allAssessments.length > 1 && (
        <SectionCard icon={<CalendarDays className="w-4 h-4 text-primary" />} title="Evolução Espiritual">
          <div className="space-y-3">
            {/* Mini bar chart */}
            <div className="flex items-end gap-1.5 justify-center h-28">
              {allAssessments.slice(-6).map((a) => {
                const avg = (
                  (a.prayer_score ?? 3) +
                  (a.presence_score ?? 3) +
                  (5 - (a.struggle_score ?? 3)) +
                  (5 - (a.doubt_score ?? 3))
                ) / 4;
                const pctH = Math.round((avg / 5) * 100);
                const health = computeHealth(a);
                const color = health === "saudavel" ? "var(--gradient-green)" : health === "atencao" ? "var(--gradient-orange)" : "hsl(var(--destructive))";
                const MONTH_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
                return (
                  <div key={`${a.year}-${a.month}`} className="flex flex-col items-center gap-1 flex-1 max-w-[48px]">
                    <div
                      className="w-full rounded-t-lg transition-all min-h-[8px]"
                      style={{ height: `${pctH}%`, background: color }}
                    />
                    <span className="text-[9px] font-inter text-muted-foreground leading-none">
                      {MONTH_SHORT[a.month - 1]}
                    </span>
                    <span className="text-[9px] font-montserrat font-bold text-foreground leading-none">
                      {avg.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-muted-foreground font-inter text-[10px]">
              Média geral dos últimos {Math.min(allAssessments.length, 6)} meses (1–5)
            </p>

            {/* Month-by-month detail */}
            <div className="space-y-2 mt-2">
              {allAssessments.slice(-6).reverse().map((a) => {
                const health = computeHealth(a);
                const MONTH_NAMES_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
                return (
                  <div key={`detail-${a.year}-${a.month}`} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-muted/30">
                    <span className="font-inter text-xs text-muted-foreground w-16 flex-shrink-0">
                      {MONTH_NAMES_SHORT[a.month - 1]}/{a.year}
                    </span>
                    <div className="flex gap-1.5 flex-1 justify-center">
                      <span title="Oração" className="text-sm">{EMOJIS[(a.prayer_score ?? 3) - 1]}</span>
                      <span title="Presença de Deus" className="text-sm">{EMOJIS[(a.presence_score ?? 3) - 1]}</span>
                      <span title="Tentações" className="text-sm">{EMOJIS[(a.struggle_score ?? 3) - 1]}</span>
                      <span title="Dúvidas" className="text-sm">{EMOJIS[(a.doubt_score ?? 3) - 1]}</span>
                    </div>
                    <span className={`text-[10px] font-inter font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      health === "saudavel" ? "text-brand-green bg-brand-green/10" :
                      health === "critico" ? "text-destructive bg-destructive/10" :
                      "text-accent-foreground bg-accent/20"
                    }`}>
                      {health === "saudavel" ? "🟢" : health === "critico" ? "🔴" : "🟡"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── PLANO DE CRESCIMENTO ──────────────────── */}
      <SectionCard icon={<Sparkles className="w-4 h-4 text-accent-foreground" />} title="Plano de Crescimento Espiritual">
        {plan ? (
          <div className="space-y-3">
            {plan.objectives && (
              <div>
                <p className="font-inter text-xs font-bold text-foreground mb-1">🎯 Objetivos espirituais</p>
                <p className="font-inter text-xs text-muted-foreground leading-relaxed">{plan.objectives}</p>
              </div>
            )}
            {plan.next_steps && (
              <div>
                <p className="font-inter text-xs font-bold text-foreground mb-1">➡️ Próximos passos</p>
                <div className="space-y-1">
                  {plan.next_steps.split("\n").filter(Boolean).map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-green flex-shrink-0 mt-0.5" />
                      <p className="font-inter text-xs text-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {plan.challenges && (
              <div>
                <p className="font-inter text-xs font-bold text-foreground mb-1">⚡ Desafios propostos</p>
                <p className="font-inter text-xs text-muted-foreground leading-relaxed">{plan.challenges}</p>
              </div>
            )}
            {plan.recommendations && (
              <div>
                <p className="font-inter text-xs font-bold text-foreground mb-1">🙏 Recomendações pastorais</p>
                <p className="font-inter text-xs text-muted-foreground italic leading-relaxed">{plan.recommendations}</p>
              </div>
            )}
            {!plan.objectives && !plan.next_steps && !plan.challenges && (
              <p className="text-center text-muted-foreground font-inter text-sm py-2">Seu pastor ainda não criou seu plano. Fique de olho!</p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="font-montserrat font-bold text-foreground text-sm">Plano ainda não criado</p>
            <p className="text-muted-foreground font-inter text-xs mt-1">Seu pastor irá criar seu plano de discipulado em breve.</p>
          </div>
        )}
      </SectionCard>

      {/* ── TRILHA CONFIRMATÓRIA — CURSOS + LIÇÕES ── */}
      {courses.length > 0 && (
        <div className="space-y-3">
          {/* Header */}
          <div className="bg-secondary/10 rounded-2xl p-4 flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-montserrat font-bold text-foreground text-sm">Trilha Confirmatória</p>
              <p className="text-muted-foreground font-inter text-xs mt-0.5">
                {courses.reduce((s, c) => s + c.lessons.length, 0)} lições em {courses.length} cursos
              </p>
            </div>
          </div>

          {/* Waiting message when no events are scheduled */}
          {!agendaSchedule.loading && !agendaSchedule.hasScheduledEvents && (
            <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20 flex items-start gap-3">
              <CalendarDays className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-montserrat font-bold text-foreground text-sm">Aguardando programação</p>
                <p className="text-muted-foreground font-inter text-xs mt-0.5">
                  Seu líder ainda não agendou os próximos estudos. Os devocionais e lições serão liberados conforme a agenda. 📅
                </p>
              </div>
            </div>
          )}

          {/* Course accordion */}
          {courses.map((course) => {
            const isOpen = expandedCourse === course.id;
            const isCourseUnlocked = unlockedCourseIds.has(course.id);
            const doneLessons = course.lessons.filter(l => fullyCompletedLessonIds.has(l.id)).length;
            const totalLessons = course.lessons.length;
            const coursePct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;
            return (
              <div key={course.id} className={`bg-card rounded-2xl border shadow-sm overflow-hidden ${
                isCourseUnlocked ? "border-border" : "border-border opacity-75"
              }`}>
                {/* Course header */}
                <button
                  onClick={() => isCourseUnlocked ? setExpandedCourse(isOpen ? null : course.id) : toast.info("🔒 Este curso ainda não foi liberado pelo seu líder.")}
                  className={`w-full flex items-center gap-3 p-4 text-left ${!isCourseUnlocked ? "cursor-default" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isCourseUnlocked ? "" : "bg-muted"
                  }`} style={isCourseUnlocked ? { background: "var(--gradient-hero)" } : {}}>
                    {isCourseUnlocked
                      ? <span className="font-montserrat font-black text-primary-foreground text-sm">#{course.order_num}</span>
                      : <Lock className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-montserrat font-bold text-foreground text-sm">{course.title}</p>
                    {isCourseUnlocked ? (
                      <>
                        {course.subtitle && <p className="text-muted-foreground font-inter text-xs truncate">{course.subtitle}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${coursePct}%`,
                                background: coursePct === 100 ? "var(--gradient-green)" : "var(--gradient-hero)",
                              }}
                            />
                          </div>
                          <span className={`font-inter text-[10px] font-semibold flex-shrink-0 ${coursePct === 100 ? "text-brand-green" : "text-muted-foreground"}`}>
                            {doneLessons}/{totalLessons}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground font-inter text-xs mt-0.5">🔒 Curso ainda não liberado pelo líder</p>
                    )}
                  </div>
                  {isCourseUnlocked && (
                    isOpen
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {/* Lessons list */}
                {isOpen && isCourseUnlocked && (
                  <div className="border-t border-border">
                    {course.lessons.length === 0 ? (
                      <p className="px-4 py-3 text-muted-foreground font-inter text-xs text-center">Nenhuma lição cadastrada ainda.</p>
                    ) : (
                      course.lessons.map((lesson, lessonIndex) => {
                        const isDone = completedLessonIds.has(lesson.id);
                        const isFullyDone = fullyCompletedLessonIds.has(lesson.id);
                        // First lesson is always unlocked; subsequent ones require previous to be fully completed
                        const prevLesson = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null;
                        const isLocked = prevLesson ? !fullyCompletedLessonIds.has(prevLesson.id) : false;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              if (isLocked) {
                                toast.info("🔒 Complete todas as tarefas da lição anterior primeiro!", {
                                  description: "Termine o estudo e todos os devocionais para desbloquear.",
                                  duration: 3000,
                                });
                                return;
                              }
                              setSelectedLesson(lesson);
                              setSelectedLessonMode("choice");
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border last:border-b-0 transition-colors ${
                              isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/5"
                            } ${isFullyDone ? "bg-brand-green/5" : isDone ? "bg-secondary/5" : ""}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isFullyDone ? "bg-brand-green/15" : isLocked ? "bg-muted" : "bg-secondary/10"
                            }`}>
                              {isFullyDone
                                ? <CheckCircle2 className="w-4 h-4 text-brand-green" />
                                : isLocked
                                ? <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                : <span className="font-montserrat font-bold text-secondary text-xs">{lesson.order_num}</span>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-inter text-sm ${isFullyDone ? "text-brand-green font-medium" : isLocked ? "text-muted-foreground" : "text-foreground"}`}>{lesson.title}</p>
                              {lesson.objective && (
                                <p className="font-inter text-[10px] text-muted-foreground truncate mt-0.5">{lesson.objective}</p>
                              )}
                              {isLocked && (
                                <p className="font-inter text-[10px] text-muted-foreground mt-0.5">🔒 Complete a lição anterior</p>
                              )}
                              {isDone && !isFullyDone && !isLocked && (
                                <p className="font-inter text-[10px] text-secondary mt-0.5">⏳ Faltam devocionais ou estudo</p>
                              )}
                            </div>
                            {isFullyDone
                              ? <span className="text-[10px] font-inter font-bold flex-shrink-0 bg-brand-green/15 text-brand-green px-2 py-0.5 rounded-full">✓ Completa</span>
                              : isDone && !isLocked
                              ? <span className="text-[10px] font-inter font-bold flex-shrink-0 bg-secondary/15 text-secondary px-2 py-0.5 rounded-full">Em andamento</span>
                              : isLocked
                              ? <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                              : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            }
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
