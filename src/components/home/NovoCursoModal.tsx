import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, BookOpen, Plus, ChevronRight } from "lucide-react";

type Props = {
  churchId: string;
  onClose: () => void;
  onCreated: () => void;
};

type GlobalCourse = {
  id: string;
  title: string;
  subtitle: string | null;
  order_num: number;
};

type Step = "choose" | "platform" | "custom";

export default function NovoCursoModal({ churchId, onClose, onCreated }: Props) {
  const [step, setStep] = useState<Step>("choose");
  const [globalCourses, setGlobalCourses] = useState<GlobalCourse[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadGlobalCourses() {
    setLoadingGlobal(true);
    const [{ data: globalData }, { data: churchData }] = await Promise.all([
      supabase.from("courses").select("id, title, subtitle, order_num").is("church_id", null).order("order_num"),
      supabase.from("courses").select("title").eq("church_id", churchId),
    ]);
    const churchTitles = new Set((churchData ?? []).map((c: any) => c.title));
    setGlobalCourses((globalData ?? []).filter((c: any) => !churchTitles.has(c.title)));
    setLoadingGlobal(false);
  }

  async function getNextOrderNum(): Promise<number> {
    const { data } = await supabase
      .from("courses")
      .select("order_num")
      .eq("church_id", churchId)
      .order("order_num", { ascending: false })
      .limit(1);
    return data && data.length > 0 ? ((data[0] as any).order_num ?? 0) + 1 : 1;
  }

  async function handleSelectGlobal(course: GlobalCourse) {
    setSaving(true);
    setError(null);
    const orderNum = await getNextOrderNum();
    const { error: err } = await supabase.from("courses").insert({
      title: course.title,
      subtitle: course.subtitle,
      order_num: orderNum,
      church_id: churchId,
    });
    if (err) { setError(err.message); setSaving(false); return; }
    onCreated();
  }

  async function handleCreateCustom() {
    if (!title.trim()) { setError("Informe o nome do curso."); return; }
    setSaving(true);
    setError(null);
    const orderNum = await getNextOrderNum();
    const { error: err } = await supabase.from("courses").insert({
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      order_num: orderNum,
      church_id: churchId,
    });
    if (err) { setError(err.message); setSaving(false); return; }
    onCreated();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-background w-full max-w-lg rounded-t-3xl p-6 pb-10 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-montserrat font-black text-foreground text-lg">
            {step === "choose" ? "Novo Curso" : step === "platform" ? "Cursos da Plataforma" : "Criar Curso Personalizado"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {step === "choose" && (
          <div className="space-y-3">
            <p className="text-muted-foreground font-inter text-sm mb-4">Como deseja adicionar um novo curso?</p>
            <button
              onClick={() => { setStep("platform"); loadGlobalCourses(); }}
              className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-2xl text-left hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-montserrat font-bold text-foreground text-sm">Cursos da plataforma</p>
                <p className="font-inter text-xs text-muted-foreground">Adicionar cursos globais já disponíveis</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setStep("custom")}
              className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-2xl text-left hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-montserrat font-bold text-foreground text-sm">Criar curso personalizado</p>
                <p className="font-inter text-xs text-muted-foreground">Criar um novo curso para sua igreja</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {step === "platform" && (
          <div>
            {loadingGlobal ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
              </div>
            ) : globalCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-montserrat font-bold text-foreground text-sm">Nenhum curso disponível</p>
                <p className="text-muted-foreground font-inter text-xs mt-1">Todos os cursos da plataforma já foram adicionados.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {globalCourses.map(course => (
                  <button
                    key={course.id}
                    disabled={saving}
                    onClick={() => handleSelectGlobal(course)}
                    className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl text-left hover:border-primary/50 transition-colors disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="font-montserrat font-bold text-muted-foreground text-xs">#{course.order_num}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-medium text-foreground">{course.title}</p>
                      {course.subtitle && <p className="font-inter text-xs text-muted-foreground truncate">{course.subtitle}</p>}
                    </div>
                    <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
            {error && <p className="text-destructive font-inter text-xs mt-3">{error}</p>}
            <button onClick={() => setStep("choose")} className="mt-4 text-muted-foreground font-inter text-xs underline">
              ← Voltar
            </button>
          </div>
        )}

        {step === "custom" && (
          <div className="space-y-4">
            <div>
              <label className="block font-inter text-sm font-medium text-foreground mb-1.5">Nome do curso *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Fundamentos da Fé"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card font-inter text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-inter text-sm font-medium text-foreground mb-1.5">Subtítulo (opcional)</label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="Ex: Curso introdutório para novos membros"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card font-inter text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
            {error && <p className="text-destructive font-inter text-xs">{error}</p>}
            <button
              onClick={handleCreateCustom}
              disabled={saving}
              className="w-full py-3.5 rounded-2xl font-montserrat font-bold text-primary-foreground text-sm disabled:opacity-50"
              style={{ background: "var(--gradient-hero)" }}
            >
              {saving ? "Criando..." : "Criar Curso"}
            </button>
            <button onClick={() => setStep("choose")} className="w-full text-center text-muted-foreground font-inter text-xs underline">
              ← Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
