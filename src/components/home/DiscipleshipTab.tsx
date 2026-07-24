import { lazy, Suspense, useCallback, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";
import { Heart, GraduationCap, Sparkles, Lock, ClipboardList, BookOpen, ArrowLeft, ChevronRight, AlertCircle, RotateCcw, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgendaSchedule } from "@/hooks/useAgendaSchedule";
import { toast } from "sonner";
import { cachedStudentQuery, getPendingStudentOverlay, mergeByKey } from "@/lib/studentOffline";

import { computeHealth, type Assessment, type Plan, type Activity, type Progress, type Lesson, type Course, type Module, type LearningTrack, type AttendanceRecord, type EventRecord } from "./discipleship/shared";
import DiscipleshipHero from "./discipleship/DiscipleshipHero";
import HelpSection from "./discipleship/HelpSection";
import SpiritualHealthSection from "./discipleship/SpiritualHealthSection";
import ThermometerSection from "./discipleship/ThermometerSection";
import RewardsSection from "./discipleship/RewardsSection";
import AssessmentSection from "./discipleship/AssessmentSection";
import GrowthPlanSection from "./discipleship/GrowthPlanSection";
import CourseTrailSection from "./discipleship/CourseTrailSection";

const JourneyLessonView = lazy(() => import("@/components/home/JourneyLessonView"));
const LessonContentEditor = lazy(() => import("@/components/admin/tabs/LessonContentEditor"));
const LessonDevotionalEditor = lazy(() => import("@/components/admin/tabs/LessonDevotionalEditor"));
const LessonChoiceView = lazy(() => import("@/components/home/LessonChoiceView"));
const ResourceLibrary = lazy(() => import("@/components/home/ResourceLibrary"));
const LeaderRoomSection = lazy(() => import("@/components/home/LeaderRoomSection"));
const NovoCursoModal = lazy(() => import("@/components/home/NovoCursoModal"));

const LazySectionFallback = () => (
  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
    <div className="h-4 w-32 rounded bg-muted animate-pulse" />
    <div className="mt-3 h-3 w-full rounded bg-muted animate-pulse" />
    <div className="mt-2 h-3 w-2/3 rounded bg-muted animate-pulse" />
  </div>
);

// ─── Sub-tabs ─────────────────────────────────────────────
const SUB_TABS = [
  { key: "trilha" as const, label: "Trilha", icon: GraduationCap, activeIconClass: "text-secondary" },
  { key: "saude" as const, label: "Saúde", icon: Heart, activeIconClass: "text-brand-green" },
  { key: "avaliacao" as const, label: "Avaliação", icon: ClipboardList, activeIconClass: "text-accent-foreground" },
  { key: "pastoral" as const, label: "Pastoral", icon: BookOpen, activeIconClass: "text-primary" },
];
type SubTab = typeof SUB_TABS[number]["key"];

const subTabVariants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" as const } },
};

// ─── MAIN COMPONENT ──────────────────────────────────────
type DiscipleshipTabProps = {
  targetLessonId?: string | null;
  targetLessonMode?: "choice" | "devotional";
  onTargetLessonConsumed?: () => void;
};

type CourseRow = Pick<Course, "id" | "order_num" | "title" | "subtitle" | "track_id"> & {
  church_id?: string | null;
};
type ModuleRow = Omit<Module, "lessons">;
type LessonProgressRow = { lesson_id: string };
type DevotionalContentIndexRow = { id: string; lesson_id: string | null; day_number: number | null; title: string | null };
type DevotionalProgressRow = { devotional_id: string };
type WorshipAttendanceRow = { id: string };
type CourseUnlockRow = { course_id: string };
type LessonOverrideRow = {
  id: string;
  lesson_id: string;
  custom_points: number | null;
  available_from: string | null;
  available_until: string | null;
  is_unlocked: boolean;
  recovery_release_id: string | null;
};
type RecoveryReleaseRow = {
  id: string;
  available_until: string;
  ended_at: string | null;
};

