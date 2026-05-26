import { useState, useEffect, lazy, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, Church, Lock, Eye, EyeOff, X } from "lucide-react";
import { motion } from "framer-motion";

import HeroHeader from "@/components/home/HeroHeader";
import AnnouncementsSection from "@/components/home/AnnouncementsSection";
import FocusSection from "@/components/home/FocusSection";
import JourneyPath from "@/components/home/JourneyPath";
import DiscipleProfile from "@/components/home/DiscipleProfile";
import EditProfileForm from "@/components/home/EditProfileForm";
import NextMeetingCard from "@/components/home/NextMeetingCard";
import NotificationSettings from "@/components/home/NotificationSettings";
import InstallAppCard from "@/components/home/InstallAppCard";
import TypingMetricsPanel from "@/components/home/TypingMetricsPanel";
import PushActivationBanner from "@/components/home/PushActivationBanner";
import WhatsAppBlockedBanner from "@/components/home/WhatsAppBlockedBanner";
import RemindersSection from "@/components/home/RemindersSection";
import PersonalizedGreeting from "@/components/home/PersonalizedGreeting";
import BirthdayHighlights from "@/components/home/BirthdayHighlights";
import BottomNav, { type Tab } from "@/components/home/BottomNav";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStats } from "@/hooks/useUserStats";
import { useAppNotifications } from "@/hooks/useAppNotifications";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";
import { supabase } from "@/integrations/supabase/client";
import CelebrationModal, { type CelebrationType } from "@/components/gamification/CelebrationModal";
import NextCourseActivityCard from "@/components/home/NextCourseActivityCard";

// Lazy load tab contents for better performance
const CommunityTab = lazy(() => import("@/components/home/CommunityTab"));
const DiscipleshipTab = lazy(() => import("@/components/home/DiscipleshipTab"));
const UserAgendaTab = lazy(() => import("@/components/home/UserAgendaTab"));
const AchievementsGrid = lazy(() => import("@/components/home/AchievementsGrid"));
const WorshipPlayerSection = lazy(() => import("@/components/home/WorshipPlayerSection"));


type ProfileSubTab = "meu-perfil" | "minha-jornada" | "configuracoes";
type LessonNavigationMode = "choice" | "devotional";
type CelebrationItem = { type: CelebrationType; points?: number };

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("jornada");
  const [targetLessonId, setTargetLessonId] = useState<string | null>(null);
  const [targetLessonMode, setTargetLessonMode] = useState<LessonNavigationMode>("choice");
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>("meu-perfil");
  
  // Change password modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError(null);
    if (newPassword.length < 6) { setPwdError("A senha deve ter pelo menos 6 caracteres."); return; }
    if (newPassword !== confirmPassword) { setPwdError("As senhas não coincidem."); return; }
    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwdLoading(false);
    if (error) { setPwdError("Erro ao salvar: " + error.message); return; }
    setPwdSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => { setShowChangePassword(false); setPwdSuccess(false); }, 2000);
  }

  // Celebration queue/lock logic
  const [celebrationQueue, setCelebrationQueue] = useState<CelebrationItem[]>([]);
  const [currentCelebration, setCurrentCelebration] = useState<CelebrationItem | null>(null);
  const [showConfettiPref, setShowConfettiPref] = useState(true);

  const { profile, role, user, loading: authLoading } = useAuth();
  const { effectiveArea } = useAreaSwitch();
  const currentArea = effectiveArea || profile?.area || "";
  const navigate = useNavigate();

  // Redirect to presentation if not standalone/installed and not logged in
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (!isStandalone && !authLoading && !user) {
      navigate("/apresentacao", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const stats = useUserStats(user?.id, profile?.church_id, currentArea);
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
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin mb-3 opacity-20" />
            <p className="text-xs font-medium tracking-widest uppercase">Carregando</p>
          </div>
        }>

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

        {/* ===== ADORAÇÃO ===== */}
        {activeTab === "adoracao" && (
          <div className="px-5 pt-6">
            <WorshipPlayerSection />
          </div>
        )}

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
              <h2 className="font-montserrat font-black text-foreground text-xl">👤 Perfil do Discipulador</h2>
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
                
                {/* My Church Link for Admins */}
                {(role === "admin" || role === "lider") && (
                  <div className="px-5 mt-3">
                    <button
                      onClick={() => navigate("/minha-igreja")}
                      className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-green/10">
                        <Church className="w-5 h-5 text-brand-green" />
                      </div>
                      <div className="text-left">
                        <p className="font-montserrat font-bold text-foreground text-sm">
                          Minha Igreja
                        </p>
                        <p className="text-muted-foreground text-xs font-inter">
                          Assinatura, faturas e dados da instituição
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

                {/* Mudar senha */}
                <div className="px-5">
                  <button
                    onClick={() => { setShowChangePassword(true); setPwdError(null); setPwdSuccess(false); }}
                    className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/10">
                      <Lock className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="text-left">
                      <p className="font-montserrat font-bold text-foreground text-sm">Mudar senha</p>
                      <p className="text-muted-foreground text-xs font-inter">Alterar a senha da sua conta</p>
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
        </Suspense>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm bg-card rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-montserrat font-black text-foreground text-lg">Mudar senha</h2>
              <button onClick={() => setShowChangePassword(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {pwdSuccess ? (
              <div className="text-center py-4">
                <p className="font-montserrat font-bold text-brand-green text-base">Senha alterada com sucesso!</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Nova senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showNewPwd ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                      required
                    />
                    <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-foreground mb-1.5">Confirmar nova senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="w-full pl-10 pr-11 py-3 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {pwdError && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
                    <p className="text-destructive font-inter text-sm">{pwdError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="w-full py-3.5 rounded-xl font-montserrat font-bold text-primary-foreground text-base transition-all active:scale-95 disabled:opacity-60 shadow-md"
                  style={{ background: "var(--gradient-orange)" }}
                >
                  {pwdLoading ? "Salvando..." : "Salvar nova senha"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

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
