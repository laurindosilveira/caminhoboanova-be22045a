import { useCallback, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Lock, BookOpen, ChevronDown, ChevronRight, CalendarDays, Heart, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";
import { useAgendaSchedule } from "@/hooks/useAgendaSchedule";
import { getCourseIdsByMode, isCourseVisibleInJourney, resolveCourseUnlocks } from "@/lib/courseAccess";
import { resolveJourneyFocus } from "@/lib/journeyFocus";

type Lesson = {
  id: string;
  title: string;
  order_num: number;
  objective: string | null;
  course_id: string;
};

type Course = {
  id: string;
  title: string;
  subtitle: string | null;
  order_num: number;
  church_id: string | null;
  track_id: string | null;
  lessons: Lesson[];
};

type CourseUnlock = {
  course_id: string;
  area: string;
  turma_id: string | null;
  access_mode: "open" | "scheduled" | string;
};

type IntegratedStats = {
  lessonsStudied: number;
  totalLessons: number;
  devotionalsCompleted: number;
  totalDevotionals: number;
  attendancePresent: number;
  worshipApproved: number;
};

function ProgressRing({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  onSelectLesson?: (lessonId: string) => void;
};

export default function JourneyPath({ onSelectLesson }: Props = {}) {
  const { profile, isSuper } = useAuth();
  const { effectiveArea, effectiveTurmaId, switchNonce } = useAreaSwitch();
  const currentArea = effectiveArea || profile?.area || "";
  const currentTurmaId = effectiveTurmaId ?? profile?.turma_id ?? null;
  const agendaSchedule = useAgendaSchedule();
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [fullyCompletedLessonIds, setFullyCompletedLessonIds] = useState<Set<string>>(new Set());
  const [unlockedCourseIds, setUnlockedCourseIds] = useState<Set<string>>(new Set());
  const [openAccessCourseIds, setOpenAccessCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [integrated, setIntegrated] = useState<IntegratedStats>({
    lessonsStudied: 0, totalLessons: 0,
    devotionalsCompleted: 0, totalDevotionals: 0,
    attendancePresent: 0,
    worshipApproved: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const churchId = profile?.church_id;
    let unlocksQuery = supabase
      .from("course_unlocks")
      .select("course_id, area, turma_id, access_mode");
    if (churchId) {
      unlocksQuery = unlocksQuery.eq("church_id", churchId);
    }

    const [
      { data: coursesData },
      { data: lessonsData },
      { data: responsesData },
      { data: devContentData },
      { data: devProgressData },
      { data: attendanceData },
      { data: worshipData },
      { data: unlocksData },
      { data: globalReleasesData },
      { data: trackReleasesData },
    ] = await Promise.all([
      supabase.from("courses").select("id, title, subtitle, order_num, church_id, track_id").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : "church_id.is.null").order("order_num"),
      supabase.from("lessons").select("id, title, order_num, objective, course_id").order("order_num"),
      supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("is_completed", true),
      supabase.from("devotional_content").select("id, lesson_id").not("lesson_id", "is", null),
      supabase.from("devotional_progress").select("devotional_id").eq("user_id", user.id),
      supabase.from("attendance").select("event_id, status").eq("user_id", user.id),
      supabase.from("worship_attendance").select("id, status").eq("user_id", user.id).eq("status", "aprovado"),
      unlocksQuery,
      churchId
        ? supabase.from("global_course_releases").select("course_id").eq("church_id", churchId)
        : Promise.resolve({ data: [] as { course_id: string }[], error: null }),
      churchId
        ? supabase.from("track_church_releases").select("track_id").eq("church_id", churchId)
        : Promise.resolve({ data: [] as { track_id: string }[], error: null }),
    ]);

    const resolvedUnlocks = resolveCourseUnlocks(
      ((unlocksData ?? []) as CourseUnlock[]),
      {
        turmaId: currentTurmaId,
        area: currentArea || null,
      },
    );
    const nextUnlockedCourseIds = new Set(resolvedUnlocks.keys());
    const nextOpenAccessCourseIds = getCourseIdsByMode(resolvedUnlocks, "open");
    const releasedCourseIds = new Set((globalReleasesData ?? []).map((release) => release.course_id));
    const releasedTrackIds = new Set((trackReleasesData ?? []).map((release) => release.track_id));
    const visibleCourseRows = (coursesData ?? []).filter((course) =>
      isCourseVisibleInJourney(course, {
        churchId: churchId ?? null,
        isSuper,
        unlockedCourseIds: nextUnlockedCourseIds,
        releasedCourseIds,
        releasedTrackIds,
      }),
    );
    const visibleCourseIds = new Set(visibleCourseRows.map((course) => course.id));
    const lessons = (lessonsData ?? []).filter((lesson) => visibleCourseIds.has(lesson.course_id));
    const visibleLessonIds = new Set(lessons.map((lesson) => lesson.id));
    const lessonIdsWithResponses = new Set<string>(
      (responsesData ?? [])
        .filter((response: { lesson_id: string }) => visibleLessonIds.has(response.lesson_id))
        .map((response: { lesson_id: string }) => response.lesson_id),
    );
    setCompletedLessonIds(lessonIdsWithResponses);

    // Compute fully completed lessons (study + all devotionals)
    const devsByLesson: Record<string, string[]> = {};
    (devContentData ?? []).forEach((d) => {
      if (d.lesson_id && visibleLessonIds.has(d.lesson_id)) {
        if (!devsByLesson[d.lesson_id]) devsByLesson[d.lesson_id] = [];
        devsByLesson[d.lesson_id].push(d.id);
      }
    });
    const visibleDevotionalIds = new Set(Object.values(devsByLesson).flat());
    const completedDevIds = new Set(
      (devProgressData ?? [])
        .filter((progress) => visibleDevotionalIds.has(progress.devotional_id))
        .map((progress) => progress.devotional_id),
    );
    const fullyDone = new Set<string>();
    lessons.forEach((l) => {
      const hasStudy = lessonIdsWithResponses.has(l.id);
      const lessonDevs = devsByLesson[l.id] ?? [];
      const allDevsDone = lessonDevs.length === 0 || lessonDevs.every(devId => completedDevIds.has(devId));
      if (hasStudy && allDevsDone) fullyDone.add(l.id);
    });
    setFullyCompletedLessonIds(fullyDone);

    // Build courses
    const courseList = visibleCourseRows.map(c => ({
      ...c,
      lessons: lessons.filter(l => l.course_id === c.id),
    }));
    setCourses(courseList);
    setUnlockedCourseIds(nextUnlockedCourseIds);
    setOpenAccessCourseIds(nextOpenAccessCourseIds);

    const firstUnlockedCourse = courseList.find((course) => nextUnlockedCourseIds.has(course.id));
    setExpandedCourse(firstUnlockedCourse?.id ?? courseList[0]?.id ?? null);

    // Integrated stats
    const totalDevotionals = visibleDevotionalIds.size;
    setIntegrated({
      lessonsStudied: lessonIdsWithResponses.size,
      totalLessons: lessons.length,
      devotionalsCompleted: completedDevIds.size,
      totalDevotionals,
      attendancePresent: (attendanceData ?? []).filter((attendance) => attendance.status === "presente").length,
      worshipApproved: (worshipData ?? []).length,
    });

    setLoading(false);
  }, [currentArea, currentTurmaId, isSuper, profile?.church_id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData, switchNonce]);

  if (loading) {
    return (
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-montserrat font-black text-foreground text-xl">🛤️ Minha Jornada</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Overall progress
  const totalItems = integrated.totalLessons + integrated.totalDevotionals;
  const doneItems = integrated.lessonsStudied + integrated.devotionalsCompleted;
  const overallPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const lessonPct = integrated.totalLessons > 0 ? Math.round((integrated.lessonsStudied / integrated.totalLessons) * 100) : 0;
  const devPct = integrated.totalDevotionals > 0 ? Math.round((integrated.devotionalsCompleted / integrated.totalDevotionals) * 100) : 0;

  return (
    <div className="px-5 pt-6">
      {/* Header + overall progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-montserrat font-black text-foreground text-xl">🛤️ Caminho do Discipulado</h2>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-inter bg-muted rounded-full px-3 py-1">
              {overallPct}% completo
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${overallPct}%`,
                background: overallPct >= 70 ? "var(--gradient-green)" : overallPct >= 34 ? "var(--gradient-orange)" : "hsl(var(--destructive))",
              }}
            />
          </div>
          <span className="text-xs font-montserrat font-bold text-secondary flex-shrink-0">{doneItems}/{totalItems}</span>
        </div>
        <p className="text-muted-foreground font-inter text-[11px] mt-1.5">
          Progresso geral: lições estudadas e devocionais concluídos
        </p>

        {/* Fase atual */}
        {(() => {
          if (agendaSchedule.loading) return null;
          const focus = resolveJourneyFocus({
            courses,
            unlockedCourseIds,
            openAccessCourseIds,
            fullyCompletedLessonIds,
            currentAgendaEntry: agendaSchedule.currentEntry,
            schedule: agendaSchedule.schedule,
          });
          if (!focus) return null;

          const currentCourse = courses.find((course) => course.id === focus.courseId);
          const currentLesson = currentCourse?.lessons.find((lesson) => lesson.id === focus.lessonId);
          if (!currentCourse) return null;

          const allDone = focus.mode === "complete";
          const lessonPrefix = focus.mode === "current_agenda"
            ? "Em vigor"
            : focus.mode === "upcoming_agenda"
              ? "Próxima na agenda"
              : focus.mode === "last_scheduled"
                ? "Última programada"
                : "Próxima";

          return (
            <div className={`mt-2 flex items-center gap-2 rounded-xl px-3 py-2 ${allDone ? "bg-brand-green/10" : "bg-secondary/10"}`}>
              <span className="text-sm">{allDone ? "🏆" : "📍"}</span>
              <div className="min-w-0">
                <p className="font-montserrat font-bold text-foreground text-xs">
                  {allDone ? "Completo" : "Fase atual"}: Curso {currentCourse.order_num} — {currentCourse.title}
                </p>
                {currentLesson && !allDone && (
                  <p className="font-inter text-xs text-muted-foreground truncate">
                    {lessonPrefix}: Lição {currentLesson.order_num} — {currentLesson.title}
                  </p>
                )}
                {focus.mode === "waiting_schedule" && (
                  <p className="font-inter text-xs text-muted-foreground truncate">
                    Aguardando o líder programar a próxima lição na Agenda
                  </p>
                )}
                {allDone && (
                  <p className="font-inter text-xs text-brand-green truncate">
                    Todas as lições concluídas! 🎉
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Lições", done: integrated.lessonsStudied, total: integrated.totalLessons, pct: lessonPct, color: "#1F3C88", icon: "🎓" },
          { label: "Devocionais", done: integrated.devotionalsCompleted, total: integrated.totalDevotionals, pct: devPct, color: "#2ECC71", icon: "📖" },
        ].map(({ label, done, total, pct, color, icon }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <ProgressRing pct={pct} color={color} size={48} />
              <span className="absolute inset-0 flex items-center justify-center text-base">{icon}</span>
            </div>
            <div>
              <p className="font-montserrat font-bold text-foreground text-sm">{done}/{total}</p>
              <p className="font-inter text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Extra stats row */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1 bg-card rounded-xl border border-border p-3 flex items-center gap-2.5">
          <CalendarDays className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="font-montserrat font-bold text-foreground text-xs">{integrated.attendancePresent} presença{integrated.attendancePresent !== 1 ? "s" : ""}</p>
            <p className="font-inter text-xs text-muted-foreground">em encontros</p>
          </div>
        </div>
        <div className="flex-1 bg-card rounded-xl border border-border p-3 flex items-center gap-2.5">
          <Heart className="w-4 h-4 text-brand-green flex-shrink-0" />
          <div>
            <p className="font-montserrat font-bold text-foreground text-xs">{integrated.worshipApproved} culto{integrated.worshipApproved !== 1 ? "s" : ""}</p>
            <p className="font-inter text-xs text-muted-foreground">confirmados</p>
          </div>
        </div>
      </div>

      {/* Courses list */}
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10">
            <BookOpen className="h-6 w-6 text-secondary" />
          </div>
          <p className="font-montserrat text-sm font-bold text-foreground">Aguardando liberação do próximo curso</p>
          <p className="mx-auto mt-1 max-w-xs font-inter text-xs leading-5 text-muted-foreground">
            Os cursos bloqueados ficam ocultos. Quando seu líder liberar um curso para este grupo, ele aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-4 h-4 text-secondary" />
            <p className="font-montserrat font-bold text-foreground text-sm">Trilha de Cursos</p>
          </div>

          {courses.map((course) => {
            const isOpen = expandedCourse === course.id;
            const isCourseUnlocked = unlockedCourseIds.has(course.id);
            const isOpenAccess = openAccessCourseIds.has(course.id);
            const doneLessons = course.lessons.filter(l => fullyCompletedLessonIds.has(l.id)).length;
            const totalLessons = course.lessons.length;
            const coursePct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

            return (
              <div key={course.id} className={`bg-card rounded-2xl border shadow-sm overflow-hidden ${
                isCourseUnlocked ? "border-border" : "border-border opacity-75"
              }`}>
                {/* Course header */}
                <button
                  onClick={() => isCourseUnlocked ? setExpandedCourse(isOpen ? null : course.id) : null}
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
                        {isOpenAccess && (
                          <p className="mt-0.5 font-inter text-xs font-semibold text-brand-green">
                            Acesso livre · conteúdo completo
                          </p>
                        )}
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
                          <span className={`font-inter text-xs font-semibold flex-shrink-0 ${coursePct === 100 ? "text-brand-green" : "text-muted-foreground"}`}>
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
                      course.lessons.map((lesson) => {
                        const isDone = completedLessonIds.has(lesson.id);
                        const isFullyDone = fullyCompletedLessonIds.has(lesson.id);
                        const isScheduled =
                          agendaSchedule.studyOpenLessonIds.has(lesson.id)
                          || agendaSchedule.lateAccessLessonIds.has(lesson.id);

                        // Open releases expose every lesson. Agenda releases expose a
                        // lesson only when its official availability window has begun.
                        const isLocked = !isOpenAccess && !isDone && !isFullyDone && !isScheduled;

                        const isClickable = !isLocked && !!onSelectLesson;
                        return (
                          <div
                            key={lesson.id}
                            role={isClickable ? "button" : undefined}
                            tabIndex={isClickable ? 0 : undefined}
                            onClick={isClickable ? () => onSelectLesson(lesson.id) : undefined}
                            onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") onSelectLesson(lesson.id); } : undefined}
                            className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 ${
                              isLocked ? "opacity-50" : ""
                            } ${isFullyDone ? "bg-brand-green/5" : isDone ? "bg-secondary/5" : ""} ${
                              isClickable ? "cursor-pointer active:bg-muted/60 transition-colors" : ""
                            }`}
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
                              <p className={`font-inter text-sm ${isFullyDone ? "text-brand-green font-medium" : isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                                {lesson.title}
                              </p>
                              {lesson.objective && (
                                <p className="text-muted-foreground font-inter text-xs truncate">{lesson.objective}</p>
                              )}
                            </div>
                            {isFullyDone && (
                              <span className="text-xs font-inter font-semibold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                ✓ Feita
                              </span>
                            )}
                            {isDone && !isFullyDone && (
                              <span className="text-xs font-inter font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                Em andamento
                              </span>
                            )}
                          </div>
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
