import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import HeroHeader from "@/components/home/HeroHeader";
import MissionCard from "@/components/home/MissionCard";
import JourneyPath from "@/components/home/JourneyPath";
import AchievementsGrid from "@/components/home/AchievementsGrid";
import DiscipleProfile from "@/components/home/DiscipleProfile";
import CommunityTab from "@/components/home/CommunityTab";
import BottomNav, { type Tab } from "@/components/home/BottomNav";

const streakDays = 5;
const faithPoints = 120;
const faithLevel = 3;
const faithEnergy = 4;
const completedCount = 2;

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("jornada");
  const { profile, role } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (role === "admin") navigate("/admin", { replace: true });
  }, [role, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {/* Hero header — always visible */}
      <HeroHeader
        streakDays={streakDays}
        faithPoints={faithPoints}
        faithLevel={faithLevel}
        faithEnergy={faithEnergy}
      />

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto pb-24">

        {/* ===== JORNADA ===== */}
        {activeTab === "jornada" && (
          <>
            <MissionCard />
            <JourneyPath />
          </>
        )}

        {/* ===== CONQUISTAS ===== */}
        {activeTab === "conquistas" && (
          <div className="pt-4">
            <div className="px-5 mb-4">
              <h2 className="font-montserrat font-black text-foreground text-xl">🏆 Conquistas</h2>
              <p className="text-muted-foreground text-sm font-inter mt-1">Suas medalhas da fé</p>
            </div>
            <AchievementsGrid />
          </div>
        )}

        {/* ===== AGENDA ===== */}
        {activeTab === "agenda" && (
          <div className="px-5 pt-5">
            <h2 className="font-montserrat font-black text-foreground text-xl mb-4">📅 Agenda</h2>
            <div className="bg-card rounded-2xl border border-border p-6 text-center shadow-sm">
              <span className="text-4xl block mb-3">📅</span>
              <p className="font-montserrat font-bold text-card-foreground text-base mb-1">Em breve</p>
              <p className="text-muted-foreground text-sm font-inter">Os próximos encontros e eventos aparecerão aqui.</p>
            </div>
          </div>
        )}

        {/* ===== COMUNIDADE ===== */}
        {activeTab === "comunidade" && <CommunityTab />}

        {/* ===== PERFIL ===== */}
        {activeTab === "perfil" && (
          <div className="pt-5">
            <div className="px-5 mb-4">
              <h2 className="font-montserrat font-black text-foreground text-xl">👤 Meu Perfil</h2>
            </div>
            <DiscipleProfile
              faithPoints={faithPoints}
              faithLevel={faithLevel}
              streakDays={streakDays}
              completedCount={completedCount}
              community={profile?.community}
              area={profile?.area}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
