import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import HeroHeader from "@/components/home/HeroHeader";
import AnnouncementsSection from "@/components/home/AnnouncementsSection";
import FocusSection from "@/components/home/FocusSection";
import JourneyPath from "@/components/home/JourneyPath";
import AchievementsGrid from "@/components/home/AchievementsGrid";
import DiscipleProfile from "@/components/home/DiscipleProfile";
import EditProfileForm from "@/components/home/EditProfileForm";
import CommunityTab from "@/components/home/CommunityTab";
import DiscipleshipTab from "@/components/home/DiscipleshipTab";
import NextMeetingCard from "@/components/home/NextMeetingCard";
import UserAgendaTab from "@/components/home/UserAgendaTab";
import NotificationSettings from "@/components/home/NotificationSettings";
import InstallAppCard from "@/components/home/InstallAppCard";
import TypingMetricsPanel from "@/components/home/TypingMetricsPanel";
import PushActivationBanner from "@/components/home/PushActivationBanner";
import WhatsAppBlockedBanner from "@/components/home/WhatsAppBlockedBanner";
import RemindersSection from "@/components/home/RemindersSection";
import PersonalizedGreeting from "@/components/home/PersonalizedGreeting";
import BirthdayHighlights from "@/components/home/BirthdayHighlights";
import BottomNav, { type Tab } from "@/components/home/BottomNav";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStats } from "@/hooks/useUserStats";
import { useAppNotifications } from "@/hooks/useAppNotifications";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";
import CelebrationModal, { type CelebrationType } from "@/components/gamification/CelebrationModal";
import WorshipPlayerSection from "@/components/home/WorshipPlayerSection";


