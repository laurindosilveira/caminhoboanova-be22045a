import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, BarChart3, CalendarDays, MessageSquare, Megaphone, ChevronDown, ChevronUp } from "lucide-react";
import StudentListSection from "@/components/home/StudentListSection";
import OverviewTab from "@/components/admin/tabs/OverviewTab";
import AttendanceTab from "@/components/admin/tabs/AttendanceTab";
import MessagesTab from "@/components/admin/tabs/MessagesTab";
import AdminPushTab from "@/components/admin/tabs/AdminPushTab";

const AREA_1_COMMUNITIES = ["Rincão Frente", "Rincão Fundo", "Bom Pastor", "Iriá Pira 1"];
const AREA_2_COMMUNITIES = ["Martim Lutero", "Linha Brasil", "Iriá Pira 2"];
const ALL_COMMUNITIES = [...AREA_1_COMMUNITIES, ...AREA_2_COMMUNITIES];

type Activity = {
  id: string; type: string; title: string; subtitle: string | null; order_num: number; points: number;
};
type Participant = {
  user_id: string; full_name: string; community: string; area: string;
  birth_date: string; phone: string; completed_count: number; completed_activity_ids: string[];
  confirmation_year?: number | null;
};
type PlanInfo = { health_status: string; is_priority: boolean; needs_pastor?: boolean };
type Turma = { id: string; name: string; area: string | null };

type SubTab = "alunos" | "visao" | "encontros" | "avisos" | "push";

const SUB_TABS: { id: SubTab; label: string; icon: typeof Users }[] = [
  { id: "alunos", label: "Alunos", icon: Users },
  { id: "visao", label: "Visão", icon: BarChart3 },
  { id: "encontros", label: "Encontros", icon: CalendarDays },
  { id: "avisos", label: "Avisos", icon: MessageSquare },
  { id: "push", label: "Push", icon: Megaphone },
];

export default function LeaderRoomSection() {
  const { profile, role } = useAuth();
  const canView = role === "admin" || role === "lider";

  const [expanded, setExpanded] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("alunos");
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [plans, setPlans] = useState<Record<string, PlanInfo>>({});
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

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
    if (!profile?.turma_id) return;
    setLoading(true);

    const [{ data: activitiesData }, { data: profilesData }, userResult, { data: turmasData }] = await Promise.all([
      supabase.from("activities").select("*").order("order_num"),
      supabase.from("profiles").select("user_id, full_name, community, area, birth_date, phone, turma_id, confirmation_year")
        .eq("turma_id", profile.turma_id),
      supabase.auth.getUser(),
      supabase.from("turmas").select("id, name, area").eq("is_active", true),
    ]);

    const myId = userResult.data.user?.id ?? "";
    const profilesList = (profilesData ?? []).filter(p => p.user_id !== myId);
    const { data: progressData } = await supabase.from("user_progress").select("user_id, activity_id");

    const participantList: Participant[] = profilesList.map((p) => {
      const userProgress = (progressData ?? []).filter((pr) => pr.user_id === p.user_id);
      return {
        ...p,
        completed_count: userProgress.length,
        completed_activity_ids: userProgress.map((pr) => pr.activity_id),
        turma_id: p.turma_id,
      } as any;
    });

    setActivities(activitiesData ?? []);
    setParticipants(participantList);
    setTurmas(turmasData ?? []);
    await fetchPlans(participantList.map(p => p.user_id));
    setLoading(false);
    setDataLoaded(true);
  }

  useEffect(() => {
    if (expanded && !dataLoaded && canView) {
      fetchData();
    }
  }, [expanded, dataLoaded, canView]);

  if (!canView) return null;

  const turmaArea = profile?.area ?? "";
  const communities = turmaArea === "Área 1" ? AREA_1_COMMUNITIES
    : turmaArea === "Área 2" ? AREA_2_COMMUNITIES
    : ALL_COMMUNITIES;

  return (
    <div className="mx-5">
      {/* Collapsible header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between bg-card border border-border rounded-2xl p-4 shadow-sm hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
            <span className="text-lg">📋</span>
          </div>
          <div className="text-left">
            <p className="font-montserrat font-bold text-foreground text-sm">Sala do Discipulador</p>
            <p className="text-muted-foreground text-xs font-inter">
              {expanded ? "Toque para fechar" : "Gerencie sua turma"}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
          {/* Sub-tab navigation */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-3 scrollbar-hide">
            {SUB_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-inter font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-muted-foreground text-sm font-inter animate-pulse">Carregando dados...</p>
            </div>
          ) : (
            <>
              {activeSubTab === "alunos" && <StudentListSection />}

              {activeSubTab === "visao" && (
                <OverviewTab
                  participants={participants}
                  activities={activities}
                  plans={plans}
                  onSelectParticipant={() => setActiveSubTab("encontros")}
                />
              )}

              {activeSubTab === "encontros" && (
                <AttendanceTab
                  participants={participants}
                  activities={activities}
                  communities={communities}
                  adminArea={turmaArea}
                />
              )}

              {activeSubTab === "avisos" && <MessagesTab />}

              {activeSubTab === "push" && <AdminPushTab turmas={turmas} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
