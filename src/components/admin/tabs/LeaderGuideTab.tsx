import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ChevronRight, ChevronLeft, FileText, MessageCircle, Target, Heart, Pen, Play } from "lucide-react";
import BibleModal from "@/components/home/BibleModal";

type Course = { id: string; title: string; order_num: number };
type Lesson = { id: string; title: string; order_num: number; course_id: string; objective: string | null };
type LessonContent = {
  greeting: string;
  icebreaker: string;
  summary: string;
  bible_texts: string[];
  questions: string[];
  practice: string;
  prayer_prompt: string;
};

export default function LeaderGuideTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [content, setContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [bibleRef, setBibleRef] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoading(true);
    const { data } = await supabase.from("courses").select("id, title, order_num").order("order_num");
    setCourses(data ?? []);
    setLoading(false);
  }

  async function selectCourse(course: Course) {
    setSelectedCourse(course);
    setSelectedLesson(null);
    setContent(null);
    setLoading(true);
    const { data } = await supabase.from("lessons").select("id, title, order_num, course_id, objective").eq("course_id", course.id).order("order_num");
    setLessons(data ?? []);
    setLoading(false);
  }

  async function selectLesson(lesson: Lesson) {
    setSelectedLesson(lesson);
    setLoading(true);
    const { data } = await supabase.from("lesson_content").select("*").eq("lesson_id", lesson.id).maybeSingle();
    setContent(data ? {
      greeting: data.greeting || "",
      icebreaker: data.icebreaker || "",
      summary: data.summary || "",
      bible_texts: data.bible_texts?.length ? data.bible_texts : [],
      questions: data.questions?.length ? data.questions : [],
      practice: data.practice || "",
      prayer_prompt: data.prayer_prompt || "",
    } : null);
    setLoading(false);
  }

  // ===== LESSON DETAIL VIEW =====
  if (selectedLesson && content) {
    return (
      <div className="space-y-4">
        {/* Back button */}
        <button onClick={() => { setSelectedLesson(null); setContent(null); }}
          className="flex items-center gap-1.5 text-primary font-inter text-sm font-medium hover:underline">
          <ChevronLeft className="w-4 h-4" /> Voltar às lições
        </button>

        {/* Header */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="px-5 py-5">
            <p className="text-primary-foreground/60 font-inter text-[10px] uppercase tracking-wider font-semibold mb-1">
              Roteiro do Líder — {selectedCourse?.title}
            </p>
            <h2 className="font-montserrat font-black text-primary-foreground text-lg">
              Encontro {selectedLesson.order_num}: {selectedLesson.title}
            </h2>
            {selectedLesson.objective && (
              <p className="text-primary-foreground/70 font-inter text-xs mt-2">
                🎯 {selectedLesson.objective}
              </p>
            )}
          </div>
        </div>

        {/* Greeting */}
        {content.greeting && (
          <Section icon={<Play className="w-4 h-4 text-secondary" />} title="🙌 Saudação do Líder">
            <p className="text-foreground font-inter text-sm leading-relaxed whitespace-pre-wrap">{content.greeting}</p>
          </Section>
        )}

        {/* Icebreaker */}
        {content.icebreaker && (
          <Section icon={<MessageCircle className="w-4 h-4 text-accent" />} title="🧊 Quebra-gelo">
            <p className="text-foreground font-inter text-sm leading-relaxed whitespace-pre-wrap">{content.icebreaker}</p>
          </Section>
        )}

        {/* Summary */}
        {content.summary && (
          <Section icon={<FileText className="w-4 h-4 text-primary" />} title="📖 Resumo do Conteúdo">
            <p className="text-foreground font-inter text-sm leading-relaxed whitespace-pre-wrap">{content.summary}</p>
          </Section>
        )}

        {/* Bible Texts */}
        {content.bible_texts.length > 0 && (
          <Section icon={<BookOpen className="w-4 h-4 text-brand-green" />} title="📜 Textos Bíblicos">
            <div className="flex flex-wrap gap-2">
              {content.bible_texts.map(text => (
                <button key={text} onClick={() => setBibleRef(text)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 rounded-xl text-primary font-inter text-sm font-medium hover:bg-primary/20 transition-colors">
                  <span>📖</span><span>{text}</span>
                </button>
              ))}
            </div>
            <BibleModal reference={bibleRef || ""} open={!!bibleRef} onClose={() => setBibleRef(null)} />
          </Section>
        )}

        {/* Questions */}
        {content.questions.length > 0 && (
          <Section icon={<Pen className="w-4 h-4 text-secondary" />} title="💬 Perguntas para Diálogo">
            <div className="space-y-2.5">
              {content.questions.map((q, i) => (
                <div key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/15 flex items-center justify-center font-montserrat font-bold text-secondary text-xs">{i + 1}</span>
                  <p className="text-foreground font-inter text-sm leading-relaxed pt-0.5">{q}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Practice */}
        {content.practice && (
          <Section icon={<Target className="w-4 h-4 text-brand-green" />} title="📅 Prática da Semana">
            <p className="text-foreground font-inter text-sm leading-relaxed whitespace-pre-wrap">{content.practice}</p>
          </Section>
        )}

        {/* Prayer */}
        {content.prayer_prompt && (
          <Section icon={<Heart className="w-4 h-4 text-destructive" />} title="🙏 Oração Final">
            <p className="text-foreground font-inter text-sm leading-relaxed italic whitespace-pre-wrap">{content.prayer_prompt}</p>
          </Section>
        )}
      </div>
    );
  }

  // ===== LESSON LIST =====
  if (selectedCourse) {
    return (
      <div className="space-y-4">
        <button onClick={() => { setSelectedCourse(null); setLessons([]); }}
          className="flex items-center gap-1.5 text-primary font-inter text-sm font-medium hover:underline">
          <ChevronLeft className="w-4 h-4" /> Voltar aos cursos
        </button>

        <div className="px-1">
          <h2 className="font-montserrat font-black text-foreground text-lg">{selectedCourse.title}</h2>
          <p className="text-muted-foreground font-inter text-xs mt-1">Selecione um encontro para ver o roteiro</p>
        </div>

        {loading ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground font-inter text-sm">Carregando lições...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map(lesson => (
              <button key={lesson.id} onClick={() => selectLesson(lesson)}
                className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/30 hover:bg-primary/5 transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--gradient-hero)" }}>
                  <span className="font-montserrat font-black text-primary-foreground text-sm">{lesson.order_num}</span>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-foreground text-sm truncate">{lesson.title}</p>
                  {lesson.objective && (
                    <p className="text-muted-foreground font-inter text-[11px] truncate mt-0.5">{lesson.objective}</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ===== COURSE LIST =====
  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="font-montserrat font-black text-foreground text-lg">📋 Roteiro do Líder</h2>
        <p className="text-muted-foreground font-inter text-xs mt-1">
          Orientações completas para conduzir cada encontro presencial
        </p>
      </div>

      {loading ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground font-inter text-sm">Carregando cursos...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => (
            <button key={course.id} onClick={() => selectCourse(course)}
              className="w-full flex items-center gap-4 p-5 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/30 hover:bg-primary/5 transition-all">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--gradient-hero)" }}>
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left flex-1">
                <p className="font-montserrat font-bold text-foreground text-sm">{course.title}</p>
                <p className="text-muted-foreground font-inter text-[11px] mt-0.5">
                  Curso {course.order_num} · Toque para ver os encontros
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        {icon}
        <p className="font-montserrat font-bold text-foreground text-sm">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
