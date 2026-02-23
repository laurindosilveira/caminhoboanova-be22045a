import { useState, useEffect } from "react";
import {
  BookOpen, GraduationCap, CalendarDays, Zap, Users,
  AlertTriangle, CheckCircle2, Flame, Heart, Star, ChevronRight, Trophy, Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Activity = { id: string; type: string; title: string; points: number; order_num: number; subtitle: string | null };
type CourseInfo = { id: string; title: string; order_num: number };
type RankingSeason = { id: string; course_id: string; community: string; closed_at: string; winners: any[]; total_participants: number };
type Participant = {
  user_id: string; full_name: string; community: string; area: string;
  birth_date: string; phone: string; completed_count: number; completed_activity_ids: string[];
};
type PlanInfo = { health_status: string; is_priority: boolean; needs_pastor?: boolean };

const COMMUNITY_COLORS: Record<string, string> = {
  "Rincão Frente": "bg-primary/10 text-primary",
  "Rincão Fundo": "bg-secondary/10 text-secondary",
  "Bom Pastor": "bg-brand-green/10 text-brand-green",
  "Iriá Pira 1": "bg-accent/20 text-accent-foreground",
  "Martim Lutero": "bg-primary/10 text-primary",
  "Linha Brasil": "bg-secondary/10 text-secondary",
  "Iriá Pira 2": "bg-brand-green/10 text-brand-green",
};

const HEALTH_CFG = {
  saudavel: { label: "🟢 Saudável", color: "text-brand-green", bg: "bg-brand-green/10", dot: "bg-brand-green" },
  atencao:  { label: "🟡 Atenção", color: "text-accent-foreground", bg: "bg-accent/20", dot: "bg-accent" },
  critico:  { label: "🔴 Cuidado", color: "text-destructive", bg: "bg-destructive/10", dot: "bg-destructive" },
};

type Props = {
  participants: Participant[];
  activities: Activity[];
  plans: Record<string, PlanInfo>;
  onSelectParticipant: (p: Participant) => void;
};

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden flex-1">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

type WeeklyDevStat = { user_id: string; full_name: string; community: string; count: number };
type RankingEntry = { user_id: string; full_name: string; completed_count: number; faith_points: number };
type CommunityRanking = { community: string; ranking: RankingEntry[] };

export default function OverviewTab({ participants, activities, plans, onSelectParticipant }: Props) {
  const { profile } = useAuth();
  const [communityFilter, setCommunityFilter] = useState("todas");
  const [weeklyDevStats, setWeeklyDevStats] = useState<WeeklyDevStat[]>([]);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [seasons, setSeasons] = useState<RankingSeason[]>([]);
  const [closingSeason, setClosingSeason] = useState(false);
  const [areaRankings, setAreaRankings] = useState<CommunityRanking[]>([]);
  const [rankingCommunityFilter, setRankingCommunityFilter] = useState("todas");

  useEffect(() => {
    async function fetchWeeklyDevotionals() {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const since = sevenDaysAgo.toISOString();

      const { data: progress } = await supabase
        .from("devotional_progress")
        .select("user_id, completed_at")
        .gte("completed_at", since);

      if (!progress || progress.length === 0) {
        setWeeklyDevStats([]);
        setWeeklyTotal(0);
        return;
      }

      // Count per user
      const countMap: Record<string, number> = {};
      progress.forEach(p => {
        countMap[p.user_id] = (countMap[p.user_id] || 0) + 1;
      });

      // Map to participant info
      const stats: WeeklyDevStat[] = [];
      participants.forEach(part => {
        if (countMap[part.user_id]) {
          stats.push({
            user_id: part.user_id,
            full_name: part.full_name,
            community: part.community,
            count: countMap[part.user_id],
          });
        }
      });
      stats.sort((a, b) => b.count - a.count);

      setWeeklyDevStats(stats);
      setWeeklyTotal(progress.length);
    }
    if (participants.length > 0) fetchWeeklyDevotionals();
  }, [participants]);

  // Fetch courses and existing seasons
  useEffect(() => {
    async function fetchSeasons() {
      const [{ data: coursesData }, { data: seasonsData }] = await Promise.all([
        supabase.from("courses").select("id, title, order_num").order("order_num"),
        supabase.from("ranking_seasons").select("*"),
      ]);
      setCourses((coursesData ?? []) as CourseInfo[]);
      setSeasons((seasonsData ?? []) as unknown as RankingSeason[]);
    }
    fetchSeasons();
  }, []);

  // Fetch rankings for all communities in the area
  useEffect(() => {
    async function fetchAreaRankings() {
      const comms = [...new Set(participants.map(p => p.community))];
      if (comms.length === 0) return;
      const results: CommunityRanking[] = [];
      for (const comm of comms) {
        const { data } = await supabase.rpc("get_community_ranking", { _community: comm as any });
        if (data && data.length > 0) {
          results.push({ community: comm, ranking: data as RankingEntry[] });
        }
      }
      setAreaRankings(results);
    }
    if (participants.length > 0) fetchAreaRankings();
  }, [participants]);

  async function handleCloseSeason(courseId: string) {
    if (!profile?.community) return;
    const community = profile.community as string;

    // Check if already closed
    if (seasons.some(s => s.course_id === courseId && s.community === community)) {
      toast.info("Esta temporada já foi encerrada para sua comunidade.");
      return;
    }

    setClosingSeason(true);

    // Fetch ranking for this community
    const { data: rankingData } = await supabase.rpc("get_community_ranking", {
      _community: profile.community as any,
    });

    const ranking = (rankingData ?? []) as { user_id: string; full_name: string; faith_points: number }[];

    const winners = ranking.slice(0, 3).map((r, i) => ({
      position: i + 1,
      user_id: r.user_id,
      full_name: r.full_name,
      faith_points: Number(r.faith_points),
      medal: i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉",
    }));

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("ranking_seasons").insert({
      course_id: courseId,
      community,
      closed_by: user!.id,
      winners,
      total_participants: ranking.length,
    });

    if (error) {
      toast.error("Erro ao encerrar temporada: " + error.message);
    } else {
      toast.success("🏆 Temporada encerrada! Vencedores registrados.", { duration: 4000 });
      // Refresh seasons
      const { data: seasonsData } = await supabase.from("ranking_seasons").select("*");
      setSeasons((seasonsData ?? []) as unknown as RankingSeason[]);
    }
    setClosingSeason(false);
  }

  const total = participants.length;
  const ativos = participants.filter(p => p.completed_count > 0).length;
  const saudaveis = participants.filter(p => plans[p.user_id]?.health_status === "saudavel").length;
  const criticos = participants.filter(p => plans[p.user_id]?.health_status === "critico").length;
  const priorities = participants.filter(p => plans[p.user_id]?.is_priority).length;
  const needsPastor = participants.filter(p => plans[p.user_id]?.needs_pastor).length;
  const mediaProgresso = total > 0
    ? Math.round(participants.reduce((s, p) => s + (activities.length > 0 ? (p.completed_count / activities.length) * 100 : 0), 0) / total)
    : 0;

  // Type breakdown
  const byType = (type: string) => activities.filter(a => a.type === type).length;
  const completedByType = (type: string) => {
    const ids = new Set(activities.filter(a => a.type === type).map(a => a.id));
    return participants.reduce((sum, p) => sum + p.completed_activity_ids.filter(id => ids.has(id)).length, 0);
  };

  const communities = [...new Set(participants.map(p => p.community))];
  const byComm = communities.map(c => {
    const group = participants.filter(p => p.community === c);
    const avgPct = group.length > 0 && activities.length > 0
      ? Math.round(group.reduce((s, p) => s + (p.completed_count / activities.length) * 100, 0) / group.length)
      : 0;
    const cSaudaveis = group.filter(p => plans[p.user_id]?.health_status === "saudavel").length;
    const cCriticos = group.filter(p => plans[p.user_id]?.health_status === "critico").length;
    return { name: c, count: group.length, avgPct, saudaveis: cSaudaveis, criticos: cCriticos };
  }).sort((a, b) => b.avgPct - a.avgPct);

  // Filtered participants for quick list
  const alertParticipants = participants.filter(p =>
    plans[p.user_id]?.health_status === "critico" || plans[p.user_id]?.is_priority || plans[p.user_id]?.needs_pastor
  );

  const filteredParticipants = communityFilter === "todas"
    ? participants
    : participants.filter(p => p.community === communityFilter);

  return (
    <div className="space-y-4 pb-4">

      {/* ── HERO ESPIRITUAL ─── */}
      <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <p className="text-primary-foreground/60 font-inter text-xs mb-1">✝️ Situação Espiritual da Turma</p>
        <h2 className="font-montserrat font-black text-primary-foreground text-xl mb-3">Painel do Pastor</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Jovens ativos", value: ativos, icon: "🔥" },
            { label: "Saudáveis", value: saudaveis, icon: "🟢" },
            { label: "Precisam cuidado", value: criticos, icon: "🔴" },
          ].map(s => (
            <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl p-2.5 text-center">
              <span className="text-lg">{s.icon}</span>
              <p className="font-montserrat font-black text-primary-foreground text-xl leading-none mt-0.5">{s.value}</p>
              <p className="text-primary-foreground/50 text-[9px] font-inter mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── ALERTAS PASTORAIS ─── */}
      {(priorities > 0 || needsPastor > 0 || criticos > 0) && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <p className="font-montserrat font-bold text-destructive text-sm">Alertas Pastorais</p>
          </div>
          <div className="space-y-1.5">
            {alertParticipants.map(p => {
              const info = plans[p.user_id];
              const pct = activities.length > 0 ? Math.round((p.completed_count / activities.length) * 100) : 0;
              return (
                <button key={p.user_id} onClick={() => onSelectParticipant(p)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-destructive/10 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-montserrat font-black text-primary text-sm">{p.full_name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm font-medium text-foreground truncate">{p.full_name}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {info?.is_priority && <span className="text-[10px] font-inter text-secondary font-bold">⭐ Prioridade</span>}
                      {info?.needs_pastor && <span className="text-[10px] font-inter text-primary font-bold">🙏 Pediu conversa</span>}
                      {info?.health_status === "critico" && <span className="text-[10px] font-inter text-destructive font-bold">🔴 Crítico</span>}
                      <span className="text-[10px] font-inter text-muted-foreground">· {pct}%</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── INDICADORES ─── */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Total confirmandos", value: total, Icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Progresso médio", value: `${mediaProgresso}%`, Icon: Star, color: "text-accent-foreground", bg: "bg-accent/20" },
          { label: "Prioridade pastoral", value: priorities, Icon: Heart, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Sem nenhuma atividade", value: total - ativos, Icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-3.5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className={`font-montserrat font-black text-xl leading-none ${color}`}>{value}</p>
              <p className="text-muted-foreground font-inter text-[10px] mt-0.5 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── PROGRESSO POR TIPO ─── */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <p className="font-montserrat font-bold text-foreground text-sm mb-3">📊 Atividades — visão pastoral</p>
        <div className="space-y-3">
          {[
            { type: "devocional", label: "📖 Devocionais", color: "var(--gradient-green)" },
            { type: "formacao", label: "🎓 Formações", color: "hsl(var(--secondary))" },
            { type: "encontro", label: "📅 Encontros", color: "hsl(var(--primary))" },
            { type: "desafio", label: "✨ Desafios", color: "hsl(var(--accent))" },
          ].map(({ type, label, color }) => {
            const t = byType(type);
            const done = completedByType(type);
            const maxPossible = t * participants.length;
            const pct = maxPossible > 0 ? Math.round((done / maxPossible) * 100) : 0;
            return (
              <div key={type} className="flex items-center gap-3">
                <span className="font-inter text-xs text-foreground w-24 flex-shrink-0">{label}</span>
                <MiniBar pct={pct} color={color} />
                <span className="font-montserrat font-bold text-xs text-foreground w-8 text-right">{pct}%</span>
                <span className="text-muted-foreground font-inter text-[10px] w-12 text-right">{t} ativ.</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PROGRESSO POR COMUNIDADE ─── */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <p className="font-montserrat font-bold text-foreground text-sm mb-3">🏡 Por comunidade</p>
        <div className="space-y-3">
          {byComm.map(c => (
            <div key={c.name}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`px-2 py-0.5 rounded-lg text-[10px] font-inter font-medium flex-shrink-0 ${COMMUNITY_COLORS[c.name] ?? "bg-muted text-foreground"}`}>
                  {c.name}
                </div>
                <MiniBar pct={c.avgPct} color={c.avgPct >= 70 ? "var(--gradient-green)" : c.avgPct >= 34 ? "var(--gradient-orange)" : "hsl(var(--destructive))"} />
                <span className="font-montserrat font-bold text-xs text-foreground w-8 text-right">{c.avgPct}%</span>
              </div>
              <div className="flex gap-2 ml-1 flex-wrap">
                <span className="text-[10px] font-inter text-muted-foreground">{c.count} jovens</span>
                <span className="text-[10px] font-inter text-brand-green">🟢 {c.saudaveis}</span>
                <span className="text-[10px] font-inter text-destructive">🔴 {c.criticos}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RESUMO SEMANAL DE DEVOCIONAIS ─── */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-brand-green" />
          <p className="font-montserrat font-bold text-foreground text-sm">📖 Devocionais — últimos 7 dias</p>
        </div>
        {weeklyTotal === 0 ? (
          <p className="text-muted-foreground font-inter text-xs text-center py-4">
            Nenhum devocional concluído nos últimos 7 dias.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-brand-green/5 border border-brand-green/20">
              <div className="w-10 h-10 rounded-xl bg-brand-green/15 flex items-center justify-center">
                <span className="font-montserrat font-black text-brand-green text-lg">{weeklyTotal}</span>
              </div>
              <div>
                <p className="font-inter text-sm font-medium text-foreground">
                  devocional{weeklyTotal > 1 ? "is" : ""} concluído{weeklyTotal > 1 ? "s" : ""}
                </p>
                <p className="text-muted-foreground font-inter text-[10px]">
                  por {weeklyDevStats.length} jovem{weeklyDevStats.length > 1 ? "ns" : ""}
                </p>
              </div>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {weeklyDevStats.map(s => {
                const participant = participants.find(p => p.user_id === s.user_id);
                return (
                  <button
                    key={s.user_id}
                    onClick={() => participant && onSelectParticipant(participant)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-montserrat font-black text-brand-green text-xs">{s.full_name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-xs font-medium text-foreground truncate">{s.full_name}</p>
                      <p className="text-muted-foreground font-inter text-[10px]">{s.community}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="font-montserrat font-bold text-xs text-brand-green">{s.count}</span>
                      <span className="text-muted-foreground font-inter text-[10px]">dev.</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
            </div>
            {/* Participants with zero */}
            {participants.length - weeklyDevStats.length > 0 && (
              <p className="text-center text-muted-foreground font-inter text-[10px] mt-2 pt-2 border-t border-border">
                ⚠️ {participants.length - weeklyDevStats.length} jovem{participants.length - weeklyDevStats.length > 1 ? "ns" : ""} sem nenhum devocional nesta semana
              </p>
            )}
          </>
        )}
      </div>

      {/* ── LISTA RÁPIDA ─── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="font-montserrat font-bold text-foreground text-sm">👥 Lista dos confirmandos</p>
          <select value={communityFilter} onChange={e => setCommunityFilter(e.target.value)}
            className="text-[10px] font-inter border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none appearance-none">
            <option value="todas">Todas as comunidades</option>
            {communities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="divide-y divide-border">
          {filteredParticipants.slice(0, 20).map(p => {
            const pct = activities.length > 0 ? Math.round((p.completed_count / activities.length) * 100) : 0;
            const info = plans[p.user_id];
            const status = info?.health_status ?? "atencao";
            const cfg = HEALTH_CFG[status as keyof typeof HEALTH_CFG] ?? HEALTH_CFG.atencao;
            return (
              <button key={p.user_id} onClick={() => onSelectParticipant(p)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-montserrat font-black text-primary text-sm">{p.full_name.charAt(0)}</span>
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${cfg.dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-inter text-sm font-medium text-foreground truncate">{p.full_name}</p>
                    {info?.is_priority && <Star className="w-3 h-3 text-accent flex-shrink-0" style={{ fill: "hsl(var(--accent))" }} />}
                  </div>
                  <p className="text-muted-foreground font-inter text-[10px]">{p.community}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-montserrat font-bold text-xs text-foreground">{pct}%</p>
                  <div className="w-12 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 70 ? "var(--gradient-green)" : "var(--gradient-orange)" }} />
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
          {filteredParticipants.length > 20 && (
            <p className="text-center text-muted-foreground font-inter text-xs py-3">
              +{filteredParticipants.length - 20} mais — use a aba Participantes para ver todos
            </p>
          )}
          {filteredParticipants.length === 0 && (
            <p className="text-center text-muted-foreground font-inter text-sm py-8">Nenhum participante encontrado.</p>
          )}
        </div>
      </div>

      {/* ── RANKING POR COMUNIDADE ─── */}
      {areaRankings.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-secondary" />
              <p className="font-montserrat font-bold text-foreground text-sm">🏅 Ranking da Área</p>
            </div>
            <select
              value={rankingCommunityFilter}
              onChange={e => setRankingCommunityFilter(e.target.value)}
              className="text-[10px] font-inter border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none appearance-none"
            >
              <option value="todas">Todas as comunidades</option>
              {areaRankings.map(cr => (
                <option key={cr.community} value={cr.community}>{cr.community}</option>
              ))}
            </select>
          </div>

          {(rankingCommunityFilter === "todas" ? areaRankings : areaRankings.filter(cr => cr.community === rankingCommunityFilter)).map(cr => (
            <div key={cr.community} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-inter font-medium ${COMMUNITY_COLORS[cr.community] ?? "bg-muted text-foreground"}`}>
                  {cr.community}
                </span>
                <span className="text-[10px] font-inter text-muted-foreground">{cr.ranking.length} participantes</span>
              </div>
              <div className="space-y-1.5">
                {cr.ranking.slice(0, 10).map((r, i) => {
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                  return (
                    <div key={r.user_id} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${i < 3 ? "bg-accent/10" : "bg-muted/30"}`}>
                      <span className="w-6 text-center flex-shrink-0">
                        {medal ?? <span className="font-montserrat font-bold text-xs text-muted-foreground">{i + 1}</span>}
                      </span>
                      <p className="font-inter text-sm text-foreground flex-1 truncate">{r.full_name}</p>
                      <div className="text-right flex-shrink-0">
                        <span className="font-montserrat font-bold text-xs text-secondary">{Number(r.faith_points)} pts</span>
                      </div>
                    </div>
                  );
                })}
                {cr.ranking.length > 10 && (
                  <p className="text-center text-muted-foreground font-inter text-[10px] pt-1">
                    +{cr.ranking.length - 10} participantes
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-accent-foreground" />
          <p className="font-montserrat font-bold text-foreground text-sm">🏆 Temporada & Vencedores</p>
        </div>

        {/* Existing closed seasons */}
        {seasons.length > 0 && (
          <div className="space-y-3 mb-4">
            {seasons.map(s => {
              const course = courses.find(c => c.id === s.course_id);
              const winners = (s.winners as any[]) ?? [];
              return (
                <div key={s.id} className="bg-accent/10 rounded-xl p-3 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-3.5 h-3.5 text-accent-foreground" />
                    <p className="font-montserrat font-bold text-foreground text-xs">
                      {course?.title ?? "Curso"} · {s.community}
                    </p>
                    <span className="text-[10px] font-inter text-muted-foreground ml-auto">
                      Encerrado em {new Date(s.closed_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {winners.map((w: any) => (
                      <div key={w.user_id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-card/50">
                        <span className="text-lg">{w.medal}</span>
                        <p className="font-inter text-sm text-foreground flex-1">{w.full_name}</p>
                        <span className="font-montserrat font-bold text-xs text-accent-foreground">{w.faith_points} pts</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground font-inter text-[10px] mt-2">{s.total_participants} participantes</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Close season buttons */}
        <p className="font-inter text-xs text-muted-foreground mb-2">Encerrar temporada para registrar os vencedores:</p>
        <div className="space-y-2">
          {courses.map(course => {
            const isClosed = seasons.some(s => s.course_id === course.id && s.community === (profile?.community as string));
            return (
              <div key={course.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-border">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--gradient-hero)" }}>
                  <span className="font-montserrat font-black text-primary-foreground text-xs">#{course.order_num}</span>
                </div>
                <p className="font-inter text-sm text-foreground flex-1">{course.title}</p>
                {isClosed ? (
                  <span className="text-[10px] font-inter font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded-full">✓ Encerrado</span>
                ) : (
                  <button
                    onClick={() => handleCloseSeason(course.id)}
                    disabled={closingSeason}
                    className="px-3 py-1.5 rounded-xl text-xs font-inter font-bold text-primary-foreground disabled:opacity-50 transition-opacity"
                    style={{ background: "var(--gradient-hero)" }}
                  >
                    {closingSeason ? "..." : "🏆 Encerrar"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
