import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, Clock, ChevronRight, BookOpen, GraduationCap } from "lucide-react";

type NextItem = {
  type: "lesson" | "devotional";
  title: string;
  subtitle: string;
  courseTitle: string;
  courseOrder: number;
  lessonOrder: number;
  devotionalDay?: number;
  totalDevotionals?: number;
  completedDevotionals?: number;
};

export default function NextCourseActivityCard({ onNavigateToDiscipulado }: { onNavigateToDiscipulado: () => void }) {
  const { profile } = useAuth();
  const [nextItem, setNextItem] = useState<NextItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}min restantes`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!profile?.area) return;
    fetchNext();
  }, [profile?.area]);

  async function fetchNext() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [
      { data: courses },
      { data: lessons },
      { data: unlocks },
      { data: responses },
      { data: devContent },
      { data: devProgress },
    ] = await Promise.all([
      supabase.from("courses").select("id, title, order_num").order("order_num"),
      supabase.from("lessons").select("id, title, order_num, course_id").order("order_num"),
      supabase.from("course_unlocks").select("course_id").eq("area", profile?.area ?? ""),
      supabase.from("lesson_responses").select("lesson_id").eq("user_id", user.id),
      supabase.from("devotional_content").select("id, lesson_id, day_number, title, bible_reference").not("lesson_id", "is", null),
      supabase.from("devotional_progress").select("devotional_id").eq("user_id", user.id),
    ]);

    const unlockedIds = new Set((unlocks ?? []).map(u => u.course_id));
    const studiedLessons = new Set((responses ?? []).map(r => r.lesson_id));
    const completedDevIds = new Set((devProgress ?? []).map(p => p.devotional_id));

    // Group devotionals by lesson
    const devsByLesson: Record<string, typeof devContent> = {};
    (devContent ?? []).forEach(d => {
      if (!d.lesson_id) return;
      if (!devsByLesson[d.lesson_id]) devsByLesson[d.lesson_id] = [];
      devsByLesson[d.lesson_id]!.push(d);
    });

    // Check if a lesson is fully complete (studied + all devs done)
    const isLessonFullyDone = (lessonId: string) => {
      if (!studiedLessons.has(lessonId)) return false;
      const devs = devsByLesson[lessonId] ?? [];
      return devs.length === 0 || devs.every(d => completedDevIds.has(d.id));
    };

    // Build ordered course list with lessons
    const courseList = (courses ?? [])
      .filter(c => unlockedIds.has(c.id))
      .map(c => ({
        ...c,
        lessons: (lessons ?? []).filter(l => l.course_id === c.id),
      }));

    // Find the next activity: iterate through unlocked courses in order
    for (const course of courseList) {
      for (let i = 0; i < course.lessons.length; i++) {
        const lesson = course.lessons[i];
        // Check if previous lesson is done (sequential lock)
        if (i > 0 && !isLessonFullyDone(course.lessons[i - 1].id)) break;

        // If lesson not studied yet → next activity is to study this lesson
        if (!studiedLessons.has(lesson.id)) {
          setNextItem({
            type: "lesson",
            title: `Lição ${lesson.order_num}: ${lesson.title}`,
            subtitle: "Estude esta lição para avançar na jornada",
            courseTitle: course.title,
            courseOrder: course.order_num,
            lessonOrder: lesson.order_num,
          });
          setLoading(false);
          return;
        }

        // Lesson studied — check devotionals
        const lessonDevs = (devsByLesson[lesson.id] ?? []).sort((a, b) => a.day_number - b.day_number);
        const pendingDev = lessonDevs.find(d => !completedDevIds.has(d.id));
        if (pendingDev) {
          const completedCount = lessonDevs.filter(d => completedDevIds.has(d.id)).length;
          setNextItem({
            type: "devotional",
            title: pendingDev.title || `Devocional ${pendingDev.day_number}`,
            subtitle: pendingDev.bible_reference || "",
            courseTitle: course.title,
            courseOrder: course.order_num,
            lessonOrder: lesson.order_num,
            devotionalDay: pendingDev.day_number,
            totalDevotionals: lessonDevs.length,
            completedDevotionals: completedCount,
          });
          setLoading(false);
          return;
        }
        // This lesson is fully done, continue to next
      }
    }

    // All done
    setNextItem(null);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="px-5 pt-5">
        <div className="h-48 rounded-3xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!nextItem) {
    return (
      <div className="px-5 pt-5">
        <div className="rounded-3xl shadow-xl border border-border overflow-hidden bg-card">
          <div className="bg-gradient-orange px-5 py-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
            <span className="font-montserrat font-bold text-primary-foreground text-sm tracking-wide">SUA PRÓXIMA ETAPA</span>
          </div>
          <div className="p-5 text-center">
            <span className="text-4xl block mb-3">🎉</span>
            <p className="font-montserrat font-bold text-foreground text-base">Tudo em dia!</p>
            <p className="text-muted-foreground font-inter text-sm mt-1">Você completou todas as etapas disponíveis. Parabéns!</p>
          </div>
        </div>
      </div>
    );
  }

  const isDevotional = nextItem.type === "devotional";
  const devPct = nextItem.totalDevotionals && nextItem.totalDevotionals > 0
    ? Math.round(((nextItem.completedDevotionals ?? 0) / nextItem.totalDevotionals) * 100)
    : 0;

  return (
    <div className="px-5 pt-5">
      <div className="rounded-3xl shadow-xl border border-border overflow-hidden bg-card">
        {/* Header */}
        <div className="bg-gradient-orange px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
            <span className="font-montserrat font-bold text-primary-foreground text-sm tracking-wide">SUA PRÓXIMA ETAPA</span>
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
            <Clock className="w-3 h-3 text-primary-foreground" />
            <span className="text-primary-foreground text-xs font-inter">{timeLeft}</span>
          </div>
        </div>

        <div className="p-5">
          {/* Course context */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[10px] font-inter font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
              Curso {nextItem.courseOrder} — {nextItem.courseTitle}
            </span>
            <span className="text-[10px] font-inter text-muted-foreground">
              · Lição {nextItem.lessonOrder}
            </span>
          </div>

          {/* Content */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg ${
              isDevotional ? "bg-gradient-orange shadow-secondary/30" : "bg-primary shadow-primary/30"
            }`}>
              {isDevotional ? <BookOpen className="w-7 h-7 text-primary-foreground" /> : <GraduationCap className="w-7 h-7 text-primary-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-muted-foreground text-[10px] font-inter mb-0.5 uppercase tracking-wide">
                {isDevotional ? `Devocional · Dia ${nextItem.devotionalDay}` : "Estudo de Lição"}
              </p>
              <h2 className="font-montserrat font-black text-card-foreground text-lg leading-tight">
                {nextItem.title}
              </h2>
              {nextItem.subtitle && (
                <p className="text-muted-foreground text-sm font-inter mt-0.5">{nextItem.subtitle}</p>
              )}
            </div>
          </div>

          {/* Devotional progress */}
          {isDevotional && nextItem.totalDevotionals && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground text-xs font-inter">
                  {nextItem.completedDevotionals}/{nextItem.totalDevotionals} devocionais desta lição
                </span>
                <span className="text-xs font-montserrat font-bold text-secondary">{devPct}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-orange rounded-full transition-all duration-700" style={{ width: `${devPct}%` }} />
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={onNavigateToDiscipulado}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-montserrat font-black text-sm text-primary-foreground bg-gradient-orange shadow-xl shadow-secondary/40 active:scale-95 transition-all"
          >
            {isDevotional ? "FAZER DEVOCIONAL →" : "ESTUDAR LIÇÃO →"}
          </button>
        </div>
      </div>
    </div>
  );
}
