import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminBottomNav, { AdminTab } from "@/components/admin/AdminBottomNav";
import OverviewTab from "@/components/admin/tabs/OverviewTab";
import ParticipantsTab from "@/components/admin/tabs/ParticipantsTab";
import CoursesTab from "@/components/admin/tabs/CoursesTab";
import AgendaTab from "@/components/admin/tabs/AgendaTab";
import MessagesTab from "@/components/admin/tabs/MessagesTab";
import AdminDiscipleshipTab from "@/components/admin/tabs/AdminDiscipleshipTab";
import ClassroomSettingsTab from "@/components/admin/tabs/ClassroomSettingsTab";
import AttendanceTab from "@/components/admin/tabs/AttendanceTab";
import UsersTab from "@/components/admin/tabs/UsersTab";

const AREA_1_COMMUNITIES = ["Rincão Frente", "Rincão Fundo", "Bom Pastor", "Iriá Pira 1"];
const AREA_2_COMMUNITIES = ["Martim Lutero", "Linha Brasil", "Iriá Pira 2"];

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
  const { profile, role, signOut } = useAuth();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [plans, setPlans] = useState<Record<string, PlanInfo>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  // For navigating from overview to discipleship sheet
  const [highlightedParticipant, setHighlightedParticipant] = useState<Participant | null>(null);

  const areaName = profile?.area ?? "";
  const communities = areaName === "Área 1" ? AREA_1_COMMUNITIES : AREA_2_COMMUNITIES;

  useEffect(() => {
    if (role !== "admin") { navigate("/"); return; }
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
    setActiveTab("discipleship");
  }

  const stats = {
    total: participants.length,
    avancados: participants.filter(p => activities.length > 0 && p.completed_count / activities.length >= 0.7).length,
    semAtividade: participants.filter(p => p.completed_count === 0).length,
    mediaProgresso: participants.length > 0
      ? Math.round(participants.reduce((s, p) => s + (activities.length > 0 ? (p.completed_count / activities.length) * 100 : 0), 0) / participants.length)
      : 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader areaName={areaName} stats={stats} onSignOut={signOut} onBackToUser={() => navigate("/")} />

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
                participants={participants}
                activities={activities}
                plans={plans}
                onSelectParticipant={handleSelectParticipantFromOverview}
              />
            )}
            {activeTab === "participants" && (
              <ParticipantsTab participants={participants} activities={activities} communities={communities} />
            )}
            {activeTab === "courses" && <CoursesTab />}
            {activeTab === "agenda" && <AgendaTab />}
            {activeTab === "messages" && <MessagesTab />}
            {activeTab === "sala" && <ClassroomSettingsTab />}
            {activeTab === "attendance" && <AttendanceTab participants={participants} />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "discipleship" && (
              <AdminDiscipleshipTab
                participants={participants}
                activities={activities}
                initialParticipant={highlightedParticipant}
                onClearInitial={() => setHighlightedParticipant(null)}
              />
            )}
          </>
        )}
      </main>

      <AdminBottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
