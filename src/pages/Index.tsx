import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import HeroHeader from "@/components/home/HeroHeader";
import NextCourseActivityCard from "@/components/home/NextCourseActivityCard";
import MissionCard from "@/components/home/MissionCard";
import JourneyPath from "@/components/home/JourneyPath";
import AchievementsGrid from "@/components/home/AchievementsGrid";
import DiscipleProfile from "@/components/home/DiscipleProfile";
import EditProfileForm from "@/components/home/EditProfileForm";
import CommunityTab from "@/components/home/CommunityTab";
import DiscipleshipTab from "@/components/home/DiscipleshipTab";
import DevotionalReminder from "@/components/home/DevotionalReminder";
import UpcomingEventReminder from "@/components/home/UpcomingEventReminder";
import NextMeetingCard from "@/components/home/NextMeetingCard";
import StreakRiskReminder from "@/components/home/StreakRiskReminder";
import UserAgendaTab from "@/components/home/UserAgendaTab";
import NotificationSettings from "@/components/home/NotificationSettings";
import InstallAppCard from "@/components/home/InstallAppCard";
import BottomNav, { type Tab } from "@/components/home/BottomNav";
import { useUserStats } from "@/hooks/useUserStats";
import { useAppNotifications } from "@/hooks/useAppNotifications";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("jornada");
  const [targetLessonId, setTargetLessonId] = useState<string | null>(null);
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const stats = useUserStats();
  useAppNotifications();

  // Listen for lesson navigation from agenda
  useEffect(() => {
    const handler = (e: Event) => {
      const lessonId = (e as CustomEvent).detail?.lessonId;
      if (lessonId) {
        setTargetLessonId(lessonId);
        setActiveTab("discipulado");
      }
    };
    window.addEventListener("navigate-to-lesson", handler);
    return () => window.removeEventListener("navigate-to-lesson", handler);
  }, []);

  // Activity completion is now handled by the real tracking tables
  // (lesson_responses, devotional_progress, attendance, worship_attendance)
  // Not by the legacy user_progress table

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
            {/* Cabeçalho explicativo */}
            <div className="px-5 pt-4 pb-1">
              <p className="text-muted-foreground font-inter text-xs leading-relaxed">
                ✨ Complete atividades para ganhar pontos e avançar na sua jornada de fé
              </p>
            </div>

            {/* Avisos rápidos — agrupados */}
            <div className="space-y-0">
              <DevotionalReminder onNavigateToDiscipulado={() => setActiveTab("discipulado")} />
              <UpcomingEventReminder onNavigateToAgenda={() => setActiveTab("agenda")} />
              <StreakRiskReminder onNavigateToJornada={() => setActiveTab("discipulado")} />
            </div>

            {/* Indicador de impacto espiritual */}
            {(() => {
              const indicators = [];
              if (stats.faithLevel >= 3) indicators.push("✨ Você está crescendo");
              if (stats.streakDays >= 3) indicators.push("✨ Em constância");
              if (stats.faithEnergy >= 3) indicators.push("✨ Em comunhão");
              if (indicators.length === 0) indicators.push("🌱 Comece sua jornada!");
              return (
                <div className="px-5 mb-2">
                  <div className="flex flex-wrap gap-2">
                    {indicators.map((text, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary font-inter text-xs font-semibold">
                        {text}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Próximo encontro */}
            <NextMeetingCard onNavigateToAgenda={() => setActiveTab("agenda")} />

            {/* Próxima etapa do curso ativo */}
            <NextCourseActivityCard onNavigateToDiscipulado={() => setActiveTab("discipulado")} />

            {/* Caminho da jornada */}
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
        {activeTab === "discipulado" && (
          <DiscipleshipTab
            targetLessonId={targetLessonId}
            onTargetLessonConsumed={() => setTargetLessonId(null)}
          />
        )}

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

            {/* Notificações */}
            <NotificationSettings />

            {/* Banner instalar app */}
            <InstallAppCard />

            {/* Admin/Líder access */}
            {(role === "admin" || role === "lider") && (
              <div className="px-5 mt-3">
                <button
                  onClick={() => navigate("/admin")}
                  className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
                    <ShieldCheck className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-montserrat font-bold text-foreground text-sm">
                      {role === "admin" ? "Área do Administrador" : "Área do Líder"}
                    </p>
                    <p className="text-muted-foreground text-xs font-inter">
                      {role === "admin" ? "Gerenciar participantes e conteúdo" : "Gerenciar cursos e usuários"}
                    </p>
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
