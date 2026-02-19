import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart, ChevronLeft, Save, AlertCircle, CheckCircle2, Flame, GraduationCap,
  Star, MessageSquare, Calendar, FileText, AlertTriangle, Plus, BookOpen, Eye
} from "lucide-react";
import PastoralReportPDF from "@/components/admin/PastoralReportPDF";
import JourneyLessonView from "@/components/home/JourneyLessonView";

type Assessment = {
  prayer_score: number | null; presence_score: number | null;
  struggle_score: number | null; doubt_score: number | null;
  needs_pastor: boolean; notes: string | null;
  month: number; year: number;
};

type Plan = {
  objectives: string | null; challenges: string | null;
  recommendations: string | null; next_steps: string | null;
  pastor_notes: string | null; health_status: string;
  is_priority: boolean; last_contact_at: string | null;
};

type PastoralNote = {
  id: string; note_type: string; content: string; created_at: string;
};

type Participant = {
  user_id: string; full_name: string; community: string; area: string;
  birth_date: string; phone: string; completed_count: number; completed_activity_ids: string[];
};

type Activity = { id: string; type: string; points: number; title: string; order_num: number; subtitle: string | null };

const EMOJIS = ["😔", "😐", "🙂", "😊", "🔥"];
const HEALTH_CFG = {
  saudavel: { label: "🟢 Saudável", bg: "bg-brand-green/10", text: "text-brand-green" },
  atencao:  { label: "🟡 Atenção", bg: "bg-accent/20", text: "text-accent-foreground" },
  critico:  { label: "🔴 Necessita cuidado", bg: "bg-destructive/10", text: "text-destructive" },
};
const NOTE_TYPES = [
  { value: "acompanhamento", label: "📋 Acompanhamento" },
  { value: "conversa", label: "💬 Conversa pastoral" },
  { value: "encontro_individual", label: "📅 Encontro individual" },
  { value: "observacao", label: "📝 Observação" },
];

