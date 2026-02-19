import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart, ChevronLeft, Save, AlertCircle, CheckCircle2, Flame, GraduationCap
} from "lucide-react";

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
};

type Participant = {
  user_id: string; full_name: string; community: string; area: string;
  birth_date: string; phone: string; completed_count: number; completed_activity_ids: string[];
};

type Activity = { id: string; type: string; points: number };

const EMOJIS = ["😔", "😐", "🙂", "😊", "🔥"];
const HEALTH_CFG = {
  saudavel: { label: "🟢 Saudável", bg: "bg-brand-green/10", text: "text-brand-green" },
  atencao:  { label: "🟡 Atenção", bg: "bg-accent/20", text: "text-accent-foreground" },
  critico:  { label: "🔴 Necessita acompanhamento", bg: "bg-destructive/10", text: "text-destructive" },
};

function HealthBadge({ status }: { status: string }) {
  const cfg = HEALTH_CFG[status as keyof typeof HEALTH_CFG] ?? HEALTH_CFG.atencao;
  return <span className={`px-2.5 py-1 rounded-lg text-xs font-inter font-semibold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>;
}

// ─── Individual discipleship sheet ─────────────────────
function ParticipantSheet({ participant: p, activities, onBack }: {
  participant: Participant; activities: Activity[]; onBack: () => void;
}) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [plan, setPlan] = useState<Plan>({ objectives: "", challenges: "", recommendations: "", next_steps: "", pastor_notes: "", health_status: "atencao" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const MONTH_NAMES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  useEffect(() => {
    async function load() {
      const [{ data: ass }, { data: planData }] = await Promise.all([
        supabase.from("spiritual_assessments").select("*").eq("user_id", p.user_id).eq("month", month).eq("year", year).maybeSingle(),
        supabase.from("discipleship_plans").select("*").eq("user_id", p.user_id).maybeSingle(),
      ]);
      setAssessment(ass ?? null);
      if (planData) setPlan({ ...plan, ...planData });
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
    }, { onConflict: "user_id" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const completedIds = new Set(p.completed_activity_ids);
  const pct = activities.length > 0 ? Math.round((p.completed_count / activities.length) * 100) : 0;
  const formacoes = activities.filter(a => a.type === "formacao");
  const doneForm = formacoes.filter(a => completedIds.has(a.id)).length;
  const formPct = formacoes.length > 0 ? Math.round((doneForm / formacoes.length) * 100) : 0;

  if (loading) return <div className="py-20 text-center text-muted-foreground font-inter text-sm">Carregando ficha...</div>;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground font-inter text-sm hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Voltar ao painel
      </button>

      {/* Header */}
      <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="font-montserrat font-black text-primary text-2xl">{p.full_name.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <h2 className="font-montserrat font-black text-foreground text-lg leading-tight">{p.full_name}</h2>
          <p className="text-muted-foreground font-inter text-xs">{p.community} · {p.area}</p>
          <div className="mt-1.5"><HealthBadge status={plan.health_status} /></div>
        </div>
      </div>

      {/* Autoavaliação */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          <p className="font-montserrat font-bold text-foreground text-sm">Autoavaliação — {MONTH_NAMES[(month)-1]}/{year}</p>
        </div>
        <div className="p-4">
          {assessment ? (
            <div className="space-y-2">
              {[
                { label: "Vida de oração", score: assessment.prayer_score },
                { label: "Sente Deus perto", score: assessment.presence_score },
                { label: "Tentações/dificuldades", score: assessment.struggle_score },
                { label: "Dúvidas na fé", score: assessment.doubt_score },
              ].map(({ label, score }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="font-inter text-xs text-muted-foreground">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{score ? EMOJIS[score - 1] : "—"}</span>
                    <span className="font-inter text-xs text-foreground">{score ?? "—"}/5</span>
                  </div>
                </div>
              ))}
              {assessment.needs_pastor && (
                <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-xl mt-2">
                  <AlertCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="font-inter text-xs text-primary font-semibold">Solicitou conversa com o pastor</p>
                </div>
              )}
              {assessment.notes && (
                <p className="font-inter text-xs text-muted-foreground italic mt-2 p-2 bg-muted rounded-xl">"{assessment.notes}"</p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground font-inter text-sm py-2">Nenhuma avaliação este mês.</p>
          )}
        </div>
      </div>

      {/* Progress snapshot */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <Flame className="w-4 h-4 text-secondary" />
          <p className="font-montserrat font-bold text-foreground text-sm">Progresso</p>
        </div>
        <div className="p-4 space-y-2">
          <div>
            <div className="flex justify-between mb-1"><span className="font-inter text-xs text-muted-foreground">Atividades totais</span><span className="font-montserrat font-bold text-xs text-foreground">{pct}%</span></div>
            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 70 ? "var(--gradient-green)" : pct >= 34 ? "var(--gradient-orange)" : "hsl(var(--destructive))" }} /></div>
          </div>
          <div>
            <div className="flex justify-between mb-1"><span className="font-inter text-xs text-muted-foreground">Formação ({doneForm}/{formacoes.length} lições)</span><span className="font-montserrat font-bold text-xs text-foreground">{formPct}%</span></div>
            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{ width: `${formPct}%` }} /></div>
          </div>
        </div>
      </div>

      {/* Plano de discipulado — editável pelo admin */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-accent-foreground" />
          <p className="font-montserrat font-bold text-foreground text-sm">Plano de Discipulado</p>
        </div>
        <div className="p-4 space-y-3">
          {[
            { key: "objectives" as const, label: "🎯 Objetivos espirituais" },
            { key: "next_steps" as const, label: "➡️ Próximos passos (um por linha)" },
            { key: "challenges" as const, label: "⚡ Desafios propostos" },
            { key: "recommendations" as const, label: "🙏 Recomendações pastorais" },
            { key: "pastor_notes" as const, label: "📝 Observações pastorais (privado)" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="font-inter text-xs font-medium text-foreground block mb-1">{label}</label>
              <textarea
                value={plan[key] ?? ""}
                onChange={e => setPlan(prev => ({ ...prev, [key]: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-inter text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          ))}

          <div>
            <label className="font-inter text-xs font-medium text-foreground block mb-1.5">Status de saúde espiritual</label>
            <div className="grid grid-cols-3 gap-2">
              {(["saudavel", "atencao", "critico"] as const).map(s => {
                const cfg = HEALTH_CFG[s];
                return (
                  <button key={s} onClick={() => setPlan(prev => ({ ...prev, health_status: s }))}
                    className={`py-2 rounded-xl text-xs font-inter font-medium border transition-all ${
                      plan.health_status === s ? `border-transparent ${cfg.bg} ${cfg.text}` : "border-border bg-muted text-muted-foreground"
                    }`}>
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
    </div>
  );
}

// ─── MAIN admin discipleship panel ─────────────────────
type Props = { participants: Participant[]; activities: Activity[] };

export default function AdminDiscipleshipTab({ participants, activities }: Props) {
  const [selected, setSelected] = useState<Participant | null>(null);
  const [plans, setPlans] = useState<Record<string, { health_status: string; needs_pastor?: boolean }>>({});

  useEffect(() => {
    if (participants.length === 0) return;
    async function fetchPlans() {
      const ids = participants.map(p => p.user_id);
      const { data: plansData } = await supabase.from("discipleship_plans").select("user_id, health_status").in("user_id", ids);
      const { data: assessData } = await supabase.from("spiritual_assessments").select("user_id, needs_pastor")
        .in("user_id", ids).eq("month", new Date().getMonth() + 1).eq("year", new Date().getFullYear());
      const map: Record<string, { health_status: string; needs_pastor?: boolean }> = {};
      (plansData ?? []).forEach(pl => { map[pl.user_id] = { health_status: pl.health_status }; });
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
  const saudaveis = participants.filter(p => plans[p.user_id]?.health_status === "saudavel");

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Saudáveis", value: saudaveis.length, color: "text-brand-green", bg: "bg-brand-green/10" },
          { label: "Atenção", value: participants.length - saudaveis.length - criticos.length, color: "text-accent-foreground", bg: "bg-accent/20" },
          { label: "Críticos", value: criticos.length, color: "text-destructive", bg: "bg-destructive/10" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-3 text-center ${s.bg}`}>
            <p className={`font-montserrat font-black text-2xl ${s.color}`}>{s.value}</p>
            <p className={`font-inter text-xs ${s.color} opacity-80 mt-0.5`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alerts: needs pastor */}
      {withPastor.length > 0 && (
        <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            <p className="font-montserrat font-bold text-primary text-sm">Solicitaram conversa pastoral</p>
          </div>
          <div className="space-y-1">
            {withPastor.map(p => (
              <button key={p.user_id} onClick={() => setSelected(p)}
                className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-xl hover:bg-primary/10 transition-colors">
                <span className="font-inter text-sm text-foreground">{p.full_name}</span>
                <span className="text-muted-foreground font-inter text-xs">— {p.community}</span>
                <ChevronLeft className="w-3.5 h-3.5 text-primary ml-auto rotate-180" />
              </button>
            ))}
          </div>
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
                <p className="font-montserrat font-bold text-foreground text-sm truncate">{p.full_name}</p>
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
