import { useAuth } from "@/contexts/AuthContext";
import { useAgendaSchedule } from "@/hooks/useAgendaSchedule";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ChevronRight, CheckCircle2, Star, Sparkles, GraduationCap } from "lucide-react";
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
    type: "devotional" | "lesson";
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

      // 1. Check if today's devotional is done
      const { data: devProgress } = await supabase
        .from("devotional_progress")
        .select("completed_at, devotional_id")
        .eq("user_id", user.id);

      const completedIds = new Set(devProgress?.map(p => p.devotional_id) || []);

      // Find if there's an active event window for today
      const currentEntry = agenda.schedule.find(e => today >= e.windowStart && today < e.eventDate);

      if (currentEntry) {
        const { data: devContent } = await supabase
          .from("devotional_content")
          .select("id, day_number, title, bible_reference")
          .eq("lesson_id", currentEntry.lessonId);

        const lessonDevs = (devContent || []).sort((a, b) => a.day_number - b.day_number);
        const releasedDays = currentEntry.releasedDayNumbers ? new Set(currentEntry.releasedDayNumbers) : null;
        
        // Find today's devotional in the schedule
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
        }
      }

      // 2. If dev is done (or none today), find next lesson to study
      const { data: lessonResponses } = await supabase
        .from("lesson_responses")
        .select("lesson_id")
        .eq("user_id", user.id);
      
      const studiedLessons = new Set(lessonResponses?.map(r => r.lesson_id) || []);
      
      // Look for a lesson that should be studied (event date passed or today)
      const pendingLessonEntry = agenda.schedule.find(e => 
        !studiedLessons.has(e.lessonId) && today.getTime() >= new Date(e.eventDate).setHours(0,0,0,0)
      );

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
  }, [agenda.loading, agenda.schedule, user]);

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
            
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-10%] w-60 h-60 bg-secondary/20 rounded-full blur-3xl" />
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


