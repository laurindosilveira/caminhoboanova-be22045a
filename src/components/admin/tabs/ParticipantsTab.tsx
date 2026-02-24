import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, ChevronDown, Filter, Users, CheckCircle, Clock, BookOpen,
  GraduationCap, CalendarDays, Zap, ChevronLeft, Phone, MapPin, Calendar, Star, AlertTriangle
} from "lucide-react";

type Activity = { id: string; type: string; title: string; points: number; order_num: number; subtitle: string | null };
type Participant = {
  user_id: string; full_name: string; community: string; area: string;
  birth_date: string; phone: string; completed_count: number; completed_activity_ids: string[];
};

type StatusReason = {
  icon: string;
  label: string;
  severity: "high" | "medium" | "low";
};

const ACTIVITY_TYPES = [
  { value: "todos", label: "Todos os tipos" },
  { value: "devocional", label: "📖 Devocionais" },
  { value: "formacao", label: "🎓 Formações" },
  { value: "encontro", label: "📅 Encontros" },
  { value: "desafio", label: "✨ Desafios" },
];

function getStatusInfo(completed: number, total: number) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  if (pct === 0) return { label: "Não iniciou", color: "text-muted-foreground", bg: "bg-muted", dot: "bg-muted-foreground" };
  if (pct < 34) return { label: "Iniciando", color: "text-destructive", bg: "bg-destructive/10", dot: "bg-destructive" };
  if (pct < 70) return { label: "Em andamento", color: "text-accent-foreground", bg: "bg-accent/30", dot: "bg-accent" };
  return { label: "Avançado", color: "text-brand-green", bg: "bg-brand-green/10", dot: "bg-brand-green" };
}

function getTypeIcon(type: string) {
  if (type === "devocional") return <BookOpen className="w-3.5 h-3.5" />;
  if (type === "formacao") return <GraduationCap className="w-3.5 h-3.5" />;
  if (type === "encontro") return <CalendarDays className="w-3.5 h-3.5" />;
  return <Zap className="w-3.5 h-3.5" />;
}

function getTypeColor(type: string) {
  if (type === "devocional") return "text-brand-green bg-brand-green/10";
  if (type === "formacao") return "text-secondary bg-secondary/10";
  if (type === "encontro") return "text-primary bg-primary/10";
  return "text-accent-foreground bg-accent/20";
}

function calcAge(birthDate: string) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

type DetailProps = { participant: Participant; activities: Activity[]; onBack: () => void };

