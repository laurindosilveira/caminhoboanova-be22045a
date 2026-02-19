import { BookOpen, GraduationCap, CalendarDays, Zap, Users, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

type Activity = { id: string; type: string; title: string; points: number; order_num: number; subtitle: string | null };
type Participant = {
  user_id: string; full_name: string; community: string; area: string;
  birth_date: string; phone: string; completed_count: number; completed_activity_ids: string[];
};

type Props = { participants: Participant[]; activities: Activity[] };

const COMMUNITY_COLORS: Record<string, string> = {
  "Rincão Frente": "bg-primary/10 text-primary",
  "Rincão Fundo": "bg-secondary/10 text-secondary",
  "Bom Pastor": "bg-brand-green/10 text-brand-green",
  "Iriá Pira 1": "bg-accent/20 text-accent-foreground",
  "Martim Lutero": "bg-primary/10 text-primary",
  "Linha Brasil": "bg-secondary/10 text-secondary",
  "Iriá Pira 2": "bg-brand-green/10 text-brand-green",
};

export default function OverviewTab({ participants, activities }: Props) {
  const total = participants.length;
  const avancados = participants.filter(p => activities.length > 0 && p.completed_count / activities.length >= 0.7).length;
  const semAtividade = participants.filter(p => p.completed_count === 0).length;
  const emAndamento = participants.filter(p => {
    const pct = activities.length > 0 ? p.completed_count / activities.length : 0;
    return pct > 0 && pct < 0.7;
  }).length;

  const byType = (type: string) => activities.filter(a => a.type === type).length;
  const completedByType = (type: string) => {
    const ids = new Set(activities.filter(a => a.type === type).map(a => a.id));
    return participants.reduce((sum, p) => sum + p.completed_activity_ids.filter(id => ids.has(id)).length, 0);
  };

  // Community breakdown
  const communities = [...new Set(participants.map(p => p.community))];
  const byComm = communities.map(c => {
    const group = participants.filter(p => p.community === c);
    const avgPct = group.length > 0 && activities.length > 0
      ? Math.round(group.reduce((s, p) => s + (p.completed_count / activities.length) * 100, 0) / group.length)
      : 0;
    return { name: c, count: group.length, avgPct };
  }).sort((a, b) => b.avgPct - a.avgPct);

  return (
    <div className="space-y-4 pb-4">
      {/* Status cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Em andamento", value: emAndamento, Icon: TrendingUp, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Avançados (≥70%)", value: avancados, Icon: CheckCircle2, color: "text-brand-green", bg: "bg-brand-green/10" },
          { label: "Sem atividade", value: semAtividade, Icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Total participantes", value: total, Icon: Users, color: "text-primary", bg: "bg-primary/10" },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className={`font-montserrat font-black text-2xl leading-none ${color}`}>{value}</p>
              <p className="text-muted-foreground font-inter text-xs mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity type breakdown */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <p className="font-montserrat font-bold text-foreground text-sm mb-3">Atividades por tipo</p>
        <div className="space-y-3">
          {[
            { type: "devocional", label: "Devocionais", icon: BookOpen, color: "text-brand-green" },
            { type: "formacao", label: "Formações", icon: GraduationCap, color: "text-secondary" },
            { type: "encontro", label: "Encontros", icon: CalendarDays, color: "text-primary" },
            { type: "desafio", label: "Desafios", icon: Zap, color: "text-accent-foreground" },
          ].map(({ type, label, icon: Icon, color }) => {
            const total = byType(type);
            const done = completedByType(type);
            const pct = total * participants.length > 0 ? Math.round((done / (total * participants.length)) * 100) : 0;
            return (
              <div key={type} className="flex items-center gap-3">
                <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-inter text-xs text-foreground">{label}</span>
                    <span className="font-inter text-xs text-muted-foreground">{total} atividades · {pct}% concluído</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community breakdown */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <p className="font-montserrat font-bold text-foreground text-sm mb-3">Progresso por comunidade</p>
        <div className="space-y-2.5">
          {byComm.map(c => (
            <div key={c.name} className="flex items-center gap-3">
              <div className={`px-2 py-0.5 rounded-lg text-[10px] font-inter font-medium w-28 text-center flex-shrink-0 ${COMMUNITY_COLORS[c.name] ?? "bg-muted text-foreground"}`}>
                {c.name}
              </div>
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${c.avgPct}%`,
                      background: c.avgPct >= 70 ? "var(--gradient-green)" : c.avgPct >= 34 ? "var(--gradient-orange)" : "hsl(var(--destructive))",
                    }}
                  />
                </div>
              </div>
              <span className="font-montserrat font-bold text-xs text-foreground w-8 text-right">{c.avgPct}%</span>
              <span className="text-muted-foreground font-inter text-[10px] w-12 text-right">{c.count} pessoas</span>
            </div>
          ))}
          {byComm.length === 0 && <p className="text-muted-foreground font-inter text-sm text-center py-4">Nenhum dado disponível.</p>}
        </div>
      </div>
    </div>
  );
}
