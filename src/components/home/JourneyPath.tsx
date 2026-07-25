import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";
import { useAgendaSchedule } from "@/hooks/useAgendaSchedule";

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

export default function JourneyPath() {
  const { profile } = useAuth();
  const { effectiveArea } = useAreaSwitch();
  const agendaSchedule = useAgendaSchedule();
  const currentArea = effectiveArea || profile?.area || "";
  const [loading, setLoading] = useState(true);
  const [integrated, setIntegrated] = useState<IntegratedStats>({
    lessonsStudied: 0, totalLessons: 0,
    devotionalsCompleted: 0, totalDevotionals: 0,
    attendancePresent: 0,
    worshipApproved: 0,
  });

  useEffect(() => {
    if (currentArea) fetchData();
  }, [currentArea, profile?.church_id]);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const churchId = profile?.church_id;

    const [
      { data: coursesData },
      { data: lessonsData },
      { data: responsesData },
      { data: devContentData },
      { data: devProgressData },
      { data: attendanceData },
      { data: worshipData },
      { data: unlocksData },
    ] = await Promise.all([
      supabase.from("courses").select("id, title, subtitle, order_num, track_id, church_id").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : "church_id.is.null").order("order_num"),
      supabase.from("lessons").select("id, title, order_num, objective, course_id, church_id").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : "church_id.is.null").order("order_num"),
      supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("is_completed", true),
      supabase.from("devotional_content").select("id, lesson_id").not("lesson_id", "is", null),
      supabase.from("devotional_progress").select("devotional_id").eq("user_id", user.id),
      supabase.from("attendance").select("event_id, status").eq("user_id", user.id),
      supabase.from("worship_attendance").select("id, status").eq("user_id", user.id).eq("status", "aprovado"),
      churchId
        ? supabase.from("course_unlocks").select("course_id").eq("area", currentArea).or(`church_id.is.null,church_id.eq.${churchId}`)
        : supabase.from("course_unlocks").select("course_id").eq("area", currentArea).is("church_id", null),
    ]);

    const unlockedIds = new Set((unlocksData ?? []).map((unlock) => unlock.course_id));
    const accessibleCourses = (coursesData ?? []).filter((course) =>
      course.track_id === null && unlockedIds.has(course.id)
    );
    const accessibleCourseIds = new Set(accessibleCourses.map((course) => course.id));
    const lessons = (lessonsData ?? []).filter((lesson) => accessibleCourseIds.has(lesson.course_id));
    const accessibleLessonIds = new Set(lessons.map((lesson) => lesson.id));
    const devotionals = (devContentData ?? []).filter((devotional) =>
      devotional.lesson_id !== null && accessibleLessonIds.has(devotional.lesson_id)
    );
    const lessonIdsWithResponses = new Set<string>(
      (responsesData ?? [])
        .filter((response) => accessibleLessonIds.has(response.lesson_id))
        .map((response) => response.lesson_id),
    );

    const accessibleDevotionalIds = new Set(devotionals.map((devotional) => devotional.id));
    const completedDevIds = new Set(
      (devProgressData ?? [])
        .filter((progress) => accessibleDevotionalIds.has(progress.devotional_id))
        .map((progress) => progress.devotional_id),
    );
    // Integrated stats
    const totalDevotionals = devotionals.length;
    setIntegrated({
      lessonsStudied: lessonIdsWithResponses.size,
      totalLessons: lessons.length,
      devotionalsCompleted: completedDevIds.size,
      totalDevotionals,
      attendancePresent: (attendanceData ?? []).filter((a: any) => a.status === "presente").length,
      worshipApproved: (worshipData ?? []).length,
    });

    setLoading(false);
  }

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
  const nextScheduledLesson = agendaSchedule.nextScheduledEvent;
  const lastScheduledLesson = [...agendaSchedule.schedule]
    .reverse()
    .find((entry) => entry.eventDate < new Date()) ?? null;

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

        {/* Fase atual, sempre alinhada à agenda real do GC */}
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-secondary/10 px-3 py-2">
          <span className="text-sm">{nextScheduledLesson ? "📍" : "🗓️"}</span>
          <div className="min-w-0">
            {agendaSchedule.loading ? (
              <p className="font-inter text-[10px] text-muted-foreground">Consultando a agenda do seu GC...</p>
            ) : nextScheduledLesson ? (
              <>
                <p className="font-montserrat font-bold text-foreground text-xs">
                  Fase atual: Curso {nextScheduledLesson.courseOrder} — {nextScheduledLesson.courseTitle}
                </p>
                <p className="truncate font-inter text-[10px] text-muted-foreground">
                  Próxima: Lição {nextScheduledLesson.lessonOrder} — {nextScheduledLesson.lessonTitle}
                </p>
              </>
            ) : lastScheduledLesson ? (
              <>
                <p className="font-montserrat font-bold text-foreground text-xs">
                  Última etapa: Curso {lastScheduledLesson.courseOrder} — {lastScheduledLesson.courseTitle}
                </p>
                <p className="truncate font-inter text-[10px] text-muted-foreground">
                  Aguardando o próximo encontro ser agendado pelo líder.
                </p>
              </>
            ) : (
              <>
                <p className="font-montserrat font-bold text-foreground text-xs">Jornada aguardando agenda</p>
                <p className="font-inter text-[10px] text-muted-foreground">
                  Nenhuma lição foi agendada para o seu GC.
                </p>
              </>
            )}
          </div>
        </div>
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
              <p className="font-inter text-[10px] text-muted-foreground">{label}</p>
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
            <p className="font-inter text-[10px] text-muted-foreground">em encontros</p>
          </div>
        </div>
        <div className="flex-1 bg-card rounded-xl border border-border p-3 flex items-center gap-2.5">
          <Heart className="w-4 h-4 text-brand-green flex-shrink-0" />
          <div>
            <p className="font-montserrat font-bold text-foreground text-xs">{integrated.worshipApproved} culto{integrated.worshipApproved !== 1 ? "s" : ""}</p>
            <p className="font-inter text-[10px] text-muted-foreground">confirmados</p>
          </div>
        </div>
      </div>

    </div>
  );
}
