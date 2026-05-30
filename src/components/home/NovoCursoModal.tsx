import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, BookOpen, Plus, ChevronRight, Globe, Building2 } from "lucide-react";

type Props = {
  churchId: string | null;
  onClose: () => void;
  onCreated: () => void;
};

type GlobalCourse = {
  id: string;
  title: string;
  subtitle: string | null;
  order_num: number;
};

type Church = {
  id: string;
  name: string;
};

type Step = "choose" | "platform" | "custom" | "scope" | "church-select";
type CourseScope = "global" | "church" | null;

export default function NovoCursoModal({ churchId, onClose, onCreated }: Props) {
  const isGlobalAdmin = !churchId;
  const [step, setStep] = useState<Step>(isGlobalAdmin ? "scope" : "choose");
  const [courseScope, setCourseScope] = useState<CourseScope>(null);
  const [globalCourses, setGlobalCourses] = useState<GlobalCourse[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [churches, setChurches] = useState<Church[]>([]);
  const [loadingChurches, setLoadingChurches] = useState(false);
  const [targetChurchId, setTargetChurchId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadGlobalCourses() {
    setLoadingGlobal(true);
    const [{ data: globalData }, { data: churchData }] = await Promise.all([
      supabase.from("courses").select("id, title, subtitle, order_num").is("church_id", null).order("order_num"),
      churchId
        ? supabase.from("courses").select("title").eq("church_id", churchId)
        : Promise.resolve({ data: [] }),
    ]);
    const churchTitles = new Set((churchData ?? []).map((c: any) => c.title));
    setGlobalCourses((globalData ?? []).filter((c: any) => !churchTitles.has(c.title)));
    setLoadingGlobal(false);
  }

  async function loadChurches() {
    setLoadingChurches(true);
    const { data } = await supabase.from("churches").select("id, name").order("name");
    setChurches((data ?? []) as Church[]);
    setLoadingChurches(false);
  }

  async function getNextOrderNum(effectiveId: string | null): Promise<number> {
    const query = effectiveId
      ? supabase.from("courses").select("order_num").eq("church_id", effectiveId)
      : supabase.from("courses").select("order_num").is("church_id", null);
    const { data } = await query.order("order_num", { ascending: false }).limit(1);
    return data && data.length > 0 ? ((data[0] as any).order_num ?? 0) + 1 : 1;
  }

  async function handleSelectGlobal(course: GlobalCourse) {
    if (!churchId) return;
    setSaving(true);
    setError(null);
    const orderNum = await getNextOrderNum(churchId);
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
    if (isGlobalAdmin && courseScope === "church" && !targetChurchId) {
      setError("Selecione uma igreja."); return;
    }
    setSaving(true);
    setError(null);
    const effectiveChurchId = isGlobalAdmin
      ? (courseScope === "church" ? targetChurchId : null)
      : (churchId ?? null);
    const orderNum = await getNextOrderNum(effectiveChurchId);
    const { error: err } = await supabase.from("courses").insert({
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      order_num: orderNum,
      church_id: effectiveChurchId,
    });
    if (err) { setError(err.message); setSaving(false); return; }
    onCreated();
  }

  const selectedChurchName = courseScope === "church"
    ? (churches.find(c => c.id === targetChurchId)?.name ?? "Igreja")
    : null;

  const stepTitle = isGlobalAdmin
    ? step === "scope" ? "Tipo de Curso"
    : step === "church-select" ? "Selecionar Igreja"
    : courseScope === "church" ? `Curso para ${selectedChurchName}`
    : "Criar Curso Global"
    : step === "choose" ? "Novo Curso"
    : step === "platform" ? "Cursos da Plataforma"
    : "Criar Curso Personalizado";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-background w-full max-w-lg rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-montserrat font-black text-foreground text-lg">{stepTitle}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Super admin: choose global or specific church */}
        {isGlobalAdmin && step === "scope" && (
          <div className="space-y-3">
            <p className="text-muted-foreground font-inter text-sm mb-4">Onde este curso ficará disponível?</p>
            <button
              onClick={() => { setCourseScope("global"); setStep("custom"); }}
              className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-2xl text-left hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-montserrat font-bold text-foreground text-sm">Curso Global</p>
                <p className="font-inter text-xs text-muted-foreground">Disponível para todas as igrejas da plataforma</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => { setCourseScope("church"); loadChurches(); setStep("church-select"); }}
              className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-2xl text-left hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-montserrat font-bold text-foreground text-sm">Para uma Igreja Específica</p>
                <p className="font-inter text-xs text-muted-foreground">Visível apenas para a igreja selecionada</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Super admin: select a specific church */}
        {isGlobalAdmin && step === "church-select" && (
          <div>
            {loadingChurches ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
              </div>
            ) : churches.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-montserrat font-bold text-foreground text-sm">Nenhuma igreja cadastrada</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {churches.map(church => (
                  <button
                    key={church.id}
                    onClick={() => { setTargetChurchId(church.id); setStep("custom"); }}
                    className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl text-left hover:border-primary/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="font-inter text-sm font-medium text-foreground flex-1">{church.name}</p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setStep("scope")} className="mt-4 text-muted-foreground font-inter text-xs underline">
              ← Voltar
            </button>
          </div>
        )}

        {/* Regular admin: choose between platform courses or custom */}
        {step === "choose" && !isGlobalAdmin && (
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
            {isGlobalAdmin && courseScope === "global" && (
              <p className="text-muted-foreground font-inter text-xs flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Este curso ficará disponível para todas as igrejas da plataforma.
              </p>
            )}
            {isGlobalAdmin && courseScope === "church" && selectedChurchName && (
              <p className="text-muted-foreground font-inter text-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Este curso ficará disponível apenas para {selectedChurchName}.
              </p>
            )}
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
              {saving ? "Criando..."
                : (isGlobalAdmin && courseScope === "church") ? `Criar Curso para ${selectedChurchName ?? "Igreja"}`
                : isGlobalAdmin ? "Criar Curso Global"
                : "Criar Curso"}
            </button>
            <button
              onClick={() => {
                if (isGlobalAdmin) {
                  courseScope === "church" ? setStep("church-select") : setStep("scope");
                } else {
                  setStep("choose");
                }
              }}
              className="w-full text-center text-muted-foreground font-inter text-xs underline"
            >
              ← Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