function ParticipantDetail({ participant: p, activities, onBack }: DetailProps) {
  const [typeFilter, setTypeFilter] = useState("todos");
  const pct = activities.length > 0 ? Math.round((p.completed_count / activities.length) * 100) : 0;
  const status = getStatusInfo(p.completed_count, activities.length);
  const totalPts = activities.filter(a => p.completed_activity_ids.includes(a.id)).reduce((s, a) => s + a.points, 0);
  const age = calcAge(p.birth_date);

  const filteredActivities = typeFilter === "todos" ? activities : activities.filter(a => a.type === typeFilter);

  const byType = (type: string) => {
    const list = activities.filter(a => a.type === type);
    const done = list.filter(a => p.completed_activity_ids.includes(a.id)).length;
    return { total: list.length, done };
  };

  return (
    <div>
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground font-inter text-sm mb-4 hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Voltar aos participantes
      </button>

      {/* Profile card */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="font-montserrat font-black text-primary text-2xl">{p.full_name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="font-montserrat font-black text-foreground text-lg">{p.full_name}</h2>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-inter font-medium ${status.bg} ${status.color}`}>{status.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground font-inter">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{p.community} · {p.area}</span>
          </div>
          {p.phone && (
            <div className="flex items-center gap-2 text-muted-foreground font-inter">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{p.phone}</span>
            </div>
          )}
          {age !== null && (
            <div className="flex items-center gap-2 text-muted-foreground font-inter">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{age} anos</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-accent font-montserrat font-bold">
            <Star className="w-4 h-4 flex-shrink-0" />
            <span>{totalPts} pontos</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-muted-foreground font-inter text-xs">{p.completed_count}/{activities.length} atividades</span>
            <span className="font-montserrat font-bold text-foreground text-xs">{pct}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{
              width: `${pct}%`,
              background: pct >= 70 ? "var(--gradient-green)" : pct >= 34 ? "var(--gradient-orange)" : "hsl(var(--destructive))",
            }} />
          </div>
        </div>
      </div>

      {/* Mini stats by type */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { type: "devocional", label: "Devocionais", icon: "📖" },
          { type: "formacao", label: "Formações", icon: "🎓" },
          { type: "encontro", label: "Encontros", icon: "📅" },
          { type: "desafio", label: "Desafios", icon: "✨" },
        ].map(({ type, label, icon }) => {
          const { total, done } = byType(type);
          return (
            <div key={type} className="bg-card rounded-xl border border-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{icon}</span>
                <span className="font-inter text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="font-montserrat font-black text-foreground text-lg leading-none">{done}<span className="text-muted-foreground font-inter text-xs font-normal">/{total}</span></p>
            </div>
          );
        })}
      </div>

      {/* Activity detail */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-montserrat font-bold text-foreground text-sm">Atividades</p>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-inter border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none"
          >
            {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          {filteredActivities.map((activity) => {
            const done = p.completed_activity_ids.includes(activity.id);
            return (
              <div key={activity.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? "bg-brand-green/10" : "bg-muted"}`}>
                  {done ? <CheckCircle className="w-4 h-4 text-brand-green" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-inter text-xs truncate ${done ? "text-foreground" : "text-muted-foreground"}`}>{activity.title}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 ${getTypeColor(activity.type)}`}>
                  {getTypeIcon(activity.type)} {activity.type}
                </span>
                <span className={`text-[10px] font-inter ${done ? "text-accent font-bold" : "text-muted-foreground"}`}>
                  {done ? `+${activity.points}pts` : "pendente"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type Props = {
  participants: Participant[];
  activities: Activity[];
  communities: string[];
};

type StatusFilter = "todos" | "iniciando" | "andamento" | "avancado";

export default function ParticipantsTab({ participants, activities, communities }: Props) {
  const [search, setSearch] = useState("");
  const [communityFilter, setCommunityFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const [statusReasons, setStatusReasons] = useState<Record<string, StatusReason[]>>({});

  // Fetch objective status reasons from DB
  useEffect(() => {
    async function fetchReasons() {
      const userIds = participants.map(p => p.user_id);
      if (userIds.length === 0) return;

      const now = new Date();
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

      const [{ data: devData }, { data: attData }, { data: planData }, { data: assessData }] = await Promise.all([
        supabase.from("devotional_progress").select("user_id, completed_at").in("user_id", userIds),
        supabase.from("attendance").select("user_id, status, created_at").in("user_id", userIds).order("created_at", { ascending: false }),
        supabase.from("discipleship_plans").select("user_id, health_status, is_priority").in("user_id", userIds),
        supabase.from("spiritual_assessments").select("user_id, needs_pastor, prayer_score, presence_score, month, year")
          .in("user_id", userIds).eq("month", now.getMonth() + 1).eq("year", now.getFullYear()),
      ]);

      // Last devotional per user
      const lastDev: Record<string, Date> = {};
      (devData ?? []).forEach(d => {
        const dt = new Date(d.completed_at);
        if (!lastDev[d.user_id] || dt > lastDev[d.user_id]) lastDev[d.user_id] = dt;
      });

      // Consecutive absences per user
      const userAtt: Record<string, string[]> = {};
      (attData ?? []).forEach(a => {
        if (!userAtt[a.user_id]) userAtt[a.user_id] = [];
        userAtt[a.user_id].push(a.status);
      });

      const planMap: Record<string, { health_status: string; is_priority: boolean }> = {};
      (planData ?? []).forEach(p => { planMap[p.user_id] = { health_status: p.health_status, is_priority: p.is_priority ?? false }; });

      const assessMap: Record<string, any> = {};
      (assessData ?? []).forEach(a => { assessMap[a.user_id] = a; });

      const reasons: Record<string, StatusReason[]> = {};

      participants.forEach(p => {
        const r: StatusReason[] = [];

        // Consecutive absences
        const statuses = userAtt[p.user_id] ?? [];
        let consecutive = 0;
        for (const s of statuses) {
          if (s !== "presente") consecutive++;
          else break;
        }
        if (consecutive >= 3) r.push({ icon: "📅", label: `${consecutive} faltas seguidas`, severity: "high" });
        else if (consecutive === 2) r.push({ icon: "📅", label: "2 faltas seguidas", severity: "medium" });

        // Devotional inactivity
        const last = lastDev[p.user_id];
        if (!last) {
          r.push({ icon: "📖", label: "Nunca fez devocional", severity: "high" });
        } else if (last < fourteenDaysAgo) {
          const days = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
          r.push({ icon: "📖", label: `Sem devocional há ${days} dias`, severity: "high" });
        } else if (last < tenDaysAgo) {
          const days = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
          r.push({ icon: "📖", label: `Sem devocional há ${days} dias`, severity: "medium" });
        }

        // Needs pastor
        if (assessMap[p.user_id]?.needs_pastor) {
          r.push({ icon: "🙏", label: "Pediu ajuda pastoral", severity: "high" });
        }

        // Health status
        const plan = planMap[p.user_id];
        if (plan?.health_status === "critico") {
          r.push({ icon: "🚨", label: "Status crítico", severity: "high" });
        } else if (plan?.is_priority) {
          r.push({ icon: "⚠️", label: "Prioridade pastoral", severity: "medium" });
        }

        // Low activity progress
        if (activities.length > 0 && p.completed_count === 0) {
          r.push({ icon: "😴", label: "Nenhuma atividade concluída", severity: "medium" });
        }

        if (r.length > 0) reasons[p.user_id] = r;
      });

      setStatusReasons(reasons);
    }
    fetchReasons();
  }, [participants, activities]);

  if (selectedParticipant) {
    return <ParticipantDetail participant={selectedParticipant} activities={activities} onBack={() => setSelectedParticipant(null)} />;
  }

  const filtered = participants.filter((p) => {
    if (search && !p.full_name.toLowerCase().includes(search.toLowerCase()) && !p.community.toLowerCase().includes(search.toLowerCase())) return false;
    if (communityFilter !== "todas" && p.community !== communityFilter) return false;
    const pct = activities.length > 0 ? (p.completed_count / activities.length) * 100 : 0;
    if (statusFilter === "iniciando" && (pct === 0 || pct >= 34)) return false;
    if (statusFilter === "andamento" && (pct < 34 || pct >= 70)) return false;
    if (statusFilter === "avancado" && pct < 70) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou comunidade..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <select value={communityFilter} onChange={(e) => setCommunityFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-xs focus:outline-none focus:ring-2 focus:ring-secondary transition-all appearance-none">
              <option value="todas">Todas as comunidades</option>
              {communities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="relative">
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-xs focus:outline-none focus:ring-2 focus:ring-secondary transition-all appearance-none">
              <option value="todos">Qualquer status</option>
              <option value="iniciando">Iniciando</option>
              <option value="andamento">Em andamento</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground font-inter text-xs">
            {filtered.length} participante{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </span>
          {(communityFilter !== "todas" || statusFilter !== "todos" || search) && (
            <button onClick={() => { setCommunityFilter("todas"); setStatusFilter("todos"); setSearch(""); }}
              className="ml-auto text-secondary font-inter text-xs font-medium">
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-montserrat font-bold text-foreground">Nenhum participante encontrado</p>
          <p className="text-muted-foreground font-inter text-sm mt-1">Tente ajustar os filtros.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const pct = activities.length > 0 ? Math.round((p.completed_count / activities.length) * 100) : 0;
            const status = getStatusInfo(p.completed_count, activities.length);
            const totalPts = activities.filter(a => p.completed_activity_ids.includes(a.id)).reduce((s, a) => s + a.points, 0);
            const age = calcAge(p.birth_date);
            return (
              <button
                key={p.user_id}
                onClick={() => setSelectedParticipant(p)}
                className="w-full text-left bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:border-primary/30 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-montserrat font-black text-primary text-lg">{p.full_name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-montserrat font-bold text-card-foreground text-sm truncate">{p.full_name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-muted-foreground font-inter text-xs">{p.community}</span>
                          {age !== null && <><span className="text-muted-foreground">·</span><span className="text-muted-foreground font-inter text-xs">{age} anos</span></>}
                          <span className="text-muted-foreground">·</span>
                          <span className="text-accent font-inter text-xs font-medium">⭐ {totalPts}pts</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-inter font-medium flex-shrink-0 ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-muted-foreground font-inter text-xs">{p.completed_count}/{activities.length} atividades</span>
                      <span className="font-montserrat font-bold text-foreground text-xs">{pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${pct}%`,
                        background: pct >= 70 ? "var(--gradient-green)" : pct >= 34 ? "var(--gradient-orange)" : "hsl(var(--destructive))",
                      }} />
                    </div>
                  </div>
                  {/* Status reasons */}
                  {statusReasons[p.user_id] && statusReasons[p.user_id].length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {statusReasons[p.user_id].map((reason, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-inter font-medium ${
                            reason.severity === "high"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-accent/20 text-accent-foreground"
                          }`}
                        >
                          {reason.icon} {reason.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
