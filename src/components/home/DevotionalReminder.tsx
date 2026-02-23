import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, X, ChevronRight } from "lucide-react";

type PendingLesson = {
  lessonId: string;
  lessonTitle: string;
  lessonOrder: number;
  totalDevotionals: number;
  completedDevotionals: number;
};

type Props = {
  onNavigateToDiscipulado: () => void;
};

export default function DevotionalReminder({ onNavigateToDiscipulado }: Props) {
  const [pending, setPending] = useState<PendingLesson[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [{ data: lessons }, { data: devs }, { data: prog }] = await Promise.all([
        supabase.from("lessons").select("id, title, order_num").order("order_num"),
        supabase.from("devotional_content").select("id, lesson_id"),
        supabase.from("devotional_progress").select("devotional_id").eq("user_id", user.id),
      ]);

      const completedSet = new Set((prog ?? []).map((p: any) => p.devotional_id));

      // Group devotionals by lesson
      const lessonDevMap: Record<string, { total: number; completed: number }> = {};
      (devs ?? []).forEach((d: any) => {
        if (!d.lesson_id) return;
        if (!lessonDevMap[d.lesson_id]) lessonDevMap[d.lesson_id] = { total: 0, completed: 0 };
        lessonDevMap[d.lesson_id].total++;
        if (completedSet.has(d.id)) lessonDevMap[d.lesson_id].completed++;
      });

      // Find lessons with pending devotionals
      const pendingLessons: PendingLesson[] = [];
      (lessons ?? []).forEach((l: any) => {
        const info = lessonDevMap[l.id];
        if (info && info.completed < info.total) {
          pendingLessons.push({
            lessonId: l.id,
            lessonTitle: l.title,
            lessonOrder: l.order_num,
            totalDevotionals: info.total,
            completedDevotionals: info.completed,
          });
        }
      });

      setPending(pendingLessons);
      setLoading(false);
    }
    check();
  }, []);

  if (loading || dismissed || pending.length === 0) return null;

  const totalPending = pending.reduce((s, p) => s + (p.totalDevotionals - p.completedDevotionals), 0);
  const first = pending[0];

  return (
    <div className="mx-5 mb-3 rounded-2xl border border-brand-green/30 bg-brand-green/5 p-4 relative overflow-hidden">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-green/15 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-brand-green" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <p className="font-montserrat font-bold text-foreground text-sm">
            📖 {totalPending} devocional{totalPending > 1 ? "is" : ""} pendente{totalPending > 1 ? "s" : ""}
          </p>
          <p className="text-muted-foreground font-inter text-[11px] mt-0.5">
            Lição {first.lessonOrder}: {first.lessonTitle}
            {pending.length > 1 && ` (+${pending.length - 1} lição${pending.length > 2 ? "ões" : ""})`}
          </p>
          <p className="text-muted-foreground font-inter text-[10px] mt-1 italic">
            Complete seus devocionais antes do encontro!
          </p>
        </div>
      </div>

      <button
        onClick={onNavigateToDiscipulado}
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-green/15 text-brand-green font-inter text-xs font-semibold hover:bg-brand-green/25 transition-colors"
      >
        Ir para Devocionais
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