function HealthBadge({ status }: { status: string }) {
  const cfg = HEALTH_CFG[status as keyof typeof HEALTH_CFG] ?? HEALTH_CFG.atencao;
  return <span className={`px-2.5 py-1 rounded-lg text-xs font-inter font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>;
}

function calcAge(birthDate: string) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

// ─── FULL PARTICIPANT SHEET ─────────────────────────────
type Lesson = { id: string; title: string; order_num: number; objective: string | null; topics: string[] | null; course_id: string };

function ParticipantSheet({ participant: p, activities, onBack }: {
  participant: Participant; activities: Activity[]; onBack: () => void;
}) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [plan, setPlan] = useState<Plan>({
    objectives: "", challenges: "", recommendations: "", next_steps: "",
    pastor_notes: "", health_status: "atencao", is_priority: false, last_contact_at: null,
  });
  const [notes, setNotes] = useState<PastoralNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({ note_type: "acompanhamento", content: "" });
  const [savingNote, setSavingNote] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview"|"plan"|"notes"|"jornada"|"relatorio">("overview");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const MONTH_NAMES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  useEffect(() => {
    async function load() {
      const [{ data: ass }, { data: planData }, { data: notesData }, { data: lessonsData }] = await Promise.all([
        supabase.from("spiritual_assessments").select("*").eq("user_id", p.user_id).eq("month", month).eq("year", year).maybeSingle(),
        supabase.from("discipleship_plans").select("*").eq("user_id", p.user_id).maybeSingle(),
        supabase.from("pastoral_notes").select("*").eq("user_id", p.user_id).order("created_at", { ascending: false }),
        supabase.from("lessons").select("id, title, order_num, objective, topics, course_id").order("order_num"),
      ]);
      setAssessment(ass ?? null);
      if (planData) setPlan(prev => ({ ...prev, ...planData }));
      setNotes(notesData ?? []);
      setLessons(lessonsData ?? []);
      setLoading(false);
    }
    load();
  }, [p.user_id]);

  async function handleSavePlan() {
    setSaving(true);
    await supabase.from("discipleship_plans").upsert({
      user_id: p.user_id,
      objectives: plan.objectives || null,
      challenges: plan.challenges || null,
      recommendations: plan.recommendations || null,
      next_steps: plan.next_steps || null,
      pastor_notes: plan.pastor_notes || null,
      health_status: plan.health_status,
      is_priority: plan.is_priority,
    }, { onConflict: "user_id" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSaveNote() {
    if (!noteForm.content.trim()) return;
    setSavingNote(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("pastoral_notes").insert({
      user_id: p.user_id,
      admin_id: user!.id,
      note_type: noteForm.note_type,
      content: noteForm.content,
    });
    // Update last_contact_at
    await supabase.from("discipleship_plans").upsert({
      user_id: p.user_id, last_contact_at: new Date().toISOString(), health_status: plan.health_status,
    }, { onConflict: "user_id" });
    setNoteForm({ note_type: "acompanhamento", content: "" });
    setShowNoteForm(false);
    setSavingNote(false);
    // Refresh notes
    const { data } = await supabase.from("pastoral_notes").select("*").eq("user_id", p.user_id).order("created_at", { ascending: false });
    setNotes(data ?? []);
  }

  const completedIds = new Set(p.completed_activity_ids);
  const pct = activities.length > 0 ? Math.round((p.completed_count / activities.length) * 100) : 0;
  const formacoes = activities.filter(a => a.type === "formacao");
  const devocionais = activities.filter(a => a.type === "devocional");
  const encontros = activities.filter(a => a.type === "encontro");
  const doneForm = formacoes.filter(a => completedIds.has(a.id)).length;
  const doneDev = devocionais.filter(a => completedIds.has(a.id)).length;
  const doneEnc = encontros.filter(a => completedIds.has(a.id)).length;
  const formPct = formacoes.length > 0 ? Math.round((doneForm / formacoes.length) * 100) : 0;
  const age = calcAge(p.birth_date);

  if (loading) return <div className="py-20 text-center text-muted-foreground font-inter text-sm">Carregando ficha...</div>;

  // If admin is viewing a lesson's responses
  if (selectedLesson) {
    return (
      <JourneyLessonView
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
        isAdmin={true}
        targetUserId={p.user_id}
      />
    );
  }

  const SECTIONS = [
    { id: "overview" as const, label: "Visão Geral" },
    { id: "plan" as const, label: "Plano" },
    { id: "notes" as const, label: `Notas (${notes.length})` },
    { id: "jornada" as const, label: "Jornada" },
    { id: "relatorio" as const, label: "Relatório" },
  ];

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground font-inter text-sm hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Voltar ao painel
      </button>

      {/* Profile header */}
      <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 border border-white/20">
            <span className="font-montserrat font-black text-primary-foreground text-2xl">{p.full_name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h2 className="font-montserrat font-black text-primary-foreground text-lg leading-tight">{p.full_name}</h2>
            <p className="text-primary-foreground/70 font-inter text-xs">{p.community} · {p.area}{age ? ` · ${age} anos` : ""}</p>
            <p className="text-primary-foreground/60 font-inter text-xs">📞 {p.phone}</p>
          </div>
          {/* Priority star */}
          <button onClick={() => setPlan(prev => ({ ...prev, is_priority: !prev.is_priority }))}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${plan.is_priority ? "bg-accent border-accent/50" : "bg-white/10 border-white/20"}`}
            title="Marcar como prioridade pastoral">
            <Star className={`w-4 h-4 ${plan.is_priority ? "text-accent-foreground" : "text-primary-foreground/60"}`} style={{ fill: plan.is_priority ? "hsl(var(--accent-foreground))" : "transparent" }} />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <HealthBadge status={plan.health_status} />
          {plan.is_priority && <span className="px-2.5 py-1 rounded-lg text-xs font-inter font-semibold bg-accent text-accent-foreground">⭐ Prioridade</span>}
          {assessment?.needs_pastor && <span className="px-2.5 py-1 rounded-lg text-xs font-inter font-semibold bg-white/20 text-primary-foreground">🙏 Pediu conversa</span>}
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: MessageSquare, label: "Enviar mensagem", action: () => setActiveSection("notes") },
          { icon: FileText, label: "Registrar acomp.", action: () => { setActiveSection("notes"); setShowNoteForm(true); } },
          { icon: Calendar, label: "Agendar conversa", action: () => { setNoteForm(f => ({ ...f, note_type: "encontro_individual" })); setActiveSection("notes"); setShowNoteForm(true); } },
          { icon: AlertTriangle, label: plan.health_status === "critico" ? "⚠️ Crítico" : "Marcar crítico", action: () => setPlan(prev => ({ ...prev, health_status: prev.health_status === "critico" ? "atencao" : "critico" })) },
        ].map(({ icon: Icon, label, action }) => (
          <button key={label} onClick={action}
            className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors text-left">
            <Icon className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="font-inter text-xs font-medium text-foreground">{label}</span>
          </button>
        ))}
      </div>

      {/* Section tabs - scrollable for 5 tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 overflow-x-auto">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-inter font-medium transition-all ${activeSection === s.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW SECTION */}
      {activeSection === "overview" && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <Flame className="w-4 h-4 text-secondary" />
              <p className="font-montserrat font-bold text-foreground text-sm">Saúde Espiritual</p>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: "📊 Progresso geral", done: p.completed_count, total: activities.length, color: pct >= 70 ? "var(--gradient-green)" : pct >= 34 ? "var(--gradient-orange)" : "hsl(var(--destructive))" },
                { label: "📖 Devocionais", done: doneDev, total: devocionais.length, color: "var(--gradient-green)" },
                { label: "🎓 Formação", done: doneForm, total: formacoes.length, color: "hsl(var(--secondary))" },
                { label: "📅 Encontros", done: doneEnc, total: encontros.length, color: "hsl(var(--primary))" },
              ].map(({ label, done, total, color }) => {
                const p2 = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="font-inter text-xs text-foreground">{label}</span>
                      <span className="font-inter text-xs text-muted-foreground">{done}/{total} · <strong className="text-foreground">{p2}%</strong></span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${p2}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Autoavaliação */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              <p className="font-montserrat font-bold text-foreground text-sm">Autoavaliação — {MONTH_NAMES[month-1]}/{year}</p>
            </div>
            <div className="p-4">
              {assessment ? (
                <div className="space-y-2.5">
                  {[
                    { label: "🙏 Vida de oração", score: assessment.prayer_score },
                    { label: "✨ Sente Deus perto", score: assessment.presence_score },
                    { label: "⚡ Tentações/dificuldades", score: assessment.struggle_score },
                    { label: "❓ Dúvidas na fé", score: assessment.doubt_score },
                  ].map(({ label, score }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="font-inter text-xs text-muted-foreground">{label}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={`w-4 h-1.5 rounded-full ${i <= (score ?? 0) ? "bg-primary" : "bg-muted"}`} />
                          ))}
                        </div>
                        <span className="text-base">{score ? EMOJIS[score - 1] : "—"}</span>
                      </div>
                    </div>
                  ))}
                  {assessment.needs_pastor && (
                    <div className="flex items-center gap-2 p-2.5 bg-primary/10 rounded-xl mt-1">
                      <AlertCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <p className="font-inter text-xs text-primary font-semibold">Solicitou conversa com o pastor</p>
                    </div>
                  )}
                  {assessment.notes && (
                    <p className="font-inter text-xs text-muted-foreground italic p-2.5 bg-muted rounded-xl">"{assessment.notes}"</p>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground font-inter text-sm py-2">Nenhuma avaliação este mês.</p>
              )}
            </div>
          </div>

          {/* Cursos */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-secondary" />
              <p className="font-montserrat font-bold text-foreground text-sm">Formação nos Cursos</p>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: "Curso 1 — Começando a Vida Cristã", total: 16 },
                { label: "Curso 2 — Crescimento Cristão", total: 16 },
              ].map((course, i) => {
                const courseActs = formacoes.slice(i * course.total, (i + 1) * course.total);
                const done = courseActs.filter(a => completedIds.has(a.id)).length;
                const cp = course.total > 0 ? Math.round((done / course.total) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="font-inter text-xs text-foreground">{course.label}</span>
                      <span className="font-inter text-xs text-muted-foreground">{done}/{course.total} · <strong className="text-foreground">{cp}%</strong></span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${cp}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PLAN SECTION */}
      {activeSection === "plan" && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent-foreground" />
            <p className="font-montserrat font-bold text-foreground text-sm">Plano de Discipulado</p>
          </div>
          <div className="p-4 space-y-3">
            {[
              { key: "objectives" as const, label: "🎯 Objetivos espirituais" },
              { key: "next_steps" as const, label: "➡️ Próximos passos (um por linha)" },
              { key: "challenges" as const, label: "⚡ Desafios propostos" },
              { key: "recommendations" as const, label: "🙏 Recomendações pastorais" },
              { key: "pastor_notes" as const, label: "📝 Observações privadas" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="font-inter text-xs font-medium text-foreground block mb-1">{label}</label>
                <textarea value={plan[key] ?? ""} onChange={e => setPlan(prev => ({ ...prev, [key]: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-inter text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
            ))}
            <div>
              <label className="font-inter text-xs font-medium text-foreground block mb-1.5">Status de saúde espiritual</label>
              <div className="grid grid-cols-3 gap-2">
                {(["saudavel", "atencao", "critico"] as const).map(s => {
                  const cfg = HEALTH_CFG[s];
                  return (
                    <button key={s} onClick={() => setPlan(prev => ({ ...prev, health_status: s }))}
                      className={`py-2 rounded-xl text-xs font-inter font-medium border transition-all ${plan.health_status === s ? `border-transparent ${cfg.bg} ${cfg.text}` : "border-border bg-muted text-muted-foreground"}`}>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={handleSavePlan} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-inter text-sm font-medium text-primary-foreground disabled:opacity-70 transition-all"
              style={{ background: "var(--gradient-hero)" }}>
              {saved ? <><CheckCircle2 className="w-4 h-4" /> Salvo!</> : saving ? "Salvando..." : <><Save className="w-4 h-4" /> Salvar plano</>}
            </button>
          </div>
        </div>
      )}

      {/* NOTES SECTION */}
      {activeSection === "notes" && (
        <div className="space-y-3">
          <button onClick={() => setShowNoteForm(!showNoteForm)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-inter text-sm font-medium text-primary-foreground"
            style={{ background: "var(--gradient-hero)" }}>
            <Plus className="w-4 h-4" /> Registrar acompanhamento
          </button>

          {showNoteForm && (
            <div className="bg-card rounded-2xl border border-border p-4 space-y-3 shadow-sm">
              <p className="font-montserrat font-bold text-foreground text-sm">Novo registro pastoral</p>
              <select value={noteForm.note_type} onChange={e => setNoteForm(f => ({ ...f, note_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                {NOTE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <textarea value={noteForm.content} onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Descreva o acompanhamento, observações ou próximos passos..." rows={3}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              <div className="flex gap-2">
                <button onClick={handleSaveNote} disabled={savingNote || !noteForm.content.trim()}
                  className="flex-1 py-2.5 rounded-xl font-inter text-sm font-medium text-primary-foreground disabled:opacity-50"
                  style={{ background: "var(--gradient-hero)" }}>
                  {savingNote ? "Salvando..." : "Salvar registro"}
                </button>
                <button onClick={() => setShowNoteForm(false)} className="px-4 py-2.5 rounded-xl bg-muted text-foreground font-inter text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {notes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="font-montserrat font-bold text-foreground text-sm">Nenhum registro ainda</p>
              <p className="text-muted-foreground font-inter text-xs mt-1">Registre acompanhamentos, conversas e observações pastorais.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map(note => {
                const typeInfo = NOTE_TYPES.find(t => t.value === note.note_type);
                return (
                  <div key={note.id} className="bg-card rounded-xl border border-border p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-inter text-xs font-semibold text-foreground">{typeInfo?.label ?? note.note_type}</span>
                      <span className="text-muted-foreground font-inter text-[10px] ml-auto">
                        {new Date(note.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p className="font-inter text-xs text-muted-foreground leading-relaxed">{note.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* JORNADA SECTION — view youth lesson responses */}
      {activeSection === "jornada" && (
        <div className="space-y-3">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex items-start gap-2">
            <Eye className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="font-inter text-xs text-primary leading-relaxed">
              Visualize as respostas de <strong>{p.full_name}</strong> para cada lição da Minha Jornada. Use no encontro presencial.
            </p>
          </div>
          {lessons.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground font-inter text-sm">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Nenhuma lição cadastrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map(lesson => (
                <button key={lesson.id} onClick={() => setSelectedLesson(lesson)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all text-left">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--gradient-hero)" }}>
                    <span className="font-montserrat font-black text-primary-foreground text-sm">{lesson.order_num}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm font-medium text-foreground truncate">{lesson.title}</p>
                    {lesson.objective && <p className="font-inter text-[10px] text-muted-foreground truncate mt-0.5">{lesson.objective}</p>}
                  </div>
                  <Eye className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RELATÓRIO SECTION */}
      {activeSection === "relatorio" && (
        <PastoralReportPDF participant={p} activities={activities} />
      )}
    </div>
  );
}

// ─── MAIN admin discipleship panel ─────────────────────
type Props = {
  participants: Participant[];
  activities: Activity[];
  initialParticipant?: Participant | null;
  onClearInitial?: () => void;
};

export default function AdminDiscipleshipTab({ participants, activities, initialParticipant, onClearInitial }: Props) {
  const [selected, setSelected] = useState<Participant | null>(initialParticipant ?? null);
  const [plans, setPlans] = useState<Record<string, { health_status: string; needs_pastor?: boolean; is_priority?: boolean }>>({});

  useEffect(() => {
    if (initialParticipant) { setSelected(initialParticipant); onClearInitial?.(); }
  }, [initialParticipant]);

  useEffect(() => {
    if (participants.length === 0) return;
    async function fetchPlans() {
      const ids = participants.map(p => p.user_id);
      const { data: plansData } = await supabase.from("discipleship_plans").select("user_id, health_status, is_priority").in("user_id", ids);
      const { data: assessData } = await supabase.from("spiritual_assessments").select("user_id, needs_pastor")
        .in("user_id", ids).eq("month", new Date().getMonth() + 1).eq("year", new Date().getFullYear());
      const map: Record<string, { health_status: string; needs_pastor?: boolean; is_priority?: boolean }> = {};
      (plansData ?? []).forEach(pl => { map[pl.user_id] = { health_status: pl.health_status, is_priority: pl.is_priority }; });
      (assessData ?? []).forEach(a => {
        if (!map[a.user_id]) map[a.user_id] = { health_status: "atencao" };
        map[a.user_id].needs_pastor = a.needs_pastor;
      });
      setPlans(map);
    }
    fetchPlans();
  }, [participants]);

  if (selected) {
    return <ParticipantSheet participant={selected} activities={activities} onBack={() => setSelected(null)} />;
  }

  const withPastor = participants.filter(p => plans[p.user_id]?.needs_pastor);
  const criticos = participants.filter(p => plans[p.user_id]?.health_status === "critico");
  const priorities = participants.filter(p => plans[p.user_id]?.is_priority);
  const saudaveis = participants.filter(p => plans[p.user_id]?.health_status === "saudavel");

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "🟢 Saudáveis", value: saudaveis.length, color: "text-brand-green", bg: "bg-brand-green/10" },
          { label: "🟡 Atenção", value: participants.length - saudaveis.length - criticos.length, color: "text-accent-foreground", bg: "bg-accent/20" },
          { label: "🔴 Críticos", value: criticos.length, color: "text-destructive", bg: "bg-destructive/10" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-3 text-center ${s.bg}`}>
            <p className={`font-montserrat font-black text-2xl ${s.color}`}>{s.value}</p>
            <p className={`font-inter text-[10px] ${s.color} opacity-80 mt-0.5`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(withPastor.length > 0 || priorities.length > 0) && (
        <div className="space-y-2">
          {withPastor.length > 0 && (
            <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                <p className="font-montserrat font-bold text-primary text-sm">🙏 Pediram conversa pastoral ({withPastor.length})</p>
              </div>
              <div className="space-y-1">
                {withPastor.map(p => (
                  <button key={p.user_id} onClick={() => setSelected(p)}
                    className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-xl hover:bg-primary/10 transition-colors">
                    <span className="font-inter text-sm text-foreground">{p.full_name}</span>
                    <span className="text-muted-foreground font-inter text-xs ml-auto">— {p.community} →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {priorities.length > 0 && (
            <div className="bg-accent/10 rounded-2xl p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-accent-foreground" />
                <p className="font-montserrat font-bold text-accent-foreground text-sm">⭐ Prioridade pastoral ({priorities.length})</p>
              </div>
              <div className="space-y-1">
                {priorities.map(p => (
                  <button key={p.user_id} onClick={() => setSelected(p)}
                    className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-xl hover:bg-accent/10 transition-colors">
                    <span className="font-inter text-sm text-foreground">{p.full_name}</span>
                    <span className="text-muted-foreground font-inter text-xs ml-auto">— {p.community} →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full list */}
      <p className="font-montserrat font-bold text-foreground text-sm">Todos os participantes</p>
      <div className="space-y-2">
        {participants.map(p => {
          const planInfo = plans[p.user_id];
          const status = planInfo?.health_status ?? "atencao";
          const pct = activities.length > 0 ? Math.round((p.completed_count / activities.length) * 100) : 0;
          return (
            <button key={p.user_id} onClick={() => setSelected(p)}
              className="w-full text-left bg-card rounded-2xl border border-border p-3 flex items-center gap-3 hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="font-montserrat font-black text-primary text-base">{p.full_name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-montserrat font-bold text-foreground text-sm truncate">{p.full_name}</p>
                  {planInfo?.is_priority && <Star className="w-3 h-3 text-accent flex-shrink-0" style={{ fill: "hsl(var(--accent))" }} />}
                </div>
                <p className="text-muted-foreground font-inter text-xs">{p.community} · {pct}%</p>
              </div>
              <HealthBadge status={status} />
              <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
