import { useAuth } from "@/contexts/AuthContext";
import { useAgendaSchedule } from "@/hooks/useAgendaSchedule";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ChevronRight, CheckCircle2, Sparkles, GraduationCap, Calendar, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FocusSectionProps {
  onNavigateToDiscipulado: () => void;
}

export default function FocusSection({ onNavigateToDiscipulado }: FocusSectionProps) {
  const { user } = useAuth();
  const agenda = useAgendaSchedule();
  const [todaysDevDone, setTodaysDevDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nextActivity, setNextActivity] = useState<{
    type: "devotional" | "devotional_recovery" | "devotional_upcoming" | "lesson";
    title: string;
    subtitle: string;
    lessonId: string;
    mode: "devotional" | "choice";
  } | null>(null);

  useEffect(() => {
    if (agenda.loading) return;

    async function checkStatus() {
      if (!user) return;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayDow = today.getDay(); // 0=Sun, 6=Sat
      const isWeekend = todayDow === 0 || todayDow === 6;

      // 1. Fetch all completed devotionals for this user
      const { data: devProgress } = await supabase
        .from("devotional_progress")
        .select("completed_at, devotional_id")
        .eq("user_id", user.id);

      const completedIds = new Set(devProgress?.map(p => p.devotional_id) || []);

      // Find active event window entry
      const currentEntry = agenda.schedule.find(e => today >= e.windowStart && today < e.eventDate);

      if (currentEntry) {
        const { data: devContent } = await supabase
          .from("devotional_content")
          .select("id, day_number, title, bible_reference")
          .eq("lesson_id", currentEntry.lessonId);

        const lessonDevs = (devContent || []).sort((a, b) => a.day_number - b.day_number);
        const releasedDays = currentEntry.releasedDayNumbers ? new Set(currentEntry.releasedDayNumbers) : null;

        // Find today's devotional (business-day match)
        let todaysDevId: string | null = null;
        let todaysDevTitle = "";
        let todaysDevRef = "";

        for (const dev of lessonDevs) {
          if (releasedDays && !releasedDays.has(dev.day_number)) continue;
          const devDate = currentEntry.devotionalDates[dev.day_number - 1];
          if (devDate && devDate.getTime() === today.getTime()) {
            todaysDevId = dev.id;
            todaysDevTitle = dev.title || `Devocional ${dev.day_number}`;
            todaysDevRef = dev.bible_reference || "";
            break;
          }
        }

        if (todaysDevId) {
          const isDone = completedIds.has(todaysDevId);
          setTodaysDevDone(isDone);
          if (!isDone) {
            setNextActivity({
              type: "devotional",
              title: todaysDevTitle,
              subtitle: todaysDevRef,
              lessonId: currentEntry.lessonId,
              mode: "devotional"
            });
            setLoading(false);
            return;
          }
          // Today's devotional is done — fall through to lesson check below
        } else {
          // No devotional scheduled today (weekend or gap day)

          // On weekends, check for missed weekday devocionais (weekend recovery window)
          if (isWeekend) {
            const daysToMonday = todayDow === 0 ? 6 : todayDow - 1;
            const monday = new Date(today);
            monday.setDate(today.getDate() - daysToMonday);
            const friday = new Date(monday);
            friday.setDate(monday.getDate() + 4);

            const missedDevs = lessonDevs.filter(dev => {
              if (releasedDays && !releasedDays.has(dev.day_number)) return false;
              if (completedIds.has(dev.id)) return false;
              const devDate = currentEntry.devotionalDates[dev.day_number - 1];
              if (!devDate) return false;
              return devDate >= monday && devDate <= friday;
            });

            if (missedDevs.length > 0) {
              const count = missedDevs.length;
              setNextActivity({
                type: "devotional_recovery",
                title: "Devocional a Recuperar",
                subtitle: `${count} devocional${count !== 1 ? 'is' : ''} pendente${count !== 1 ? 's' : ''} desta semana`,
                lessonId: currentEntry.lessonId,
                mode: "devotional"
              });
              setLoading(false);
              return;
            }
          }

          // Check for the next upcoming devotional in this window
          const upcomingEntry = lessonDevs
            .map(dev => ({ dev, devDate: currentEntry.devotionalDates[dev.day_number - 1] }))
            .filter(({ dev, devDate }) => {
              if (!devDate) return false;
              if (releasedDays && !releasedDays.has(dev.day_number)) return false;
              if (completedIds.has(dev.id)) return false;
              return devDate.getTime() > today.getTime();
            })
            .sort((a, b) => a.devDate.getTime() - b.devDate.getTime())[0];

          if (upcomingEntry) {
            const { dev: upcomingDev, devDate: nextDate } = upcomingEntry;
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const isTomorrow = nextDate.getTime() === tomorrow.getTime();
            const dayLabel = isTomorrow
              ? "Amanhã"
              : nextDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
            setNextActivity({
              type: "devotional_upcoming",
              title: upcomingDev.title || `Devocional ${upcomingDev.day_number}`,
              subtitle: dayLabel,
              lessonId: currentEntry.lessonId,
              mode: "devotional"
            });
            setLoading(false);
            return;
          }
        }
      }

      // 2. No active devotional — check for next lesson to study
      const { data: lessonResponses, error: lessonProgressError } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("is_completed", true);

      if (lessonProgressError) throw lessonProgressError;

      const studiedLessons = new Set(lessonResponses?.map(r => r.lesson_id) || []);

      // Jornada mostra somente a lição que está na vez na agenda. Lições antigas
      // pendentes são tratadas separadamente na aba Caminho.
      const latestStartedEntry = [...agenda.schedule]
        .reverse()
        .find(e => today.getTime() >= new Date(e.eventDate).setHours(0, 0, 0, 0));
      const scheduledFocusEntry = agenda.currentEntry ?? latestStartedEntry ?? null;
      const pendingLessonEntry = scheduledFocusEntry && !studiedLessons.has(scheduledFocusEntry.lessonId)
        ? scheduledFocusEntry
        : null;

      if (pendingLessonEntry) {
        setNextActivity({
          type: "lesson",
          title: pendingLessonEntry.lessonTitle,
          subtitle: "Estude esta lição para avançar",
          lessonId: pendingLessonEntry.lessonId,
          mode: "choice"
        });
      } else {
        setNextActivity(null);
      }
      setLoading(false);
    }

    checkStatus();
  }, [agenda.currentEntry, agenda.loading, agenda.schedule, user]);

  if (loading) return null;

  const handleAction = () => {
    if (nextActivity) {
      window.dispatchEvent(new CustomEvent("navigate-to-lesson", {
        detail: {
          lessonId: nextActivity.lessonId,
          mode: nextActivity.mode,
        },
      }));
    }
    onNavigateToDiscipulado();
  };

  return (
    <div className="px-5 mb-6">
      <AnimatePresence mode="wait">
        {nextActivity && nextActivity.type === "devotional" ? (
          <motion.div
            key="devotional-focus"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden rounded-[2.5rem] p-8 shadow-xl border border-primary/20"
            style={{ background: "var(--gradient-hero)" }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/80 font-inter text-xs font-bold uppercase tracking-widest">Foco do Dia</span>
              </div>

              <h2 className="text-white font-montserrat font-black text-2xl mb-2 leading-tight">
                Comece seu caminho hoje com Deus
              </h2>
              <p className="text-white/70 font-inter text-sm mb-8 leading-relaxed">
                {nextActivity.title} • {nextActivity.subtitle}
              </p>

              <button
                onClick={handleAction}
                className="w-full bg-white text-primary font-montserrat font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-white/90 transition-colors"
              >
                Fazer devocional
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-10%] w-60 h-60 bg-secondary/20 rounded-full blur-3xl" />
          </motion.div>
        ) : nextActivity && nextActivity.type === "devotional_recovery" ? (
          <motion.div
            key="recovery-focus"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card rounded-[2.5rem] p-7 border border-amber-400/30 shadow-md"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-xl">
                <RefreshCw className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-amber-500 font-inter text-xs font-bold uppercase tracking-widest">Recuperar Devocional</span>
            </div>
            <h2 className="font-montserrat font-black text-foreground text-xl mb-2 leading-tight">
              Ainda dá tempo de recuperar!
            </h2>
            <p className="text-muted-foreground font-inter text-sm mb-6">
              {nextActivity.subtitle}. Aproveite o fim de semana para não perder pontos.
            </p>
            <button
              onClick={handleAction}
              className="w-full bg-amber-500 text-white font-montserrat font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all"
            >
              Recuperar Devocional
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : nextActivity && nextActivity.type === "devotional_upcoming" ? (
          <motion.div
            key="upcoming-focus"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card rounded-[2.5rem] p-7 border border-primary/10 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <span className="text-primary font-inter text-xs font-bold uppercase tracking-widest">Próximo Devocional</span>
            </div>
            <h2 className="font-montserrat font-black text-foreground text-xl mb-1 leading-tight">
              Você está em dia!
            </h2>
            <p className="text-muted-foreground font-inter text-sm mb-4">
              {nextActivity.subtitle}:{" "}
              <span className="font-semibold text-foreground">{nextActivity.title}</span>
            </p>
            <p className="text-primary/70 font-inter text-xs font-bold uppercase tracking-wider">
              Continue assim! ✨
            </p>
          </motion.div>
        ) : todaysDevDone ? (
          <motion.div
            key="completed-focus"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-[2.5rem] p-7 border border-brand-green/20 shadow-sm text-center"
          >
            <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-brand-green" />
            </div>
            <h3 className="font-montserrat font-black text-foreground text-lg mb-1">
              Você já caminhou com Deus hoje
            </h3>
            <p className="text-muted-foreground font-inter text-sm mb-6">
              Seu devocional está em dia! Continue brilhando.
            </p>

            {nextActivity && nextActivity.type === "lesson" ? (
              <div className="bg-muted/30 rounded-2xl p-4 border border-border flex items-center gap-3 text-left">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-foreground text-xs uppercase tracking-tight">Próxima Etapa</p>
                  <p className="text-muted-foreground font-inter text-xs truncate">{nextActivity.title}</p>
                </div>
                <button
                  onClick={handleAction}
                  className="bg-secondary/10 text-secondary p-2 rounded-lg hover:bg-secondary/20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <p className="text-brand-green font-inter text-xs font-bold uppercase tracking-wider">
                Sua jornada está incrível! ✨
              </p>
            )}
          </motion.div>
        ) : nextActivity && nextActivity.type === "lesson" ? (
          <motion.div
            key="lesson-focus"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-[2.5rem] p-7 border border-secondary/20 shadow-md"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-secondary/10 p-2 rounded-xl">
                <BookOpen className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-secondary font-inter text-xs font-bold uppercase tracking-widest">Próximo Passo</span>
            </div>
            <h2 className="font-montserrat font-black text-foreground text-xl mb-2 leading-tight">
              Seu próximo passo está aqui
            </h2>
            <p className="text-muted-foreground font-inter text-sm mb-6">
              {nextActivity.title}
            </p>
            <button
              onClick={handleAction}
              className="w-full bg-secondary text-secondary-foreground font-montserrat font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-all"
            >
              Continuar Jornada
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="no-focus"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <p className="text-muted-foreground font-inter text-sm italic">
              Tudo em dia por aqui! Aproveite sua jornada. ✨
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
