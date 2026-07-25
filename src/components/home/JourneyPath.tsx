import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";

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
  lessons: Lesson[];
};

type IntegratedStats = {
  lessonsStudied: number;
  totalLessons: number;
  devotionalsCompleted: number;
  totalDevotionals: number;
  attendancePresent: number;
  totalEvents: number;
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
  const { profile, role, isSuper } = useAuth();
  const { effectiveArea } = useAreaSwitch();
  const currentArea = effectiveArea || profile?.area || "";
  const [courses, setCourses] = useState<Course[]>([]);
  const [fullyCompletedLessonIds, setFullyCompletedLessonIds] = useState<Set<string>>(new Set());
  const [unlockedCourseIds, setUnlockedCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [integrated, setIntegrated] = useState<IntegratedStats>({
    lessonsStudied: 0, totalLessons: 0,
    devotionalsCompleted: 0, totalDevotionals: 0,
    attendancePresent: 0, totalEvents: 0,
    worshipApproved: 0,
  });

  useEffect(() => {
    if (currentArea) fetchData();
  }, [currentArea]);

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
      { data: eventsData },
      { data: attendanceData },
      { data: worshipData },
      { data: unlocksData },
    ] = await Promise.all([
      supabase.from("courses").select("*").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : "church_id.is.null").order("order_num"),
      supabase.from("lessons").select("id, title, order_num, objective, course_id").order("order_num"),
      supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id).eq("is_completed", true),
      supabase.from("devotional_content").select("id, lesson_id").not("lesson_id", "is", null),
      supabase.from("devotional_progress").select("devotional_id").eq("user_id", user.id),
      supabase.from("events").select("id, linked_lesson_id, area, event_date").not("linked_lesson_id", "is", null).order("event_date"),
      supabase.from("attendance").select("event_id, status").eq("user_id", user.id),
      supabase.from("worship_attendance").select("id, status").eq("user_id", user.id).eq("status", "aprovado"),
      supabase.from("course_unlocks").select("course_id").eq("area", currentArea),
    ]);

    const lessons = lessonsData ?? [];
    const lessonIdsWithResponses = new Set<string>(
      (responsesData ?? []).map((response: { lesson_id: string }) => response.lesson_id),
    );

    // Compute fully completed lessons (study + all devotionals)
    const devsByLesson: Record<string, string[]> = {};
    (devContentData ?? []).forEach((d: any) => {
      if (d.lesson_id) {
        if (!devsByLesson[d.lesson_id]) devsByLesson[d.lesson_id] = [];
        devsByLesson[d.lesson_id].push(d.id);
      }
    });
    const completedDevIds = new Set((devProgressData ?? []).map((p: any) => p.devotional_id));
    const fullyDone = new Set<string>();
    lessons.forEach((l) => {
      const hasStudy = lessonIdsWithResponses.has(l.id);
      const lessonDevs = devsByLesson[l.id] ?? [];
      const allDevsDone = lessonDevs.length === 0 || lessonDevs.every(devId => completedDevIds.has(devId));
      if (hasStudy && allDevsDone) fullyDone.add(l.id);
    });
    setFullyCompletedLessonIds(fullyDone);

    // Build courses
    const courseList = (coursesData ?? []).map(c => ({
      ...c,
      lessons: lessons.filter(l => l.course_id === c.id),
    }));
    setCourses(courseList);
    setUnlockedCourseIds(new Set((unlocksData ?? []).map((u: any) => u.course_id)));
    
    // Integrated stats
    const totalDevotionals = (devContentData ?? []).length;
    setIntegrated({
      lessonsStudied: lessonIdsWithResponses.size,
      totalLessons: lessons.length,
      devotionalsCompleted: completedDevIds.size,
      totalDevotionals,
      attendancePresent: (attendanceData ?? []).filter((a: any) => a.status === "presente").length,
      totalEvents: (eventsData ?? []).length,
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
          // Only consider unlocked courses
          const unlockedCourses = courses.filter(c => unlockedCourseIds.has(c.id));
          if (unlockedCourses.length === 0) return null;

          // Find the highest-order unlocked course that still has pending lessons
          const withPending = unlockedCourses.filter(c =>
            c.lessons.some(l => !fullyCompletedLessonIds.has(l.id))
          );

          // If all unlocked courses are fully done, show the last unlocked as completed
          const currentCourse = withPending.length > 0
            ? withPending[withPending.length - 1]
            : unlockedCourses[unlockedCourses.length - 1];

          const currentLesson = currentCourse.lessons.find(l => !fullyCompletedLessonIds.has(l.id));
          const allDone = withPending.length === 0;

          return (
            <div className={`mt-2 flex items-center gap-2 rounded-xl px-3 py-2 ${allDone ? "bg-brand-green/10" : "bg-secondary/10"}`}>
              <span className="text-sm">{allDone ? "🏆" : "📍"}</span>
              <div className="min-w-0">
                <p className="font-montserrat font-bold text-foreground text-xs">
                  {allDone ? "Completo" : "Fase atual"}: Curso {currentCourse.order_num} — {currentCourse.title}
                </p>
                {currentLesson && !allDone && (
                  <p className="font-inter text-[10px] text-muted-foreground truncate">
                    Próxima: Lição {currentLesson.order_num} — {currentLesson.title}
                  </p>
                )}
                {allDone && (
                  <p className="font-inter text-[10px] text-brand-green truncate">
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
