import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronLeft, BookOpen, MessageCircle, Target,
  Pen, Heart, CheckCircle2, Save, Play, Link
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  order_num: number;
  objective: string | null;
  topics: string[] | null;
  course_id: string;
};

type Response = { [key: string]: string };

// Static lesson content (in a real app, this would come from DB)
const LESSON_CONTENT: Record<number, {
  greeting: string;
  icebreaker: string;
  summary: string;
  bibleTexts: string[];
  questions: string[];
  practice: string;
  prayerPrompt: string;
  videoLink?: string;
}> = {
  1: {
    greeting: "Bem-vindo à primeira lição! Esta é uma jornada especial de descoberta da fé. Que Deus abençoe este tempo de preparação.",
    icebreaker: "Pergunta inicial: Se você pudesse descrever sua fé em uma palavra agora, qual seria? Por quê?",
    summary: "Nesta lição exploramos os fundamentos do que significa seguir a Cristo. A vida cristã começa com um encontro pessoal com Jesus, não apenas com uma religião ou tradição. Deus nos convida a um relacionamento real e transformador.",
    bibleTexts: ["João 3:16", "Romanos 10:9-10", "Efésios 2:8-9"],
    questions: [
      "O que te trouxe até este momento de preparação para a confirmação?",
      "Como você descreveria sua relação com Deus hoje?",
      "Qual parte do Evangelho mais te toca e por quê?"
    ],
    practice: "Esta semana: Reserve 5 minutos diários para orar e ler um versículo bíblico. Anote como você se sentiu.",
    prayerPrompt: "Escreva uma oração pessoal expressando onde você está espiritualmente hoje e o que você espera desta jornada.",
    videoLink: "",
  },
  2: {
    greeting: "Que alegria ter você novamente! Esperamos que a prática da semana passada tenha sido significativa. Vamos aprofundar juntos.",
    icebreaker: "Compartilhe: Algo que você aprendeu ou viveu na última semana que te fez pensar em Deus.",
    summary: "A graça é o dom mais precioso que Deus nos oferece. Não merecemos, não podemos comprar — apenas receber. Esta lição nos convida a entender que nossa salvação é fruto do amor incondicional de Deus, não de nossos méritos.",
    bibleTexts: ["Efésios 2:4-9", "Tito 3:5-7", "Romanos 5:8"],
    questions: [
      "Como você entende a diferença entre graça e mérito?",
      "Já experimentou receber algo que não merecia? Como foi?",
      "Como a graça de Deus muda a forma como você se vê?"
    ],
    practice: "Esta semana: Faça algo generoso por alguém sem esperar nada em troca. Reflita sobre como Deus age da mesma forma conosco.",
    prayerPrompt: "Escreva uma oração de gratidão pela graça de Deus em sua vida, mencionando algo específico pelo qual é grato.",
    videoLink: "",
  },
};

function getDefaultContent(lessonNum: number) {
  return {
    greeting: `Bem-vindo à lição ${lessonNum}! Que este tempo seja de crescimento e encontro com Deus.`,
    icebreaker: "Pergunta inicial: O que você mais aprendeu na lição anterior?",
    summary: "Conteúdo desta lição em preparação pelo seu pastor. Fique atento às próximas atualizações!",
    bibleTexts: ["Salmos 119:105", "2 Timóteo 3:16-17"],
    questions: [
      "Como você está aplicando o que aprendeu na última lição?",
      "O que mais te desafia na sua caminhada com Deus?",
      "Que oração você tem feito ultimamente?"
    ],
    practice: "Esta semana: Aplique algo aprendido nesta lição em uma situação real do seu dia a dia.",
    prayerPrompt: "Escreva uma oração sobre o que você aprendeu hoje e como deseja crescer.",
    videoLink: "",
  };
}

type Props = {
  lesson: Lesson;
  onBack: () => void;
  isAdmin?: boolean;
  targetUserId?: string; // For admin viewing a specific user's responses
};

