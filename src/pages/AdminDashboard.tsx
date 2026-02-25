import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminBottomNav, { AdminTab } from "@/components/admin/AdminBottomNav";
import OverviewTab from "@/components/admin/tabs/OverviewTab";
import ParticipantsTab from "@/components/admin/tabs/ParticipantsTab";
import CoursesTab from "@/components/admin/tabs/CoursesTab";
// MessagesTab moved into AttendanceTab as "Avisos" sub-tab
import AdminDiscipleshipTab from "@/components/admin/tabs/AdminDiscipleshipTab";
import ClassroomSettingsTab from "@/components/admin/tabs/ClassroomSettingsTab";
import AttendanceTab from "@/components/admin/tabs/AttendanceTab";
import UsersTab from "@/components/admin/tabs/UsersTab";

const AREA_1_COMMUNITIES = ["Rincão Frente", "Rincão Fundo", "Bom Pastor", "Iriá Pira 1"];
const AREA_2_COMMUNITIES = ["Martim Lutero", "Linha Brasil", "Iriá Pira 2"];
const ALL_COMMUNITIES = [...AREA_1_COMMUNITIES, ...AREA_2_COMMUNITIES];

const COMMUNITY_ICONS: Record<string, string> = {
  "Rincão Frente": "⛪", "Rincão Fundo": "🏡", "Bom Pastor": "🐑", "Iriá Pira 1": "🌿",
  "Martim Lutero": "✝️", "Linha Brasil": "🌾", "Iriá Pira 2": "🌱",
};

