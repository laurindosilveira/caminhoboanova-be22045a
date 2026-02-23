import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";
import DevotionalView from "@/components/home/DevotionalView";

type Lesson = {
  id: string;
  title: string;
  order_num: number;
  objective: string | null;
  topics: string[] | null;
  course_id: string;
};

type DevotionalItem = {
  id: string;
  lesson_id: string;
  day_number: number;
  title: string;
  bible_text: string;
  bible_reference: string;
  reflection: string;
  prayer: string;
  practice: string;
  questions: string[];
};

type Props = {
  lesson: Lesson;
  onBack: () => void;
  onOpenStudy: () => void;
};

export default function LessonChoiceView({ lesson, onBack, onOpenStudy }: Props) {
  const [devotionals, setDevotionals] = useState<DevotionalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDevotionals, setShowDevotionals] = useState(false);
  const [viewingDevotional, setViewingDevotional] = useState<DevotionalItem | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("devotional_content")
        .select("*")
        .eq("lesson_id", lesson.id)
        .order("day_number");
      setDevotionals((data ?? []) as DevotionalItem[]);
      setLoading(false);
    }
    load();
  }, [lesson.id]);

  // Viewing a specific devotional
  if (viewingDevotional) {
    return (
      <DevotionalView
        activity={{
          id: viewingDevotional.id,
          title: viewingDevotional.title || `Dia ${viewingDevotional.day_number}`,
          subtitle: `${lesson.title} · Dia ${viewingDevotional.day_number}`,
          points: 0,
        }}
        devotionalData={{
          bible_text: viewingDevotional.bible_text,
          bible_reference: viewingDevotional.bible_reference,
          reflection: viewingDevotional.reflection,
          prayer: viewingDevotional.prayer,
          practice: viewingDevotional.practice,
          questions: viewingDevotional.questions,
        }}
        onBack={() => setViewingDevotional(null)}
        onComplete={async () => setViewingDevotional(null)}
        isCompleted={false}
        hideCompleteButton
      />
    );
  }

  // Show devotionals list
  if (showDevotionals) {
    return (
      <div className="px-5 pt-5 pb-6 space-y-4">
        <button onClick={() => setShowDevotionals(false)} className="flex items-center gap-1.5 text-muted-foreground font-inter text-sm hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="rounded-2xl p-4" style={{ background: "var(--gradient-hero)" }}>
          <p className="text-primary-foreground/60 font-inter text-xs mb-1">📖 Devocionais da semana · Lição {lesson.order_num}</p>
          <h2 className="font-montserrat font-black text-primary-foreground text-lg">{lesson.title}</h2>
          <p className="text-primary-foreground/70 font-inter text-xs mt-1">
            {devotionals.length} devocional(is) para esta semana
          </p>
        </div>

        {devotionals.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-montserrat font-bold text-foreground text-sm">Devocionais em preparação</p>
            <p className="text-muted-foreground font-inter text-xs mt-1">Seu pastor está preparando os devocionais para esta lição.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {devotionals.map((dev) => (
              <button key={dev.id} onClick={() => setViewingDevotional(dev)}
                className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm text-left hover:bg-brand-green/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-montserrat font-bold text-brand-green text-sm">{dev.day_number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-foreground text-sm">{dev.title || `Dia ${dev.day_number}`}</p>
                  <p className="text-muted-foreground font-inter text-[10px] truncate">
                    {dev.bible_reference ? `✝️ ${dev.bible_reference}` : ""}
                  </p>
                </div>
                <span className="text-muted-foreground text-xs">→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Choice screen: Devocionais vs Estudo
  return (
    <div className="px-5 pt-5 pb-6 space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground font-inter text-sm hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <p className="text-primary-foreground/60 font-inter text-xs mb-1">Lição {lesson.order_num}</p>
        <h2 className="font-montserrat font-black text-primary-foreground text-xl leading-tight">{lesson.title}</h2>
        {lesson.objective && (
          <p className="text-primary-foreground/70 font-inter text-xs mt-2">{lesson.objective}</p>
        )}
      </div>

      <p className="font-inter text-sm text-muted-foreground text-center">Escolha o que deseja acessar:</p>

      <div className="grid grid-cols-1 gap-3">
        {/* Devocionais */}
        <button onClick={() => setShowDevotionals(true)}
          className="flex items-center gap-4 p-5 bg-card rounded-2xl border border-border shadow-sm text-left hover:bg-brand-green/5 hover:border-brand-green/30 transition-all group">
          <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-green/20 transition-colors">
            <BookOpen className="w-7 h-7 text-brand-green" />
          </div>
          <div className="flex-1">
            <p className="font-montserrat font-bold text-foreground text-base">📖 Devocionais</p>
            <p className="text-muted-foreground font-inter text-xs mt-0.5">
              {loading ? "Carregando..." : `${devotionals.length} devocional(is) para a semana`}
            </p>
            <p className="text-muted-foreground font-inter text-[10px] mt-1 italic">
              Preparação diária antes do encontro
            </p>
          </div>
          <span className="text-brand-green font-montserrat font-bold text-lg">→</span>
        </button>

        {/* Estudo */}
        <button onClick={onOpenStudy}
          className="flex items-center gap-4 p-5 bg-card rounded-2xl border border-border shadow-sm text-left hover:bg-secondary/5 hover:border-secondary/30 transition-all group">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
            <GraduationCap className="w-7 h-7 text-secondary" />
          </div>
          <div className="flex-1">
            <p className="font-montserrat font-bold text-foreground text-base">📝 Estudo</p>
            <p className="text-muted-foreground font-inter text-xs mt-0.5">
              Conteúdo completo do encontro
            </p>
            <p className="text-muted-foreground font-inter text-[10px] mt-1 italic">
              Saudação, vídeo, perguntas, prática e oração
            </p>
          </div>
          <span className="text-secondary font-montserrat font-bold text-lg">→</span>
        </button>
      </div>
    </div>
  );
}