export default function JourneyLessonView({ lesson, onBack, isAdmin = false, targetUserId }: Props) {
  const content = LESSON_CONTENT[lesson.order_num] ?? getDefaultContent(lesson.order_num);
  const [responses, setResponses] = useState<Response>({});
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const userId = targetUserId;

  useEffect(() => {
    async function loadResponses() {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = targetUserId ?? user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("lesson_responses")
        .select("question_key, response")
        .eq("lesson_id", lesson.id)
        .eq("user_id", uid);
      if (data) {
        const map: Response = {};
        data.forEach(r => { map[r.question_key] = r.response; });
        setResponses(map);
      }
    }
    loadResponses();
  }, [lesson.id, targetUserId]);

  const saveResponse = useCallback(async (key: string, value: string) => {
    if (isAdmin) return; // Admin can't edit youth's responses
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("lesson_responses").upsert({
      user_id: user.id,
      lesson_id: lesson.id,
      question_key: key,
      response: value,
    }, { onConflict: "user_id,lesson_id,question_key" });
    setLastSaved(new Date());
  }, [lesson.id, isAdmin]);

  async function handleSaveAll() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const upserts = Object.entries(responses).map(([key, response]) => ({
      user_id: user.id, lesson_id: lesson.id, question_key: key, response,
    }));
    if (upserts.length > 0) {
      await supabase.from("lesson_responses").upsert(upserts, { onConflict: "user_id,lesson_id,question_key" });
    }
    setSaving(false);
    setLastSaved(new Date());
  }

  function updateResponse(key: string, value: string) {
    if (isAdmin) return;
    setResponses(prev => ({ ...prev, [key]: value }));
  }

  const ResponseField = ({ qKey, placeholder }: { qKey: string; placeholder: string }) => (
    <textarea
      value={responses[qKey] ?? ""}
      onChange={e => updateResponse(qKey, e.target.value)}
      onBlur={e => saveResponse(qKey, e.target.value)}
      placeholder={isAdmin ? "(Sem resposta ainda)" : placeholder}
      readOnly={isAdmin}
      rows={3}
      className={`w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-colors ${isAdmin ? "opacity-70 cursor-default" : ""}`}
    />
  );

  return (
    <div className="space-y-4">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground font-inter text-sm hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" />
        {isAdmin ? "Voltar" : "Voltar às lições"}
      </button>

      {/* Header */}
      <div className="rounded-2xl p-4 overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <p className="text-primary-foreground/60 font-inter text-xs mb-1">Lição {lesson.order_num}</p>
        <h2 className="font-montserrat font-black text-primary-foreground text-xl leading-tight">{lesson.title}</h2>
        {lesson.objective && (
          <p className="text-primary-foreground/70 font-inter text-xs mt-2 leading-relaxed">{lesson.objective}</p>
        )}
        {isAdmin && targetUserId && (
          <div className="mt-2 px-2.5 py-1 bg-white/20 rounded-lg inline-block">
            <span className="text-primary-foreground text-xs font-inter font-semibold">👁️ Visualizando respostas do jovem</span>
          </div>
        )}
      </div>

      {/* 1. Saudação do Líder */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          <p className="font-montserrat font-bold text-foreground text-sm">👋 Saudação do Líder</p>
        </div>
        <div className="p-4">
          <p className="font-inter text-sm text-foreground leading-relaxed">{content.greeting}</p>
        </div>
      </div>

      {/* 2. Quebra-gelo */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-secondary" />
          <p className="font-montserrat font-bold text-foreground text-sm">🔗 Quebra-gelo</p>
        </div>
        <div className="p-4 space-y-3">
          <p className="font-inter text-sm text-foreground leading-relaxed">{content.icebreaker}</p>
          <ResponseField qKey="icebreaker" placeholder="Escreva sua resposta aqui..." />
        </div>
      </div>

      {/* 3. Episódio / Conteúdo */}
      {content.videoLink && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            <p className="font-montserrat font-bold text-foreground text-sm">🎥 Episódio</p>
          </div>
          <div className="p-4">
            <a href={content.videoLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl text-primary hover:bg-primary/20 transition-colors">
              <Play className="w-5 h-5" />
              <span className="font-inter text-sm font-medium">Assistir episódio</span>
              <Link className="w-4 h-4 ml-auto" />
            </a>
          </div>
        </div>
      )}

      {/* 4. Resumo do Conteúdo */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-secondary" />
          <p className="font-montserrat font-bold text-foreground text-sm">📝 Resumo do Conteúdo</p>
        </div>
        <div className="p-4">
          <p className="font-inter text-sm text-foreground leading-relaxed">{content.summary}</p>
          {lesson.topics && lesson.topics.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {lesson.topics.map((topic, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-green flex-shrink-0 mt-0.5" />
                  <p className="font-inter text-xs text-foreground">{topic}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Objetivo */}
      {lesson.objective && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <p className="font-montserrat font-bold text-foreground text-sm">🎯 Objetivo do Encontro</p>
          </div>
          <div className="p-4">
            <p className="font-inter text-sm text-foreground leading-relaxed">{lesson.objective}</p>
          </div>
        </div>
      )}

      {/* 6. Textos Bíblicos */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <span className="text-sm">✝️</span>
          <p className="font-montserrat font-bold text-foreground text-sm">📖 Textos Bíblicos</p>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {content.bibleTexts.map(text => (
              <a
                key={text}
                href={`https://www.bible.com/pt/bible/search?q=${encodeURIComponent(text)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 rounded-xl text-primary font-inter text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <span>📖</span>
                <span>{text}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Perguntas para Diálogo */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <Pen className="w-4 h-4 text-primary" />
          <p className="font-montserrat font-bold text-foreground text-sm">💬 Perguntas para Diálogo</p>
          {!isAdmin && <span className="ml-auto text-muted-foreground font-inter text-[10px]">Salvo automaticamente</span>}
        </div>
        <div className="p-4 space-y-4">
          {content.questions.map((question, i) => (
            <div key={i}>
              <p className="font-inter text-sm text-foreground mb-2 font-medium">{i + 1}. {question}</p>
              <ResponseField qKey={`q${i}`} placeholder="Escreva sua reflexão aqui..." />
            </div>
          ))}
        </div>
      </div>

      {/* 8. Prática da Semana */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <Target className="w-4 h-4 text-secondary" />
          <p className="font-montserrat font-bold text-foreground text-sm">🧭 Prática da Semana</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="p-3 bg-secondary/10 rounded-xl">
            <p className="font-inter text-sm text-foreground leading-relaxed">{content.practice}</p>
          </div>
          <p className="font-inter text-xs text-muted-foreground font-medium">O que você planeja viver na prática esta semana?</p>
          <ResponseField qKey="practice" placeholder="Escreva aqui como vai aplicar esta lição..." />
        </div>
      </div>

      {/* 9. Oração Final */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          <p className="font-montserrat font-bold text-foreground text-sm">🙏 Oração Final</p>
        </div>
        <div className="p-4 space-y-3">
          <p className="font-inter text-xs text-muted-foreground leading-relaxed">{content.prayerPrompt}</p>
          <ResponseField qKey="prayer" placeholder="Escreva sua oração pessoal..." />
        </div>
      </div>

      {/* Save button (only for users) */}
      {!isAdmin && (
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-inter text-sm font-medium text-primary-foreground disabled:opacity-70 transition-opacity"
          style={{ background: "var(--gradient-hero)" }}
        >
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : lastSaved ? `✅ Salvo às ${lastSaved.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "Salvar respostas"}
        </button>
      )}
    </div>
  );
}