type ProfileSubTab = "meu-perfil" | "minha-jornada" | "configuracoes";
type LessonNavigationMode = "choice" | "devotional";
type CelebrationItem = { type: CelebrationType; points?: number };

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("jornada");
  const [targetLessonId, setTargetLessonId] = useState<string | null>(null);
  const [targetLessonMode, setTargetLessonMode] = useState<LessonNavigationMode>("choice");
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>("meu-perfil");
  
  // Celebration queue/lock logic
  const [celebrationQueue, setCelebrationQueue] = useState<CelebrationItem[]>([]);
  const [currentCelebration, setCurrentCelebration] = useState<CelebrationItem | null>(null);
  const [showConfettiPref, setShowConfettiPref] = useState(true);

  const { profile, role, user } = useAuth();
  const { effectiveArea } = useAreaSwitch();
  const currentArea = effectiveArea || profile?.area || "";
  const navigate = useNavigate();
  const stats = useUserStats(currentArea);
  useAppNotifications();

  // Load confetti preference
  useEffect(() => {
    const saved = localStorage.getItem("caminho_show_confetti");
    if (saved !== null) setShowConfettiPref(saved === "true");
  }, []);

  // Sync preference with localStorage if changed elsewhere
  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem("caminho_show_confetti");
      if (saved !== null) setShowConfettiPref(saved === "true");
    };
    window.addEventListener("storage", handler);
    window.addEventListener("confetti-pref-updated", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("confetti-pref-updated", handler);
    };
  }, []);

  // Handle celebration queue
  useEffect(() => {
    if (!currentCelebration && celebrationQueue.length > 0) {
      const next = celebrationQueue[0];
      setCurrentCelebration(next);
      setCelebrationQueue(prev => prev.slice(1));
    }
  }, [celebrationQueue, currentCelebration]);

  // Listen for lesson navigation and celebrations
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const lessonId = (e as CustomEvent).detail?.lessonId;
      const mode = (e as CustomEvent).detail?.mode as LessonNavigationMode | undefined;
      if (lessonId) {
        setTargetLessonId(lessonId);
        setTargetLessonMode(mode === "devotional" ? "devotional" : "choice");
        setActiveTab("discipulado");
      }
    };

    const handleCelebration = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type) {
        setCelebrationQueue(prev => [...prev, { type: detail.type, points: detail.points }]);
      }
    };

    window.addEventListener("navigate-to-lesson", handleNavigate);
    window.addEventListener("show-celebration", handleCelebration);
    return () => {
      window.removeEventListener("navigate-to-lesson", handleNavigate);
      window.removeEventListener("show-celebration", handleCelebration);
    };
  }, []);

  // Check for streak milestones when stats update
  useEffect(() => {
    if (stats.loading || !user) return;
    
    // Use user ID and area in the key for multi-device/multi-area persistence
    const today = new Date().toDateString();
    const milestoneKey = `milestone_${user.id}_${currentArea}_${today}_${stats.streakDays}`;
    const alreadyShown = localStorage.getItem(milestoneKey);
    
    if (!alreadyShown) {
      if (stats.streakDays === 3 || stats.streakDays === 7 || stats.streakDays === 30) {
        const type: CelebrationType = stats.streakDays === 3 ? "streak_3" : stats.streakDays === 7 ? "streak_7" : "streak_30";
        
        const timer = setTimeout(() => {
          setCelebrationQueue(prev => [...prev, { type }]);
          localStorage.setItem(milestoneKey, "true");
        }, 1500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [stats.streakDays, stats.loading, user, currentArea]);



  // Activity completion is now handled by the real tracking tables
  // (lesson_responses, devotional_progress, attendance, worship_attendance)
  // Not by the legacy user_progress table

  return (
    <div id="main-content" className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
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
            {/* 1. Alertas Críticos e Notificações (PWA/Push) */}
            <PushActivationBanner />

            {/* 2. Cabeçalho de Foco (Ação Principal do Dia) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="pt-6"
            >
              <FocusSection onNavigateToDiscipulado={() => setActiveTab("discipulado")} />
            </motion.div>

            {/* 3. Saudação e Comunidade (Menos destaque, mais social) */}
            <PersonalizedGreeting />
            
            {/* 4. Eventos e Avisos (Contexto) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <NextMeetingCard onNavigateToAgenda={() => setActiveTab("agenda")} />
              <AnnouncementsSection />
            </motion.div>

            {/* 5. A Jornada (Visualização do Progresso) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-8"
            >
              <JourneyPath onSelectLesson={(lessonId) => {
                setTargetLessonId(lessonId);
                setTargetLessonMode("choice");
                setActiveTab("discipulado");
              }} />
            </motion.div>

            {/* 6. Utilidades e Lembretes (Rodapé da página) */}
            <BirthdayHighlights area={currentArea} variant="journey" />
            <RemindersSection
              onNavigateToDiscipulado={() => setActiveTab("discipulado")}
              onNavigateToAgenda={() => setActiveTab("agenda")}
            />
          </>
        )}

        {/* ===== CONQUISTAS ===== */}
        {activeTab === "conquistas" && (
          <div key={`conquistas-${currentArea}`} className="pt-4">
            <ErrorBoundary
              fallback={
                <div className="px-5 py-6">
                  <div className="rounded-2xl border border-border bg-card p-5 text-center">
                    <h2 className="font-montserrat font-black text-foreground text-lg">Conquistas</h2>
                    <p className="mt-2 text-muted-foreground text-sm font-inter">
                      Ocorreu um erro ao carregar esta aba. Atualize a pagina e tente novamente.
                    </p>
                  </div>
                </div>
              }
            >
              <AchievementsGrid
                faithPoints={stats.faithPoints}
                streakDays={stats.streakDays}
                completedCount={stats.completedCount}
              />
              <TypingMetricsPanel />
            </ErrorBoundary>
          </div>
        )}

        {/* ===== AGENDA ===== */}
        {activeTab === "agenda" && <UserAgendaTab key={`agenda-${currentArea}`} />}

        {/* ===== COMUNIDADE ===== */}
        {activeTab === "comunidade" && <CommunityTab key={`comunidade-${currentArea}`} />}

        {/* ===== DISCIPULADO ===== */}
        {activeTab === "discipulado" && (
          <DiscipleshipTab
            key={`discipulado-${currentArea}`}
            targetLessonId={targetLessonId}
            targetLessonMode={targetLessonMode}
            onTargetLessonConsumed={() => {
              setTargetLessonId(null);
              setTargetLessonMode("choice");
            }}
          />
        )}

        {/* ===== PERFIL ===== */}
        {activeTab === "perfil" && (
          <div key={`perfil-${currentArea}`} className="pt-5 pb-4 space-y-4">
            <div className="px-5">
              <h2 className="font-montserrat font-black text-foreground text-xl">👤 Perfil</h2>
            </div>

            <WhatsAppBlockedBanner
              onNavigateToSettings={() => setProfileSubTab("configuracoes")}
            />

            <div className="px-5">
              <Tabs value={profileSubTab} onValueChange={(value) => setProfileSubTab(value as ProfileSubTab)}>
                <TabsList className="grid w-full grid-cols-3 h-11">
                  <TabsTrigger value="meu-perfil" className="text-[11px] sm:text-xs">Meu Perfil</TabsTrigger>
                  <TabsTrigger value="minha-jornada" className="text-[11px] sm:text-xs">Minha Jornada</TabsTrigger>
                  <TabsTrigger value="configuracoes" className="text-[11px] sm:text-xs">Configurações</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {profileSubTab === "meu-perfil" && (
              <>
                <DiscipleProfile
                  faithPoints={stats.faithPoints}
                  faithLevel={stats.faithLevel}
                  streakDays={stats.streakDays}
                  completedCount={stats.completedCount}
                  community={profile?.community}
                  area={effectiveArea || profile?.area}
                />

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
              </>
            )}

            {profileSubTab === "minha-jornada" && (
              <>
                <NextCourseActivityCard onNavigateToDiscipulado={() => setActiveTab("discipulado")} />
                <JourneyPath onSelectLesson={(lessonId) => {
                  setTargetLessonId(lessonId);
                  setTargetLessonMode("choice");
                  setActiveTab("discipulado");
                }} />
              </>
            )}

            {profileSubTab === "configuracoes" && (
              <>
                <div className="px-5">
                  <button
                    onClick={() => navigate("/exportar-dados")}
                    className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-montserrat font-bold text-foreground text-sm">
                        Privacidade e dados
                      </p>
                      <p className="text-muted-foreground text-xs font-inter">
                        Exportar dados ou registrar solicitacao LGPD
                      </p>
                    </div>
                    <span className="ml-auto text-muted-foreground text-xs">→</span>
                  </button>
                </div>

                {/* Edição de dados pessoais */}
                <EditProfileForm />

                {/* Notificações */}
                <NotificationSettings />
              </>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={!!currentCelebration}
        onClose={() => setCurrentCelebration(null)}
        type={currentCelebration?.type ?? "devotional"}
        points={currentCelebration?.points}
        showConfetti={showConfettiPref}
      />
    </div>
  );
}
