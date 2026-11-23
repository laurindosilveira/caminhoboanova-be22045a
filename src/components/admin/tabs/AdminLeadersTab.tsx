import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Shield, Crown, ChevronDown, ChevronUp, UserPlus, UserMinus, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type LeaderInfo = {
  user_id: string;
  full_name: string;
  community: string;
  area: string;
  phone: string;
  role: string;
  is_super: boolean;
  turma_ids: string[];
  turma_names: string[];
  participant_count: number;
};

type TurmaOption = { id: string; name: string };
type ProfileSummary = {
  user_id: string;
  full_name: string;
  community: string | null;
  area: string | null;
  phone: string | null;
  turma_id: string | null;
};

export default function AdminLeadersTab({
  turmas,
  churchId,
}: {
  turmas: TurmaOption[];
  churchId?: string | null;
}) {
  const { isSuper } = useAuth();
  const { toast } = useToast();
  const [leaders, setLeaders] = useState<LeaderInfo[]>([]);
  const [allProfiles, setAllProfiles] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLeader, setExpandedLeader] = useState<string | null>(null);
  const [showPromote, setShowPromote] = useState(false);
  const [searchPromote, setSearchPromote] = useState("");
  const [promoting, setPromoting] = useState<string | null>(null);
  const [demoting, setDemoting] = useState<string | null>(null);

  const fetchLeaders = useCallback(async () => {
    setLoading(true);
    let rolesQuery = supabase
      .from("user_roles")
      .select("user_id, role, is_super, admin_area, church_id")
      .in("role", ["admin", "lider"]);
    let profilesQuery = supabase
      .from("profiles")
      .select("user_id, full_name, community, area, phone, turma_id, church_id");
    let assignmentsQuery = supabase
      .from("turma_leaders")
      .select("user_id, turma_id, is_fallback, church_id");

    if (churchId) {
      rolesQuery = rolesQuery.eq("church_id", churchId);
      profilesQuery = profilesQuery.eq("church_id", churchId);
      assignmentsQuery = assignmentsQuery.eq("church_id", churchId);
    }

    const [{ data: rolesData }, { data: profilesData }, { data: assignmentsData }] = await Promise.all([
      rolesQuery,
      profilesQuery,
      assignmentsQuery,
    ]);

    const profiles = profilesData ?? [];
    setAllProfiles(profiles);

    const leaderList: LeaderInfo[] = (rolesData ?? []).map(r => {
      const p = profiles.find(pr => pr.user_id === r.user_id);
      const leaderTurmaIds = (assignmentsData ?? [])
        .filter((assignment) => assignment.user_id === r.user_id && !assignment.is_fallback)
        .map((assignment) => assignment.turma_id);
      const leaderTurmas = turmas.filter((turma) => leaderTurmaIds.includes(turma.id));
      const turmaParticipants = profiles.filter(
        (participant) => participant.turma_id && leaderTurmaIds.includes(participant.turma_id),
      );
      return {
        user_id: r.user_id,
        full_name: p?.full_name ?? "Sem nome",
        community: p?.community ?? "",
        area: p?.area ?? r.admin_area ?? "",
        phone: p?.phone ?? "",
        role: r.role,
        is_super: r.is_super,
        turma_ids: leaderTurmaIds,
        turma_names: leaderTurmas.map((turma) => turma.name),
        participant_count: turmaParticipants.length,
      };
    });

    setLeaders(leaderList.sort((a, b) => {
      if (a.is_super !== b.is_super) return a.is_super ? -1 : 1;
      if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
      return a.full_name.localeCompare(b.full_name);
    }));
    setLoading(false);
  }, [churchId, turmas]);

  useEffect(() => { void fetchLeaders(); }, [fetchLeaders]);

  async function handlePromote(userId: string, role: "admin" | "lider") {
    setPromoting(userId);
    const profile = allProfiles.find(p => p.user_id === userId);
    const { error } = await supabase.from("user_roles").upsert({
      user_id: userId,
      role,
      admin_area: profile?.area ?? null,
      church_id: churchId ?? null,
    }, { onConflict: "user_id,role" });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${role === "admin" ? "Administrador" : "Líder"} promovido ✅` });
      setShowPromote(false);
      setSearchPromote("");
      fetchLeaders();
    }
    setPromoting(null);
  }

  async function handleDemote(userId: string) {
    const leader = leaders.find((item) => item.user_id === userId);
    if (!leader || leader.role !== "lider") {
      toast({
        title: "Remoção de administrador indisponível",
        description: "Defina outro administrador por um fluxo administrativo próprio antes de remover este cargo.",
        variant: "destructive",
      });
      return;
    }
    if (!confirm("Tem certeza que deseja remover este cargo?")) return;
    setDemoting(userId);
    for (const turmaId of leader.turma_ids) {
      const { error: assignmentError } = await supabase.rpc("set_turma_leader", {
        p_user_id: userId,
        p_turma_id: turmaId,
        p_assigned: false,
      });
      if (assignmentError) {
        toast({
          title: "Não foi possível remover a liderança",
          description: assignmentError.message,
          variant: "destructive",
        });
        setDemoting(null);
        await fetchLeaders();
        return;
      }
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "lider");
    if (error) {
      toast({ title: "Não foi possível remover o cargo", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cargo e grupos de liderança removidos" });
    }
    await fetchLeaders();
    setDemoting(null);
  }

  async function handleToggleTurma(userId: string, turmaId: string, assigned: boolean) {
    const { error } = await supabase.rpc("set_turma_leader", {
      p_user_id: userId,
      p_turma_id: turmaId,
      p_assigned: assigned,
    });
    if (error) {
      toast({ title: "Não foi possível atualizar o grupo", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: assigned ? "Grupo atribuído ao líder" : "Grupo removido do líder" });
    await fetchLeaders();
  }

  const ROLE_BADGES: Record<string, { label: string; class: string; icon: typeof Shield }> = {
    admin: { label: "Admin", class: "bg-primary/10 text-primary", icon: Shield },
    lider: { label: "Líder", class: "bg-brand-green/10 text-brand-green", icon: Users },
  };

  // Users who are not leaders/admins for promotion
  const leaderIds = new Set(leaders.map(l => l.user_id));
  const promotableUsers = allProfiles.filter(p =>
    !leaderIds.has(p.user_id) &&
    p.full_name.toLowerCase().includes(searchPromote.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          <h2 className="font-montserrat font-black text-foreground text-lg">Gestão de Líderes</h2>
        </div>
        {isSuper && (
          <button
            onClick={() => setShowPromote(!showPromote)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-inter font-medium text-primary-foreground"
            style={{ background: "var(--gradient-hero)" }}
          >
            <UserPlus className="w-3.5 h-3.5" /> Promover
          </button>
        )}
      </div>

      {/* Promote panel */}
      {showPromote && (
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm space-y-3">
          <p className="font-montserrat font-bold text-foreground text-sm">Promover Membro</p>
          <input
            value={searchPromote}
            onChange={e => setSearchPromote(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {promotableUsers.slice(0, 10).map(p => (
              <div key={p.user_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <p className="font-inter text-xs font-medium text-foreground">{p.full_name}</p>
                  <p className="font-inter text-xs text-muted-foreground">{p.community}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handlePromote(p.user_id, "lider")}
                    disabled={promoting === p.user_id}
                    className="px-2.5 py-1 rounded-lg bg-brand-green/10 text-brand-green text-xs font-inter font-medium hover:bg-brand-green/20 disabled:opacity-50"
                  >
                    Líder
                  </button>
                  <button
                    onClick={() => handlePromote(p.user_id, "admin")}
                    disabled={promoting === p.user_id}
                    className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-inter font-medium hover:bg-primary/20 disabled:opacity-50"
                  >
                    Admin
                  </button>
                </div>
              </div>
            ))}
            {searchPromote && promotableUsers.length === 0 && (
              <p className="text-center text-muted-foreground font-inter text-xs py-3">Nenhum membro encontrado.</p>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <p className="font-montserrat font-black text-foreground text-lg">{leaders.filter(l => l.role === "admin").length}</p>
          <p className="text-muted-foreground font-inter text-xs">Admins</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <p className="font-montserrat font-black text-foreground text-lg">{leaders.filter(l => l.role === "lider").length}</p>
          <p className="text-muted-foreground font-inter text-xs">Líderes</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <p className="font-montserrat font-black text-foreground text-lg">{leaders.filter(l => l.is_super).length}</p>
          <p className="text-muted-foreground font-inter text-xs">Super Admins</p>
        </div>
      </div>

      {/* Leaders list */}
      <div className="space-y-2">
        {leaders.map(leader => {
          const badge = ROLE_BADGES[leader.role] ?? ROLE_BADGES.lider;
          const BadgeIcon = badge.icon;
          const isExpanded = expandedLeader === leader.user_id;

          return (
            <div key={leader.user_id} className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedLeader(isExpanded ? null : leader.user_id)}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${badge.class}`}>
                  {leader.is_super ? <Crown className="w-4.5 h-4.5" /> : <BadgeIcon className="w-4.5 h-4.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-montserrat font-bold text-foreground text-xs">{leader.full_name}</p>
                    {leader.is_super && (
                      <span className="px-1.5 py-0.5 rounded-full text-[8px] font-inter font-bold bg-amber-500/10 text-amber-600">SUPER</span>
                    )}
                  </div>
                  <p className="text-muted-foreground font-inter text-xs mt-0.5">
                    {leader.community} · {leader.area}
                  </p>
                  {leader.turma_names.length > 0 && (
                    <p className="text-primary font-inter text-xs mt-0.5">
                      📚 {leader.turma_names.join(", ")} · {leader.participant_count} discípulo{leader.participant_count !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-inter font-semibold ${badge.class}`}>
                  {badge.label}
                </span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 border-t border-border space-y-3 mt-0">
                  {/* Assign one or more real groups without changing the participant's own turma. */}
                  <div className="mt-2">
                    <p className="font-inter text-xs text-muted-foreground mb-1.5">Grupos que lidera</p>
                    <div className="space-y-1.5">
                      {turmas.map((turma) => {
                        const assigned = leader.turma_ids.includes(turma.id);
                        return (
                          <button
                            type="button"
                            key={turma.id}
                            onClick={() => void handleToggleTurma(leader.user_id, turma.id, !assigned)}
                            className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs ${
                              assigned ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground"
                            }`}
                          >
                            <span className={`flex h-4 w-4 items-center justify-center rounded border ${
                              assigned ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                            }`}>
                              {assigned ? "✓" : ""}
                            </span>
                            <span className="font-semibold">{turma.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  {isSuper && !leader.is_super && leader.role === "lider" && (
                    <button
                      onClick={() => handleDemote(leader.user_id)}
                      disabled={demoting === leader.user_id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-inter font-medium hover:bg-destructive/20 disabled:opacity-50 transition-colors"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      {demoting === leader.user_id ? "Removendo..." : "Remover cargo"}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {leaders.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-montserrat font-bold text-foreground text-sm">Nenhum líder encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
