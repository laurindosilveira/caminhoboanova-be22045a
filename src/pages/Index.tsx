import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import HeroHeader from "@/components/home/HeroHeader";
import MissionCard from "@/components/home/MissionCard";
import JourneyPath from "@/components/home/JourneyPath";
import AchievementsGrid from "@/components/home/AchievementsGrid";
import DiscipleProfile from "@/components/home/DiscipleProfile";
import EditProfileForm from "@/components/home/EditProfileForm";
import CommunityTab from "@/components/home/CommunityTab";
import DiscipleshipTab from "@/components/home/DiscipleshipTab";
import UserAgendaTab from "@/components/home/UserAgendaTab";
import BottomNav, { type Tab } from "@/components/home/BottomNav";
import { useUserStats } from "@/hooks/useUserStats";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("jornada");
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const stats = useUserStats();

  async function handleCompleteActivity(activityId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_progress").insert({
      user_id: user.id,
      activity_id: activityId,
    });
    // Reload stats
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {/* Hero header — always visible */}
      <HeroHeader
        streakDays={stats.streakDays}
        faithPoints={stats.faithPoints}
        faithLevel={stats.faithLevel}
        faithEnergy={stats.faithEnergy}
      />

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto pb-24">

        {/* ===== JORNADA ===== */}
        {activeTab === "jornada" && (
          <>
            <MissionCard
              nextActivity={stats.nextActivity}
              completedCount={stats.completedCount}
              totalActivities={stats.totalActivities}
              onComplete={handleCompleteActivity}
            />
            <JourneyPath />
          </>
        )}

        {/* ===== CONQUISTAS ===== */}
        {activeTab === "conquistas" && (
          <div className="pt-4">
            <AchievementsGrid
              faithPoints={stats.faithPoints}
              streakDays={stats.streakDays}
              completedCount={stats.completedCount}
            />
          </div>
        )}

        {/* ===== AGENDA ===== */}
        {activeTab === "agenda" && <UserAgendaTab />}

        {/* ===== COMUNIDADE ===== */}
        {activeTab === "comunidade" && <CommunityTab />}

        {/* ===== DISCIPULADO ===== */}
        {activeTab === "discipulado" && <DiscipleshipTab />}

        {/* ===== PERFIL ===== */}
        {activeTab === "perfil" && (
          <div className="pt-5 pb-4">
            <div className="px-5 mb-4">
              <h2 className="font-montserrat font-black text-foreground text-xl">👤 Meu Perfil</h2>
            </div>
            <DiscipleProfile
              faithPoints={stats.faithPoints}
              faithLevel={stats.faithLevel}
              streakDays={stats.streakDays}
              completedCount={stats.completedCount}
              community={profile?.community}
              area={profile?.area}
            />

            {/* Edição de dados pessoais */}
            <EditProfileForm />

            {/* Admin access — somente visível para admins */}
            {role === "admin" && (
              <div className="px-5 mt-3">
                <button
                  onClick={() => navigate("/admin")}
                  className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
                    <ShieldCheck className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-montserrat font-bold text-foreground text-sm">Área do Administrador</p>
                    <p className="text-muted-foreground text-xs font-inter">Gerenciar participantes e conteúdo</p>
                  </div>
                  <span className="ml-auto text-muted-foreground text-xs">→</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