export default function DiscipleshipTab({ targetLessonId, targetLessonMode = "choice", onTargetLessonConsumed }: DiscipleshipTabProps = {}) {
  const { profile, role, isSuper, signOut } = useAuth();
  const { effectiveArea } = useAreaSwitch();
  const isLeaderOrAdmin = role === "admin" || role === "lider";
  const agendaSchedule = useAgendaSchedule();
  const currentArea = effectiveArea || profile?.area || "";

  const [subTab, setSubTab] = useState<SubTab>("trilha");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [learningTracks, setLearningTracks] = useState<LearningTrack[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLessonMode, setSelectedLessonMode] = useState<"choice" | "study" | "edit" | "edit-devotionals">("choice");
  const [autoOpenDevotionalLessonId, setAutoOpenDevotionalLessonId] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [fullyCompletedLessonIds, setFullyCompletedLessonIds] = useState<Set<string>>(new Set());
  const [devotionalsByLesson, setDevotionalsByLesson] = useState<Map<string, DevotionalContentIndexRow[]>>(new Map());
  const [completedDevotionalIds, setCompletedDevotionalIds] = useState<Set<string>>(new Set());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [recentEvents, setRecentEvents] = useState<EventRecord[]>([]);
  const [allAssessments, setAllAssessments] = useState<Assessment[]>([]);
  const [worshipCount, setWorshipCount] = useState(0);
  const [unlockedCourseIds, setUnlockedCourseIds] = useState<Set<string>>(new Set());
  const [manualLessonOverrideMap, setManualLessonOverrideMap] = useState<Map<string, { id: string; custom_points: number | null }>>(new Map());
  const [activeRecovery, setActiveRecovery] = useState<RecoveryReleaseRow | null>(null);
  const [recoveryLessonIds, setRecoveryLessonIds] = useState<Set<string>>(new Set());
  const [recoveryDevotionalIds, setRecoveryDevotionalIds] = useState<Set<string>>(new Set());
  const [selectedRecoveryMode, setSelectedRecoveryMode] = useState(false);
  const [showNovoCurso, setShowNovoCurso] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpType, setHelpType] = useState<"crise" | "conversar" | "oracao" | null>(null);
  const [helpMessage, setHelpMessage] = useState("");
  const [helpSending, setHelpSending] = useState(false);
  const [helpSent, setHelpSent] = useState(false);
  const [showLeaderRoom, setShowLeaderRoom] = useState(false);
  const [showLatePendingList, setShowLatePendingList] = useState(false);

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

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const scope = `student:${user.id}:${profile?.church_id ?? "global"}:${currentArea || "all"}`;
    const [
      actsRes, progRes, assessRes, planRes, coursesRes, lessonsRes, responsesRes, eventsRes,
      attendanceRes, allAssessRes, devContentRes, devProgressRes, worshipRes, unlocksRes,
      lessonOverrideRes, modulesRes, tracksRes, trackReleasesRes, recoveryReleaseRes, recoveryDevotionalOverrideRes,
    ] = await Promise.all([
      cachedStudentQuery<Activity[]>(`${scope}:activities`, () => supabase.from("activities").select("id, type, title, points"), []),
      cachedStudentQuery<Progress[]>(`${scope}:user_progress`, () => supabase.from("user_progress").select("activity_id").eq("user_id", user.id), []),
      cachedStudentQuery<Assessment | null>(`${scope}:spiritual_assessment:${month}:${year}`, () => supabase.from("spiritual_assessments").select("*").eq("user_id", user.id).eq("month", month).eq("year", year).maybeSingle(), null),
      cachedStudentQuery<Plan | null>(`${scope}:discipleship_plan`, () => supabase.from("discipleship_plans").select("objectives,challenges,recommendations,next_steps,health_status").eq("user_id", user.id).maybeSingle(), null),
      cachedStudentQuery<CourseRow[]>(`${scope}:courses`, () => profile?.church_id ? supabase.from("courses").select("*").or(`church_id.is.null,church_id.eq.${profile.church_id}`).order("order_num") : supabase.from("courses").select("*").is("church_id", null).order("order_num"), []),
      cachedStudentQuery<Lesson[]>(`${scope}:lessons`, () => profile?.church_id ? supabase.from("lessons").select("id, title, order_num, objective, topics, course_id, church_id, module_id").or(`church_id.is.null,church_id.eq.${profile.church_id}`).order("order_num") : supabase.from("lessons").select("id, title, order_num, objective, topics, course_id, church_id, module_id").is("church_id", null).order("order_num"), []),
      cachedStudentQuery<LessonProgressRow[]>(`${scope}:lesson_progress`, () => supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("is_completed", true), []),
      cachedStudentQuery<EventRecord[]>(`${scope}:events:recent`, () => supabase.from("events").select("id, title, event_date, type").order("event_date", { ascending: false }).limit(10), []),
      cachedStudentQuery<AttendanceRecord[]>(`${scope}:attendance`, () => supabase.from("attendance").select("event_id, status").eq("user_id", user.id), []),
      cachedStudentQuery<Assessment[]>(`${scope}:spiritual_assessments`, () => supabase.from("spiritual_assessments").select("*").eq("user_id", user.id).order("year", { ascending: true }).order("month", { ascending: true }), []),
      cachedStudentQuery<DevotionalContentIndexRow[]>(`${scope}:devotional_content:index`, () => supabase.from("devotional_content").select("id, lesson_id, day_number, title").not("lesson_id", "is", null), []),
      cachedStudentQuery<DevotionalProgressRow[]>(`${scope}:devotional_progress`, () => supabase.from("devotional_progress").select("devotional_id").eq("user_id", user.id), []),
      cachedStudentQuery<WorshipAttendanceRow[]>(`${scope}:worship_attendance`, () => supabase.from("worship_attendance").select("id").eq("user_id", user.id).eq("status", "aprovado"), []),
      cachedStudentQuery<CourseUnlockRow[]>(`${scope}:course_unlocks`, () => supabase.from("course_unlocks").select("course_id").eq("area", currentArea), []),
      cachedStudentQuery<LessonOverrideRow[]>(`${scope}:lesson_overrides`, () => supabase.from("user_lesson_overrides").select("id, lesson_id, custom_points, available_from, available_until, is_unlocked, recovery_release_id").eq("user_id", user.id), []),
      cachedStudentQuery<ModuleRow[]>(`${scope}:modules`, () => profile?.church_id ? supabase.from("modules").select("id, course_id, title, order_num, church_id").or(`church_id.is.null,church_id.eq.${profile.church_id}`).order("order_num") : supabase.from("modules").select("id, course_id, title, order_num, church_id").is("church_id", null).order("order_num"), []),
      cachedStudentQuery<LearningTrack[]>(`${scope}:learning_tracks`, () => supabase.from("learning_tracks").select("id, name, description, order_num").order("order_num"), []),
      profile?.church_id
        ? cachedStudentQuery<{ track_id: string }[]>(`${scope}:track_releases`, () => supabase.from("track_church_releases").select("track_id").eq("church_id", profile.church_id!), [])
        : Promise.resolve({ data: [] as { track_id: string }[] }),
      cachedStudentQuery<RecoveryReleaseRow[]>(`${scope}:confirmatory_recovery`, () => supabase.from("confirmatory_recovery_releases").select("id, available_until, ended_at").eq("user_id", user.id).is("ended_at", null).order("created_at", { ascending: false }).limit(1), []),
      cachedStudentQuery<{ devotional_id: string; recovery_release_id: string | null; is_unlocked: boolean; available_until: string | null }[]>(`${scope}:recovery_devotional_overrides`, () => supabase.from("user_devotional_overrides").select("devotional_id, recovery_release_id, is_unlocked, available_until").eq("user_id", user.id).not("recovery_release_id", "is", null), []),
    ]);

    const overlay = await getPendingStudentOverlay(user.id);
    const acts = actsRes.data;
    const prog = progRes.data;
    const assess = assessRes.data;
    const planData = planRes.data;
    const coursesData = coursesRes.data;
    const lessonsData = lessonsRes.data;
    const responsesData = mergeByKey<LessonProgressRow>(responsesRes.data, overlay.lessonProgress, "lesson_id");
    const eventsData = eventsRes.data;
    const attendanceData = mergeByKey<AttendanceRecord>(attendanceRes.data, overlay.attendance, "event_id");
    const allAssess = allAssessRes.data;
    const devContentData = devContentRes.data;
    const devProgressData = mergeByKey<DevotionalProgressRow>(devProgressRes.data, overlay.devotionalProgress, "devotional_id");
    const worshipData = [...worshipRes.data, ...overlay.worshipAttendance];
    const unlocksData = unlocksRes.data;
    const lessonOverrideData = lessonOverrideRes.data;
    const modulesData = modulesRes.data;
    const tracksData = tracksRes.data;
    const releasedTrackIds = new Set((trackReleasesRes.data ?? []).map((release) => release.track_id));
    const recoveryRelease = (recoveryReleaseRes.data ?? []).find((release) =>
      !release.ended_at && new Date(release.available_until) > new Date()
    ) ?? null;

    setActivities(acts ?? []);
    setProgress(prog ?? []);
    setAssessment(assess ?? null);
    setPlan(planData ?? null);

    const lessonIdsWithResponses = new Set<string>(
      (responsesData ?? []).map((response: { lesson_id: string }) => response.lesson_id),
    );
    setCompletedLessonIds(lessonIdsWithResponses);

    const devsByLesson: Record<string, string[]> = {};
    (devContentData ?? []).forEach((d) => {
      if (d.lesson_id) {
        if (!devsByLesson[d.lesson_id]) devsByLesson[d.lesson_id] = [];
        devsByLesson[d.lesson_id].push(d.id);
      }
    });
    const completedDevIds = new Set((devProgressData ?? []).map((p) => p.devotional_id));
    setCompletedDevotionalIds(completedDevIds);
    const nextDevotionalsByLesson = new Map<string, DevotionalContentIndexRow[]>();
    (devContentData ?? []).forEach((dev) => {
      if (!dev.lesson_id) return;
      const list = nextDevotionalsByLesson.get(dev.lesson_id) ?? [];
      list.push(dev);
      nextDevotionalsByLesson.set(dev.lesson_id, list);
    });
    nextDevotionalsByLesson.forEach((list) => list.sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0)));
    setDevotionalsByLesson(nextDevotionalsByLesson);
    const fullyDone = new Set<string>();
    (lessonsData ?? []).forEach((l) => {
      const hasStudy = lessonIdsWithResponses.has(l.id);
      const lessonDevs = devsByLesson[l.id] ?? [];
      const allDevsDone = lessonDevs.length === 0 || lessonDevs.every(devId => completedDevIds.has(devId));
      if (hasStudy && allDevsDone) fullyDone.add(l.id);
    });
    setFullyCompletedLessonIds(fullyDone);

    const visibleCourseRows = (coursesData ?? []).filter((course) =>
      course.track_id === null
      || isSuper
      || releasedTrackIds.has(course.track_id)
    );
    const courseList = visibleCourseRows.map(c => {
      const courseModules = (modulesData ?? [])
        .filter((m) => m.course_id === c.id)
        .map((m) => ({
          ...m,
          lessons: (lessonsData ?? []).filter((l) => l.module_id === m.id),
        }));
      return {
        ...c,
        lessons: (lessonsData ?? []).filter((l) => l.course_id === c.id),
        modules: courseModules,
      };
    });
    setCourses(courseList);
    setLearningTracks((tracksData ?? []).filter((track) =>
      isSuper || releasedTrackIds.has(track.id)
    ));
    setUnlockedCourseIds(new Set((unlocksData ?? []).map((u) => u.course_id)));
    const nowIso = new Date();
    const activeLessonOverrides = new Map<string, { id: string; custom_points: number | null }>();
    (lessonOverrideData ?? []).forEach((item) => {
      if (!item?.lesson_id || item.is_unlocked === false) return;
      if (item.available_from && new Date(item.available_from) > nowIso) return;
      if (item.available_until && new Date(item.available_until) < nowIso) return;
      activeLessonOverrides.set(item.lesson_id, { id: item.id, custom_points: item.custom_points ?? null });
    });
    setManualLessonOverrideMap(activeLessonOverrides);
    setActiveRecovery(recoveryRelease);
    setRecoveryLessonIds(new Set(
      (lessonOverrideData ?? [])
        .filter((item) => item.recovery_release_id === recoveryRelease?.id && item.is_unlocked)
        .map((item) => item.lesson_id),
    ));
    setRecoveryDevotionalIds(new Set(
      (recoveryDevotionalOverrideRes.data ?? [])
        .filter((item) =>
          item.recovery_release_id === recoveryRelease?.id
          && item.is_unlocked
          && (!item.available_until || new Date(item.available_until) >= new Date())
        )
        .map((item) => item.devotional_id),
    ));
    const unlockedSet = new Set((unlocksData ?? []).map((u) => u.course_id));
    const firstUnlocked = courseList.find(c => unlockedSet.has(c.id));
    if (firstUnlocked) setExpandedCourse(firstUnlocked.id);
    else if (courseList.length > 0) setExpandedCourse(courseList[0].id);

    setRecentEvents((eventsData ?? []) as EventRecord[]);
    setAttendanceRecords((attendanceData ?? []) as AttendanceRecord[]);
    setAllAssessments((allAssess ?? []) as Assessment[]);
    setWorshipCount((worshipData ?? []).length);
    if (!silent) setLoading(false);
  }, [currentArea, isSuper, month, profile?.church_id, year]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const refresh = () => {
      if (!loading) void fetchAll(true);
    };
    window.addEventListener("student-offline-queue-changed", refresh);
    window.addEventListener("student-offline-queue-synced", refresh);
    return () => {
      window.removeEventListener("student-offline-queue-changed", refresh);
      window.removeEventListener("student-offline-queue-synced", refresh);
    };
  }, [fetchAll, loading]);

  // Auto-open lesson when navigating from agenda.
  // Wait for agendaSchedule to finish loading so scheduledDevotionalDates
  // are available before the lesson view mounts (prevents the fallback path
  // from auto-opening the wrong devotional due to a race condition).
  useEffect(() => {
    if (targetLessonId && !loading && !agendaSchedule.loading && courses.length > 0) {
      const lesson = courses.flatMap(c => c.lessons).find(l => l.id === targetLessonId);
      if (lesson) {
        setSelectedLesson(lesson);
        setSelectedLessonMode("choice");
        setAutoOpenDevotionalLessonId(targetLessonMode === "devotional" ? lesson.id : null);
        setSubTab("trilha");
        const course = courses.find(c => c.lessons.some(l => l.id === targetLessonId));
        if (course) setExpandedCourse(course.id);
      }
      onTargetLessonConsumed?.();
    }
  }, [targetLessonId, targetLessonMode, loading, agendaSchedule.loading, courses, onTargetLessonConsumed]);

  async function handleSaveAssessment() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const health = computeHealth({
      ...form,
      id: "",
      month,
      year,
      notes: form.notes || null,
    });
    await supabase.from("spiritual_assessments").upsert({
      user_id: user.id, month, year,
      prayer_score: form.prayer_score, presence_score: form.presence_score,
      struggle_score: form.struggle_score, doubt_score: form.doubt_score,
      needs_pastor: form.needs_pastor, notes: form.notes || null,
      church_id: profile?.church_id ?? null,
    }, { onConflict: "user_id,month,year" });
    await supabase.from("discipleship_plans").upsert({
      user_id: user.id, health_status: health, church_id: profile?.church_id ?? null,
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
    await supabase.from("spiritual_assessments").upsert({
      user_id: user.id, month, year,
      needs_pastor: true,
      notes: `[PEDIDO DE AJUDA - ${helpType.toUpperCase()}] ${helpMessage}`.trim(),
      church_id: profile?.church_id ?? null,
    }, { onConflict: "user_id,month,year" });
    await supabase.from("discipleship_plans").upsert({
      user_id: user.id,
      health_status: helpType === "crise" ? "critico" : "atencao",
      is_priority: true,
      church_id: profile?.church_id ?? null,
    }, { onConflict: "user_id" });
    setHelpSending(false);
    setHelpSent(true);
    setShowHelpModal(false);
    setHelpType(null);
    setHelpMessage("");
    toast.success("🙏 Seu pedido foi enviado ao pastor. Ele será notificado.");
    fetchAll();
  }

  // ── Loading ──
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

  // ── Waiting room with introductory content ──
  if (!profile?.turma_id && !isLeaderOrAdmin) {
    return (
      <div className="px-5 pt-5 pb-6 space-y-4">
        {/* Status banner */}
        <div className="flex flex-col items-center text-center bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-secondary" />
          </div>
          <h3 className="font-montserrat font-bold text-foreground text-lg mb-1">Aguardando aprovação</h3>
          <p className="text-muted-foreground font-inter text-sm leading-relaxed max-w-xs mb-4">
            Você ainda não foi atribuído(a) a uma turma. Enquanto isso, conheça o que te espera! 👇
          </p>
          <button
            onClick={() => void signOut()}
            className="w-full max-w-xs flex items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-3 font-montserrat text-sm font-bold text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Sair e tentar outra conta
          </button>
        </div>

        {/* Introductory content */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-secondary/5 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-secondary" />
            <p className="font-montserrat font-bold text-foreground text-sm">O que é a Profissão de Fé?</p>
          </div>
          <div className="p-4 space-y-3">
            <p className="font-inter text-sm text-foreground leading-relaxed">
              A Profissão de Fé é o momento em que você confirma publicamente sua fé em Jesus Cristo. 
              Durante a caminhada, você vai estudar temas essenciais da fé cristã e crescer espiritualmente.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-primary/5 flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            <p className="font-montserrat font-bold text-foreground text-sm">Como funciona?</p>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {[
                { emoji: "📖", title: "Estudos semanais", desc: "Lições com reflexões bíblicas e perguntas para o seu crescimento" },
                { emoji: "🙏", title: "Devocionais diários", desc: "Pequenas meditações para fortalecer sua caminhada durante a semana" },
                { emoji: "🤝", title: "Encontros presenciais", desc: "Momentos com seu líder e turma para aprender juntos" },
                { emoji: "🏆", title: "Conquistas e pontos", desc: "Cada etapa concluída te aproxima da confirmação e gera recompensas" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <p className="font-inter text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="font-inter text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-secondary/10 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-montserrat font-bold text-foreground text-sm">Dica enquanto espera</p>
            <p className="text-muted-foreground font-inter text-xs mt-0.5 leading-relaxed">
              Leia o Evangelho de João — é o melhor ponto de partida para conhecer Jesus. 
              Comece pelo capítulo 1 e leia um por dia. Quando sua turma for liberada, você já estará preparado(a)! 🔥
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Computed values ──
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

  // Thermometer
  const totalLessonsCount = courses.reduce((s, c) => s + c.lessons.length, 0);
  const completedLessonsCount = fullyCompletedLessonIds.size;
  const attendancePresent = attendanceRecords.filter(a => a.status === "presente").length;
  const totalEventsCount = recentEvents.length;

  const feScore = assessment
    ? Math.round((((assessment.prayer_score ?? 3) + (assessment.presence_score ?? 3)) / 2) * 20)
    : 50;
  const comunhaoScore = totalEventsCount > 0 ? Math.round((attendancePresent / totalEventsCount) * 100) : 0;
  const conhecimentoScore = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;
  const testemunhoBase = totalActs > 0 ? (completedActs / totalActs) : 0;
  const worshipBase = Math.min(worshipCount / 4, 1);
  const testemunhoScore = Math.round(((testemunhoBase + worshipBase) / 2) * 100);

  const thermometerDimensions = [
    { label: "Fé", emoji: "🟢", score: feScore, color: "hsl(142, 71%, 45%)", bg: "bg-brand-green/10" },
    { label: "Comunhão", emoji: "🟡", score: comunhaoScore, color: "hsl(45, 93%, 47%)", bg: "bg-accent/15" },
    { label: "Conhecimento", emoji: "🔵", score: conhecimentoScore, color: "hsl(217, 91%, 60%)", bg: "bg-primary/10" },
    { label: "Testemunho", emoji: "🟠", score: testemunhoScore, color: "hsl(28, 100%, 50%)", bg: "bg-secondary/10" },
  ];

  // Rewards
  const avgThermo = Math.round((feScore + comunhaoScore + conhecimentoScore + testemunhoScore) / 4);
  const spiritualRewards: { icon: string; title: string; subtitle: string; earned: boolean; bg: string }[] = [];
  if (worshipCount >= 4) spiritualRewards.push({ icon: "⛪", title: "Adorador fiel", subtitle: `${worshipCount} cultos confirmados`, earned: true, bg: "bg-primary/10" });
  if (attendancePresent >= 3) spiritualRewards.push({ icon: "🤝", title: "Presença que edifica", subtitle: `${attendancePresent} encontros presentes`, earned: true, bg: "bg-brand-green/10" });
  if (pct >= 80) spiritualRewards.push({ icon: "🏆", title: "Caminhada exemplar", subtitle: `${pct}% das atividades concluídas`, earned: true, bg: "bg-secondary/10" });
  else if (pct >= 50) spiritualRewards.push({ icon: "💪", title: "Perseverante na fé", subtitle: `${pct}% das atividades concluídas`, earned: true, bg: "bg-accent/15" });
  if (completedLessonsCount >= 3) spiritualRewards.push({ icon: "📖", title: "Estudante da Palavra", subtitle: `${completedLessonsCount} lições completas`, earned: true, bg: "bg-primary/10" });
  if (avgThermo >= 75) spiritualRewards.push({ icon: "🔥", title: "Exemplo de fé da turma", subtitle: "Termômetro espiritual acima de 75%", earned: true, bg: "bg-secondary/10" });
  if (assessment && (assessment.prayer_score ?? 0) >= 4 && (assessment.presence_score ?? 0) >= 4) spiritualRewards.push({ icon: "🙏", title: "Vida de oração forte", subtitle: "Oração e presença de Deus em alta", earned: true, bg: "bg-brand-green/10" });
  if (healthStatus === "saudavel") spiritualRewards.push({ icon: "🕊️", title: "Coração saudável", subtitle: "Saúde espiritual plena", earned: true, bg: "bg-brand-green/10" });
  if (spiritualRewards.length < 3) {
    if (!spiritualRewards.some(r => r.icon === "⛪")) spiritualRewards.push({ icon: "⛪", title: "Adorador fiel", subtitle: "Confirme 4 cultos para desbloquear", earned: false, bg: "bg-muted" });
    if (!spiritualRewards.some(r => r.icon === "🔥")) spiritualRewards.push({ icon: "🔥", title: "Exemplo de fé da turma", subtitle: "Alcance 75% no termômetro", earned: false, bg: "bg-muted" });
  }

  // ── Lesson selected view ──
  const lessonsById = new Map(courses.flatMap((course) => course.lessons).map((lesson) => [lesson.id, lesson]));
  const latePendingItems = !isLeaderOrAdmin
    ? agendaSchedule.schedule
        .filter((entry) => entry.eventDate <= now)
        .map((entry) => {
          const lesson = lessonsById.get(entry.lessonId);
          if (!lesson || fullyCompletedLessonIds.has(entry.lessonId)) return null;
          const pendingDevotionals = (devotionalsByLesson.get(entry.lessonId) ?? [])
            .filter((devotional) => !completedDevotionalIds.has(devotional.id));
          const studyPending = !completedLessonIds.has(entry.lessonId);
          if (!studyPending && pendingDevotionals.length === 0) return null;
          return { entry, lesson, studyPending, pendingDevotionals };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    : [];
  const recoveryPendingItems = activeRecovery
    ? courses.flatMap((course) => course.lessons.map((lesson) => {
        const studyPending = recoveryLessonIds.has(lesson.id) && !completedLessonIds.has(lesson.id);
        const pendingDevotionals = (devotionalsByLesson.get(lesson.id) ?? []).filter(
          (devotional) => recoveryDevotionalIds.has(devotional.id) && !completedDevotionalIds.has(devotional.id),
        );
        if (!studyPending && pendingDevotionals.length === 0) return null;
        const moduleTitle = course.modules.find((module) => module.id === lesson.module_id)?.title ?? course.title;
        return { course, lesson, moduleTitle, studyPending, pendingDevotionals };
      }).filter((item): item is NonNullable<typeof item> => item !== null))
    : [];

  function openLatePendingLesson(lesson: Lesson, openDevotional = false) {
    setSelectedRecoveryMode(false);
    setSelectedLesson(lesson);
    setSelectedLessonMode("choice");
    setAutoOpenDevotionalLessonId(openDevotional ? lesson.id : null);
    setSubTab("trilha");
    const course = courses.find((item) => item.lessons.some((courseLesson) => courseLesson.id === lesson.id));
    if (course) setExpandedCourse(course.id);
  }

  function openRecoveryLesson(lesson: Lesson, openDevotional = false) {
    setSelectedRecoveryMode(true);
    setSelectedLesson(lesson);
    setSelectedLessonMode("choice");
    setAutoOpenDevotionalLessonId(openDevotional ? lesson.id : null);
    setSubTab("trilha");
  }

  if (selectedLesson) {
    if (selectedLessonMode === "edit" && isLeaderOrAdmin) {
      return (
        <div className="px-5 pt-5 pb-6">
          <Suspense fallback={<LazySectionFallback />}>
            <LessonContentEditor lesson={selectedLesson} onBack={() => setSelectedLessonMode("choice")} />
          </Suspense>
        </div>
      );
    }
    if (selectedLessonMode === "edit-devotionals" && isLeaderOrAdmin) {
      return (
        <div className="px-5 pt-5 pb-6">
          <Suspense fallback={<LazySectionFallback />}>
            <LessonDevotionalEditor lesson={selectedLesson} onBack={() => setSelectedLessonMode("choice")} />
          </Suspense>
        </div>
      );
    }
    if (selectedLessonMode === "study") {
      const isLateAccessStudy = !isLeaderOrAdmin && agendaSchedule.lateAccessLessonIds.has(selectedLesson.id) && !fullyCompletedLessonIds.has(selectedLesson.id);
      return (
        <div className="px-5 pt-5 pb-6">
          <Suspense fallback={<LazySectionFallback />}>
            <JourneyLessonView
              lesson={selectedLesson}
              onBack={() => { setSelectedLesson(null); setSelectedLessonMode("choice"); }}
              isLateAccess={isLateAccessStudy}
              overrideId={manualLessonOverrideMap.get(selectedLesson.id)?.id}
              awardedPoints={manualLessonOverrideMap.get(selectedLesson.id)?.custom_points ?? null}
              onComplete={(lessonId) => {
                setCompletedLessonIds((current) => new Set(current).add(lessonId));
              }}
            />
          </Suspense>
        </div>
      );
    }
    const isLateAccess = !isLeaderOrAdmin && agendaSchedule.lateAccessLessonIds.has(selectedLesson.id) && !fullyCompletedLessonIds.has(selectedLesson.id);
    const hasManualOverride = manualLessonOverrideMap.has(selectedLesson.id);
    const isStudyOpen = isLeaderOrAdmin || agendaSchedule.studyOpenLessonIds.has(selectedLesson.id) || hasManualOverride;
    const isFullyDone = fullyCompletedLessonIds.has(selectedLesson.id);
    const isStudyLocked = !isLeaderOrAdmin && !isStudyOpen && !isLateAccess && !isFullyDone;
    const studyDone = completedLessonIds.has(selectedLesson.id);
    return (
      <Suspense fallback={<LazySectionFallback />}>
        <LessonChoiceView
          lesson={selectedLesson}
          onBack={() => { setSelectedLesson(null); setSelectedLessonMode("choice"); }}
          onOpenStudy={() => setSelectedLessonMode("study")}
          onOpenEdit={(isLeaderOrAdmin && (isSuper || selectedLesson.church_id !== null)) ? () => setSelectedLessonMode("edit") : undefined}
          onOpenEditDevotionals={(isLeaderOrAdmin && (isSuper || selectedLesson.church_id !== null)) ? () => setSelectedLessonMode("edit-devotionals") : undefined}
          autoOpenAvailableDevotional={autoOpenDevotionalLessonId === selectedLesson.id}
          onAutoOpenAvailableDevotionalConsumed={() => setAutoOpenDevotionalLessonId(null)}
          scheduledDevotionalDates={agendaSchedule.lessonDevotionalDates.get(selectedLesson.id)}
          releasedDayNumbers={agendaSchedule.lessonReleasedDays.get(selectedLesson.id)}
          devotionalMode={agendaSchedule.lessonDevotionalMode.get(selectedLesson.id) ?? "10_days"}
          eventDate={agendaSchedule.lessonEventDate.get(selectedLesson.id) ?? undefined}
          isStudyLocked={isStudyLocked}
          isLateAccess={isLateAccess}
          isStudyCompleted={studyDone}
          overrideId={manualLessonOverrideMap.get(selectedLesson.id)?.id}
          awardedPoints={manualLessonOverrideMap.get(selectedLesson.id)?.custom_points ?? null}
          recoveryMode={selectedRecoveryMode}
        />
      </Suspense>
    );
  }

  if (showLeaderRoom && isLeaderOrAdmin) {
    return (
      <div className="px-5 pt-5 pb-6 space-y-4">
        <button
          onClick={() => setShowLeaderRoom(false)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-inter font-semibold text-foreground shadow-sm hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao discipulado
        </button>

        <Suspense fallback={<LazySectionFallback />}>
          <LeaderRoomSection asTab />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5 pb-6 space-y-4">
      {/* Hero — always visible */}
      <DiscipleshipHero
        fullName={profile?.full_name}
        community={currentArea}
        healthStatus={healthStatus}
      />

      {(isLeaderOrAdmin || isSuper) && (
        <button
          onClick={() => setShowNovoCurso(true)}
          className="w-full flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-sm hover:bg-primary/10 transition-colors text-left"
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-primary/15 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-montserrat font-bold text-primary text-sm">Novo Curso</p>
            <p className="text-muted-foreground text-xs font-inter">
              Adicionar curso da plataforma ou criar personalizado
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary/60 flex-shrink-0" />
        </button>
      )}

      {isLeaderOrAdmin && (
        <button
          onClick={() => setShowLeaderRoom(true)}
          className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:bg-muted/50 transition-colors text-left"
        >
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-montserrat font-bold text-foreground text-sm">Sala do Líder</p>
            <p className="text-muted-foreground text-xs font-inter">
              Acesse rapidamente a gestão da turma, encontros, avisos e relatórios.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        </button>
      )}

      {activeRecovery && (
        <div className="rounded-2xl border border-amber-300/60 bg-amber-50/80 shadow-sm overflow-hidden">
          <div className="p-4 flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-montserrat font-black text-amber-950 text-sm">Trilha especial de recuperação</p>
              <p className="font-inter text-xs text-amber-900/75 mt-1">
                Somente suas lições e devocionais pendentes aparecem aqui.
              </p>
              <p className="inline-flex items-center gap-1.5 font-inter text-[11px] font-semibold text-amber-800 mt-2">
                <Clock className="w-3.5 h-3.5" />
                Até {new Date(activeRecovery.available_until).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="border-t border-amber-300/40 bg-card/70">
            {recoveryPendingItems.length === 0 ? (
              <div className="p-4 text-center">
                <p className="font-montserrat font-bold text-brand-green text-sm">Tudo recuperado!</p>
                <p className="font-inter text-xs text-muted-foreground mt-1">Você não possui mais itens pendentes nesta liberação.</p>
              </div>
            ) : recoveryPendingItems.map(({ lesson, moduleTitle, studyPending, pendingDevotionals }) => (
              <div key={lesson.id} className="p-4 border-b border-border last:border-b-0">
                <p className="font-inter text-[10px] font-bold uppercase tracking-wide text-amber-700">{moduleTitle}</p>
                <p className="font-montserrat font-bold text-foreground text-sm mt-1">Lição {lesson.order_num} — {lesson.title}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {studyPending && (
                    <button
                      onClick={() => openRecoveryLesson(lesson)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/10 px-3 py-2 text-xs font-montserrat font-bold text-secondary hover:bg-secondary/20"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      Fazer lição · 10 pts
                    </button>
                  )}
                  {pendingDevotionals.length > 0 && (
                    <button
                      onClick={() => openRecoveryLesson(lesson, true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-green/10 px-3 py-2 text-xs font-montserrat font-bold text-brand-green hover:bg-brand-green/20"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {pendingDevotionals.length} devocional{pendingDevotionals.length > 1 ? "is" : ""} · 2 pts
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {latePendingItems.length > 0 && !activeRecovery && (
        <div className="rounded-2xl border border-accent/30 bg-accent/10 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowLatePendingList((value) => !value)}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-accent/10 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-accent/20 text-accent-foreground flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-montserrat font-bold text-foreground text-sm">Pendências em aberto</p>
              <p className="text-muted-foreground text-xs font-inter">
                Você tem lição ou devocionais de encontros passados para finalizar sem pontuação.
              </p>
            </div>
            <ChevronRight className={`w-4 h-4 text-accent-foreground/70 flex-shrink-0 transition-transform ${showLatePendingList ? "rotate-90" : ""}`} />
          </button>

          {showLatePendingList && (
            <div className="border-t border-accent/20 bg-card/60">
              {latePendingItems.map(({ entry, lesson, studyPending, pendingDevotionals }) => (
                <div key={entry.eventId} className="p-4 border-b border-border last:border-b-0 space-y-3">
                  <div>
                    <p className="font-montserrat font-bold text-foreground text-sm">
                      Lição {lesson.order_num} - {lesson.title}
                    </p>
                    <p className="font-inter text-xs text-muted-foreground">
                      Encontro em {entry.eventDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {studyPending && (
                      <button
                        onClick={() => openLatePendingLesson(lesson)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/10 px-3 py-2 text-xs font-montserrat font-bold text-secondary hover:bg-secondary/20 transition-colors"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        Fazer lição
                      </button>
                    )}
                    {pendingDevotionals.length > 0 && (
                      <button
                        onClick={() => openLatePendingLesson(lesson, true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-green/10 px-3 py-2 text-xs font-montserrat font-bold text-brand-green hover:bg-brand-green/20 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {pendingDevotionals.length} devocional{pendingDevotionals.length > 1 ? "is" : ""}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab pills */}
      <div className="flex gap-1.5 bg-muted/50 rounded-2xl p-1.5 border border-border/50">
        {SUB_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSubTab(tab.key)}
              className={`flex-1 relative flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl font-inter text-[11px] font-bold transition-all duration-200 ${
                isActive
                  ? "text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSubTab"
                  className="absolute inset-0 rounded-xl bg-card border border-border/60 shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`relative z-10 w-4 h-4 ${isActive ? tab.activeIconClass : "text-muted-foreground"}`} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animated sub-tab content */}
      <AnimatePresence mode="wait">
        {subTab === "trilha" && (
          <motion.div key="trilha" variants={subTabVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <CourseTrailSection
              courses={courses}
              tracks={learningTracks}
              expandedCourse={expandedCourse}
              onExpandCourse={setExpandedCourse}
              unlockedCourseIds={unlockedCourseIds}
              completedLessonIds={completedLessonIds}
              fullyCompletedLessonIds={fullyCompletedLessonIds}
              agendaSchedule={agendaSchedule}
              manualLessonOverrideIds={new Set(manualLessonOverrideMap.keys())}
              isLeaderOrAdmin={isLeaderOrAdmin}
              isSuper={isSuper}
              onRefresh={() => fetchAll(true)}
              onSelectLesson={(lesson) => {
                setSelectedRecoveryMode(false);
                setSelectedLesson(lesson);
                setSelectedLessonMode("choice");
              }}
            />
            <Suspense fallback={<LazySectionFallback />}>
              <ResourceLibrary />
            </Suspense>
          </motion.div>
        )}

        {subTab === "saude" && (
          <motion.div key="saude" variants={subTabVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <SpiritualHealthSection
              doneDev={doneDev} totalDev={devocionais.length}
              doneForm={doneForm} totalForm={formacoes.length}
              doneEnc={doneEnc} totalEnc={encontros.length}
              completedActs={completedActs} totalActs={totalActs} pct={pct}
            />
            <ThermometerSection dimensions={thermometerDimensions} />
          </motion.div>
        )}

        {subTab === "avaliacao" && (
          <motion.div key="avaliacao" variants={subTabVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <AssessmentSection
              assessment={assessment}
              showAssessment={showAssessment}
              setShowAssessment={setShowAssessment}
              form={form}
              setForm={setForm}
              saving={saving}
              onSave={handleSaveAssessment}
              month={month}
              allAssessments={allAssessments}
            />
          </motion.div>
        )}

        {subTab === "pastoral" && (
          <motion.div key="pastoral" variants={subTabVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <GrowthPlanSection plan={plan} />
            <RewardsSection rewards={spiritualRewards} />
            <HelpSection
              helpSent={helpSent}
              showHelpModal={showHelpModal}
              setShowHelpModal={setShowHelpModal}
              helpType={helpType}
              setHelpType={setHelpType}
              helpMessage={helpMessage}
              setHelpMessage={setHelpMessage}
              helpSending={helpSending}
              onSendHelp={handleSendHelp}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showNovoCurso && (
        <Suspense fallback={null}>
          <NovoCursoModal
            churchId={isSuper ? null : (profile?.church_id ?? null)}
            onClose={() => setShowNovoCurso(false)}
            onCreated={() => { setShowNovoCurso(false); fetchAll(); }}
          />
        </Suspense>
      )}
    </div>
  );
}
