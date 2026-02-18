import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users, ChevronDown, Search, LogOut, Filter,
  BookOpen, GraduationCap, CalendarDays, Zap,
  CheckCircle, Clock, XCircle, BarChart3, ChevronRight
} from "lucide-react";

const ACTIVITY_TYPES = [
  { value: "todos", label: "Todos os tipos" },
  { value: "devocional", label: "📖 Devocionais" },
  { value: "formacao", label: "🎓 Formações" },
  { value: "encontro", label: "📅 Encontros" },
  { value: "desafio", label: "✨ Desafios" },
];

const AREA_1_COMMUNITIES = ["Rincão Frente", "Rincão Fundo", "Bom Pastor", "Iriá Pira 1"];
const AREA_2_COMMUNITIES = ["Martim Lutero", "Linha Brasil", "Iriá Pira 2"];

type Activity = {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  order_num: number;
  points: number;
};

type Participant = {
  user_id: string;
  full_name: string;
  community: string;
  area: string;
  birth_date: string;
  phone: string;
  completed_count: number;
  completed_activity_ids: string[];
};

type StatusFilter = "todos" | "iniciando" | "andamento" | "avancado";

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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [communityFilter, setCommunityFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const areaName = profile?.area ?? "";
  const communities = areaName === "Área 1" ? AREA_1_COMMUNITIES : AREA_2_COMMUNITIES;

  useEffect(() => {
    if (role !== "admin") { navigate("/"); return; }
    fetchData();
  }, [role]);

  async function fetchData() {
    setLoading(true);
    // Fetch all activities
    const { data: activitiesData } = await supabase
      .from("activities")
      .select("*")
      .order("order_num");

    // Fetch profiles in admin's area (RLS enforces area restriction)
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, community, area, birth_date, phone")
      .neq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "");

    // Fetch all progress for those users
    const { data: progressData } = await supabase
      .from("user_progress")
      .select("user_id, activity_id");

    const activitiesList = activitiesData ?? [];
    const profilesList = profilesData ?? [];
    const progressList = progressData ?? [];

    const participantList: Participant[] = profilesList.map((p) => {
      const userProgress = progressList.filter((pr) => pr.user_id === p.user_id);
      return {
        ...p,
        completed_count: userProgress.length,
        completed_activity_ids: userProgress.map((pr) => pr.activity_id),
      };
    });

    setActivities(activitiesList);
    setParticipants(participantList);
    setLoading(false);
  }

  // Filtered participants
  const filtered = participants.filter((p) => {
    if (search && !p.full_name.toLowerCase().includes(search.toLowerCase()) &&
      !p.community.toLowerCase().includes(search.toLowerCase())) return false;
    if (communityFilter !== "todas" && p.community !== communityFilter) return false;
    const pct = activities.length > 0 ? (p.completed_count / activities.length) * 100 : 0;
    if (statusFilter === "iniciando" && (pct === 0 || pct >= 34)) return false;
    if (statusFilter === "andamento" && (pct < 34 || pct >= 70)) return false;
    if (statusFilter === "avancado" && pct < 70) return false;
    return true;
  });

  const totalPoints = (count: number) =>
    activities
      .filter((_, i) => i < count)
      .reduce((sum, a) => sum + a.points, 0);

  const stats = {
    total: participants.length,
    avancados: participants.filter((p) => activities.length > 0 && (p.completed_count / activities.length) >= 0.7).length,
    semAtividade: participants.filter((p) => p.completed_count === 0).length,
    mediaProgresso: participants.length > 0
      ? Math.round(participants.reduce((s, p) => s + (activities.length > 0 ? (p.completed_count / activities.length) * 100 : 0), 0) / participants.length)
      : 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 pt-8 pb-5" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center">
                <span className="text-xl">✝️</span>
              </div>
              <div>
                <p className="text-primary-foreground/60 font-inter text-xs">Painel do Administrador</p>
                <h1 className="font-montserrat font-black text-primary-foreground text-lg">
                  {areaName}
                </h1>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
              title="Sair"
            >
              <LogOut className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Participantes", value: stats.total, icon: "👥" },
              { label: "Avançados", value: stats.avancados, icon: "🏆" },
              { label: "Sem atividade", value: stats.semAtividade, icon: "⚠️" },
              { label: "Progresso médio", value: `${stats.mediaProgresso}%`, icon: "📊" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-2.5 text-center">
                <span className="text-lg">{s.icon}</span>
                <p className="font-montserrat font-black text-primary-foreground text-lg leading-none mt-1">{s.value}</p>
                <p className="text-primary-foreground/50 text-[10px] font-inter mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 pb-10">
        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-4 space-y-3 shadow-sm">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou comunidade..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Community filter */}
            <div className="relative">
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={communityFilter}
                onChange={(e) => setCommunityFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-xs focus:outline-none focus:ring-2 focus:ring-secondary transition-all appearance-none"
              >
                <option value="todas">Todas</option>
                {communities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Status filter */}
            <div className="relative">
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-xs focus:outline-none focus:ring-2 focus:ring-secondary transition-all appearance-none"
              >
                <option value="todos">Qualquer status</option>
                <option value="iniciando">Iniciando</option>
                <option value="andamento">Em andamento</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>

            {/* Type filter */}
            <div className="relative">
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-xs focus:outline-none focus:ring-2 focus:ring-secondary transition-all appearance-none"
              >
                {ACTIVITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filters summary */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground font-inter text-xs">
              {filtered.length} participante{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
            </span>
            {(communityFilter !== "todas" || statusFilter !== "todos" || typeFilter !== "todos" || search) && (
              <button
                onClick={() => { setCommunityFilter("todas"); setStatusFilter("todos"); setTypeFilter("todos"); setSearch(""); }}
                className="ml-auto text-secondary font-inter text-xs font-medium"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Participant list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 animate-float">
              <span className="text-2xl">✝️</span>
            </div>
            <p className="text-muted-foreground font-inter text-sm">Carregando participantes...</p>
          </div>
        ) : filtered.length === 0 ? (
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
              const pts = totalPoints(p.completed_count);

              // Filter activities by type if type filter is active
              const activityList = typeFilter === "todos"
                ? activities
                : activities.filter((a) => a.type === typeFilter);

              return (
                <div key={p.user_id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="font-montserrat font-black text-primary text-lg">
                            {p.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-montserrat font-bold text-card-foreground text-sm truncate">{p.full_name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-muted-foreground font-inter text-xs">{p.community}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground font-inter text-xs">📞 {p.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-inter font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        <button
                          onClick={() => setSelectedParticipant(selectedParticipant?.user_id === p.user_id ? null : p)}
                          className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center transition-transform"
                          style={{ transform: selectedParticipant?.user_id === p.user_id ? "rotate(90deg)" : "rotate(0deg)" }}
                        >
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-muted-foreground font-inter text-xs">{p.completed_count}/{activities.length} atividades</span>
                        <div className="flex items-center gap-2">
                          <span className="text-accent font-montserrat font-bold text-xs">⭐ {pts} pts</span>
                          <span className="font-montserrat font-bold text-foreground text-xs">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 70
                              ? "var(--gradient-green)"
                              : pct >= 34
                                ? "var(--gradient-orange)"
                                : "hsl(var(--destructive))",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {selectedParticipant?.user_id === p.user_id && (
                    <div className="border-t border-border px-4 pb-4 pt-3">
                      <p className="font-montserrat font-bold text-foreground text-xs mb-3 uppercase tracking-wide">
                        {typeFilter === "todos" ? "Todas as atividades" : ACTIVITY_TYPES.find(t => t.value === typeFilter)?.label}
                      </p>
                      <div className="space-y-2">
                        {activityList.map((activity) => {
                          const done = p.completed_activity_ids.includes(activity.id);
                          return (
                            <div key={activity.id} className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? "bg-brand-green/10" : "bg-muted"}`}>
                                {done
                                  ? <CheckCircle className="w-4 h-4 text-brand-green" />
                                  : <Clock className="w-4 h-4 text-muted-foreground" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-inter text-xs truncate ${done ? "text-foreground" : "text-muted-foreground"}`}>
                                  {activity.title}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 ${getTypeColor(activity.type)}`}>
                                {getTypeIcon(activity.type)}
                                {activity.type}
                              </span>
                              <span className={`text-[10px] font-inter ${done ? "text-accent font-bold" : "text-muted-foreground"}`}>
                                {done ? `+${activity.points}pts` : "pendente"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