type Activity = {
  id: string; type: string; title: string; subtitle: string | null; order_num: number; points: number;
};
type Participant = {
  user_id: string; full_name: string; community: string; area: string;
  birth_date: string; phone: string; completed_count: number; completed_activity_ids: string[];
};
type PlanInfo = { health_status: string; is_priority: boolean; needs_pastor?: boolean };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { profile, role, isSuper, signOut } = useAuth();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [plans, setPlans] = useState<Record<string, PlanInfo>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>(role === "lider" ? "courses" : "overview");
  const [highlightedParticipant, setHighlightedParticipant] = useState<Participant | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(role === "lider" ? "todas" : "todas");
  const [selectedArea, setSelectedArea] = useState<string | null>(isSuper ? null : (profile?.area ?? null));

  const areaName = selectedArea ?? profile?.area ?? "";
  const areaNumber = areaName === "Área 1" ? "1" : "2";
  const currentYear = new Date().getFullYear();
  const turmaName = isSuper && !selectedArea ? `Todas as Turmas · ${currentYear}` : `Área ${areaNumber} · ${currentYear}`;
  const communities = isSuper && !selectedArea 
    ? ALL_COMMUNITIES 
    : (areaName === "Área 1" ? AREA_1_COMMUNITIES : AREA_2_COMMUNITIES);

  useEffect(() => {
    if (role !== "admin" && role !== "lider") { navigate("/"); return; }
    fetchData();
  }, [role]);

  const fetchPlans = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    const [{ data: plansData }, { data: assessData }] = await Promise.all([
      supabase.from("discipleship_plans").select("user_id, health_status, is_priority").in("user_id", ids),
      supabase.from("spiritual_assessments").select("user_id, needs_pastor")
        .in("user_id", ids)
        .eq("month", new Date().getMonth() + 1)
        .eq("year", new Date().getFullYear()),
    ]);
    const map: Record<string, PlanInfo> = {};
    (plansData ?? []).forEach(pl => {
      map[pl.user_id] = { health_status: pl.health_status, is_priority: pl.is_priority ?? false };
    });
    (assessData ?? []).forEach(a => {
      if (!map[a.user_id]) map[a.user_id] = { health_status: "atencao", is_priority: false };
      map[a.user_id].needs_pastor = a.needs_pastor;
    });
    setPlans(map);
  }, []);

  async function fetchData() {
    setLoading(true);
    const [{ data: activitiesData }, { data: profilesData }, userResult] = await Promise.all([
      supabase.from("activities").select("*").order("order_num"),
      supabase.from("profiles").select("user_id, full_name, community, area, birth_date, phone"),
      supabase.auth.getUser(),
    ]);

    const myId = userResult.data.user?.id ?? "";
    const profilesList = (profilesData ?? []).filter(p => p.user_id !== myId);
    const { data: progressData } = await supabase.from("user_progress").select("user_id, activity_id");

    const participantList: Participant[] = profilesList.map((p) => {
      const userProgress = (progressData ?? []).filter((pr) => pr.user_id === p.user_id);
      return { ...p, completed_count: userProgress.length, completed_activity_ids: userProgress.map((pr) => pr.activity_id) };
    });

    setActivities(activitiesData ?? []);
    setParticipants(participantList);
    await fetchPlans(participantList.map(p => p.user_id));
    setLoading(false);
  }

  // Navigate to discipleship tab and highlight a specific participant (from Overview alerts)
  function handleSelectParticipantFromOverview(participant: Participant) {
    setHighlightedParticipant(participant);
    setActiveTab("attendance");
  }

  // Filter participants by selected area and community
  const areaFilteredParticipants = selectedArea && selectedArea !== "todas"
    ? participants.filter(p => p.area === selectedArea)
    : participants;
  const filteredParticipants = selectedCommunity && selectedCommunity !== "todas"
    ? areaFilteredParticipants.filter(p => p.community === selectedCommunity)
    : areaFilteredParticipants;

  const stats = {
    total: filteredParticipants.length,
    avancados: filteredParticipants.filter(p => activities.length > 0 && p.completed_count / activities.length >= 0.7).length,
    semAtividade: filteredParticipants.filter(p => p.completed_count === 0).length,
    mediaProgresso: filteredParticipants.length > 0
      ? Math.round(filteredParticipants.reduce((s, p) => s + (activities.length > 0 ? (p.completed_count / activities.length) * 100 : 0), 0) / filteredParticipants.length)
      : 0,
  };

  // Area selector for super admins
  if (isSuper && !selectedArea) {
    return (
      <div className="min-h-screen bg-background">
        <header className="px-4 pt-8 pb-6" style={{ background: "var(--gradient-hero)" }}>
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-primary-foreground/70 font-inter text-xs mb-3 hover:text-primary-foreground transition-colors"
            >
              <span className="text-sm">←</span> Voltar para área geral
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center">
                <span className="text-xl">👑</span>
              </div>
              <div>
                <p className="text-primary-foreground/60 font-inter text-xs">Super Administrador</p>
                <h1 className="font-montserrat font-black text-primary-foreground text-lg">Selecione a Turma</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 animate-pulse">
                <span className="text-2xl">✝️</span>
              </div>
              <p className="text-muted-foreground font-inter text-sm">Carregando painel...</p>
            </div>
          ) : (
            <>
              <p className="text-center text-muted-foreground font-inter text-xs">Escolha uma área para gerenciar</p>
              {/* All areas option */}
              <button
                onClick={() => { setSelectedArea("todas"); setSelectedCommunity("todas"); }}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border-2 border-primary/20 shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
                  <span className="text-2xl">🌍</span>
                </div>
                <div className="text-left flex-1">
                  <p className="font-montserrat font-bold text-foreground text-sm">Todas as Áreas</p>
                  <p className="text-muted-foreground font-inter text-xs mt-0.5">
                    {participants.length} participantes · Visão completa
                  </p>
                </div>
                <span className="text-muted-foreground text-sm">→</span>
              </button>
              {/* Area 1 */}
              {(["Área 1", "Área 2"] as const).map(area => {
                const areaParticipants = participants.filter(p => p.area === area);
                const num = area === "Área 1" ? "1" : "2";
                return (
                  <button
                    key={area}
                    onClick={() => { setSelectedArea(area); setSelectedCommunity("todas"); }}
                    className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                      <span className="text-2xl">{num === "1" ? "⛪" : "✝️"}</span>
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-montserrat font-bold text-foreground text-sm">Área {num} · {currentYear}</p>
                      <p className="text-muted-foreground font-inter text-xs mt-0.5">
                        {areaParticipants.length} participantes
                      </p>
                    </div>
                    <span className="text-muted-foreground text-sm">→</span>
                  </button>
                );
              })}
            </>
          )}
        </main>
      </div>
    );
  }

  // Community selector screen (for non-super or after area selection)
  if (!selectedCommunity) {
    return (
      <div className="min-h-screen bg-background">
        <header className="px-4 pt-8 pb-6" style={{ background: "var(--gradient-hero)" }}>
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => isSuper ? setSelectedArea(null) : navigate("/")}
              className="flex items-center gap-1.5 text-primary-foreground/70 font-inter text-xs mb-3 hover:text-primary-foreground transition-colors"
            >
              <span className="text-sm">←</span> {isSuper ? "Voltar para seleção de área" : "Voltar para área geral"}
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center">
                <span className="text-xl">{isSuper ? "👑" : "✝️"}</span>
              </div>
              <div>
                <p className="text-primary-foreground/60 font-inter text-xs">{isSuper ? "Super Administrador" : "Painel do Administrador"}</p>
                <h1 className="font-montserrat font-black text-primary-foreground text-lg">{turmaName}</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 animate-pulse">
                <span className="text-2xl">✝️</span>
              </div>
              <p className="text-muted-foreground font-inter text-sm">Carregando painel...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <p className="font-montserrat font-bold text-foreground text-base">Selecione a turma</p>
                <p className="text-muted-foreground font-inter text-xs mt-1">Escolha uma comunidade da <strong>{turmaName}</strong></p>
              </div>

              {/* All communities option */}
              {(() => {
                const filteredByArea = selectedArea && selectedArea !== "todas" 
                  ? participants.filter(p => p.area === selectedArea)
                  : participants;
                const totalAlerts = filteredByArea.filter(p => plans[p.user_id]?.is_priority || plans[p.user_id]?.needs_pastor).length;
                const noActivity = filteredByArea.filter(p => p.completed_count === 0).length;
                const avgProgress = filteredByArea.length > 0 && activities.length > 0
                  ? Math.round(filteredByArea.reduce((s, p) => s + (p.completed_count / activities.length) * 100, 0) / filteredByArea.length)
                  : 0;
                return (
                  <button
                    onClick={() => setSelectedCommunity("todas")}
                    className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border-2 border-primary/20 shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-montserrat font-bold text-foreground text-sm">{turmaName} — Todas</p>
                      <p className="text-muted-foreground font-inter text-xs mt-0.5">
                        {filteredByArea.length} participante{filteredByArea.length !== 1 ? "s" : ""} · Visão geral
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${avgProgress}%`, background: "var(--gradient-hero)" }} />
                        </div>
                        <span className="text-[10px] font-montserrat font-bold text-primary">{avgProgress}%</span>
                      </div>
                      {(totalAlerts > 0 || noActivity > 0) && (
                        <div className="flex gap-2 mt-1">
                          {totalAlerts > 0 && (
                            <span className="text-[10px] font-inter font-medium text-destructive bg-destructive/10 rounded-full px-2 py-0.5">
                              ⚠️ {totalAlerts} alerta{totalAlerts !== 1 ? "s" : ""}
                            </span>
                          )}
                          {noActivity > 0 && (
                            <span className="text-[10px] font-inter font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                              😴 {noActivity} sem atividade
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-muted-foreground text-sm">→</span>
                  </button>
                );
              })()}

            </div>
          )}
        </main>
      </div>
    );
  }

  const displayTurma = isSuper ? `👑 ${turmaName}` : turmaName;
  const displaySubtitle = selectedCommunity === "todas" ? null : selectedCommunity;
  const displayParticipants = filteredParticipants;

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        areaName={displayTurma}
        subtitle={displaySubtitle}
        stats={stats}
        onSignOut={signOut}
        onBackToUser={() => navigate("/")}
        selectedCommunity={selectedCommunity}
        onChangeCommunity={() => {
          if (isSuper) {
            setSelectedCommunity(null);
            setSelectedArea(null);
          } else {
            setSelectedCommunity(null);
          }
        }}
      />

      <main className="max-w-2xl mx-auto px-4 py-5 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 animate-pulse">
              <span className="text-2xl">✝️</span>
            </div>
            <p className="text-muted-foreground font-inter text-sm">Carregando painel...</p>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <OverviewTab
                participants={displayParticipants}
                activities={activities}
                plans={plans}
                onSelectParticipant={handleSelectParticipantFromOverview}
              />
            )}
            {activeTab === "attendance" && (
              <AttendanceTab
                participants={displayParticipants}
                activities={activities}
                communities={communities}
                initialParticipant={highlightedParticipant}
                onClearInitial={() => setHighlightedParticipant(null)}
                adminArea={selectedArea ?? areaName}
              />
            )}
            {activeTab === "courses" && <CoursesTab />}
            {/* messages tab removed — now inside AttendanceTab as "Avisos" sub-tab */}
            {activeTab === "users" && <UsersTab onSelectTurma={(turma) => {
              if (turma.area) {
                setSelectedArea(turma.area);
                setSelectedCommunity("todas");
                setActiveTab("overview");
              }
            }} />}
          </>
        )}
      </main>

      <AdminBottomNav active={activeTab} onChange={setActiveTab} userRole={role as "admin" | "lider" | null} />
    </div>
  );
}
