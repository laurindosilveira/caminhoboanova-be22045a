import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import HeroHeader from "@/components/home/HeroHeader";
import AnnouncementsSection from "@/components/home/AnnouncementsSection";
import NextCourseActivityCard from "@/components/home/NextCourseActivityCard";
import JourneyPath from "@/components/home/JourneyPath";
import DiscipleProfile from "@/components/home/DiscipleProfile";
import NextMeetingCard from "@/components/home/NextMeetingCard";
import NotificationSettings from "@/components/home/NotificationSettings";
import InstallAppCard from "@/components/home/InstallAppCard";
import PushActivationBanner from "@/components/home/PushActivationBanner";
import RemindersSection from "@/components/home/RemindersSection";
import BottomNav, { type Tab } from "@/components/home/BottomNav";

const AchievementsGrid = lazy(() => import("@/components/home/AchievementsGrid"));
const EditProfileForm = lazy(() => import("@/components/home/EditProfileForm"));
const CommunityTab = lazy(() => import("@/components/home/CommunityTab"));
const DiscipleshipTab = lazy(() => import("@/components/home/DiscipleshipTab"));
const UserAgendaTab = lazy(() => import("@/components/home/UserAgendaTab"));
const TypingMetricsPanel = lazy(() => import("@/components/home/TypingMetricsPanel"));
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStats } from "@/hooks/useUserStats";
import { useAppNotifications } from "@/hooks/useAppNotifications";

type ProfileSubTab = "meu-perfil" | "minha-jornada" | "configuracoes";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("jornada");
  const [targetLessonId, setTargetLessonId] = useState<string | null>(null);
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>("meu-perfil");
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const stats = useUserStats();
  useAppNotifications();

  const firstName = profile?.full_name?.split(" ")[0] ?? "voce";
  const currentHour = new Date().getHours();
  const greetingPeriod = currentHour < 12 ? "Bom dia" : currentHour < 18 ? "Boa tarde" : "Boa noite";
  const greetingMessage =
    stats.streakDays >= 3
      ? "Sua constancia esta forte. Vale aproveitar esse ritmo hoje."
      : "Escolha um passo simples hoje para ganhar ritmo na jornada.";
  const heroHighlights = [
    { label: "Sequencia", value: `${stats.streakDays} dias` },
    { label: "Nivel", value: `${stats.faithLevel}/5` },
    { label: "Energia", value: `${stats.faithEnergy}/5` },
  ];

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

  return (
    <div id="main-content" className="relative mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <HeroHeader
        streakDays={stats.streakDays}
        faithPoints={stats.faithPoints}
        faithLevel={stats.faithLevel}
        faithEnergy={stats.faithEnergy}
      />

      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === "jornada" && (
          <>
            <PushActivationBanner />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="px-5 pt-4"
            >
              <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-card shadow-[0_18px_48px_-30px_rgba(16,34,82,0.45)]">
                <div
                  className="relative px-5 pb-5 pt-5 text-primary-foreground"
                  style={{ background: "var(--gradient-hero)" }}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-30">
                    <div className="absolute -top-10 right-0 h-28 w-28 rounded-full bg-white/20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-secondary/30 blur-2xl" />
                  </div>

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-inter font-semibold uppercase tracking-[0.12em]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Foco do dia
                      </div>
                      <p className="text-sm font-inter text-primary-foreground/78">
                        {greetingPeriod}, {firstName}
                      </p>
                      <h2 className="mt-1 font-montserrat text-[1.4rem] font-black leading-tight">
                        Mantenha sua jornada em movimento
                      </h2>
                      <p className="mt-2 max-w-[28ch] text-sm font-inter leading-relaxed text-primary-foreground/78">
                        {greetingMessage}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/12 px-3 py-2 text-right backdrop-blur-sm">
                      <p className="text-[10px] font-inter uppercase tracking-[0.14em] text-primary-foreground/60">
                        Pontos da fe
                      </p>
                      <p className="font-montserrat text-2xl font-black text-primary-foreground">{stats.faithPoints}</p>
                    </div>
                  </div>

                  <div className="relative mt-4 grid grid-cols-3 gap-2">
                    {heroHighlights.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur-sm"
                      >
                        <p className="text-[10px] font-inter uppercase tracking-[0.12em] text-primary-foreground/60">
                          {item.label}
                        </p>
                        <p className="mt-1 font-montserrat text-lg font-black text-primary-foreground">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="relative mt-4 flex gap-2">
                    <button
                      onClick={() => setActiveTab("discipulado")}
                      className="flex-1 rounded-2xl bg-white px-4 py-3 text-left text-primary shadow-lg transition-transform active:scale-[0.99]"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>
                          <span className="block text-[11px] font-inter font-semibold uppercase tracking-[0.12em] text-primary/60">
                            Prioridade
                          </span>
                          <span className="mt-0.5 block font-montserrat text-sm font-bold">
                            Abrir discipulado
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("agenda")}
                      className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-primary-foreground backdrop-blur-sm transition-transform active:scale-[0.99]"
                      aria-label="Ir para agenda"
                    >
                      <CalendarDays className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 bg-background px-4 py-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 text-primary">
                      <Heart className="h-4 w-4" />
                      <span className="text-[11px] font-inter font-semibold uppercase tracking-[0.12em]">
                        Ritmo espiritual
                      </span>
                    </div>
                    <p className="mt-2 font-montserrat text-base font-bold text-foreground">
                      {stats.faithEnergy >= 3 ? "Voce esta em boa constancia" : "Hora de retomar o ritmo"}
                    </p>
                    <p className="mt-1 text-xs font-inter leading-relaxed text-muted-foreground">
                      {stats.faithEnergy >= 3
                        ? "Continue com leitura, presenca e devocional para sustentar o crescimento."
                        : "Um passo hoje ja melhora sua energia e sua continuidade na jornada."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3">
                    <div className="flex items-center gap-2 text-secondary">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-[11px] font-inter font-semibold uppercase tracking-[0.12em]">
                        Direcao rapida
                      </span>
                    </div>
                    <p className="mt-2 font-montserrat text-base font-bold text-foreground">
                      {stats.streakDays >= 3 ? "Sua sequencia merece continuidade" : "Construa sua primeira sequencia"}
                    </p>
                    <p className="mt-1 text-xs font-inter leading-relaxed text-muted-foreground">
                      {stats.streakDays >= 3
                        ? "Entre no discipulado antes do fim do dia para nao perder o embalo."
                        : "Abra a proxima etapa e transforme hoje no ponto de partida da semana."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2, ease: "easeOut" }}
              className="mt-6"
            >
              <NextMeetingCard onNavigateToAgenda={() => setActiveTab("agenda")} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
              className="mt-3"
            >
              <div className="mb-2 px-5">
                <p className="text-[11px] font-inter font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Progresso detalhado
                </p>
              </div>
              <JourneyPath />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              className="mt-3"
            >
              <NextCourseActivityCard onNavigateToDiscipulado={() => setActiveTab("discipulado")} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.32, ease: "easeOut" }}
              className="mt-6"
            >
              <AnnouncementsSection />
            </motion.div>

            <RemindersSection
              onNavigateToDiscipulado={() => setActiveTab("discipulado")}
              onNavigateToAgenda={() => setActiveTab("agenda")}
            />
          </>
        )}

        {activeTab === "conquistas" && (
          <div className="pt-4">
            <AchievementsGrid
              faithPoints={stats.faithPoints}
              streakDays={stats.streakDays}
              completedCount={stats.completedCount}
            />
            <TypingMetricsPanel />
          </div>
        )}

        {activeTab === "agenda" && <UserAgendaTab />}

        {activeTab === "comunidade" && <CommunityTab />}

        {activeTab === "discipulado" && (
          <DiscipleshipTab
            targetLessonId={targetLessonId}
            onTargetLessonConsumed={() => setTargetLessonId(null)}
          />
        )}

        {activeTab === "perfil" && (
          <div className="space-y-4 pb-4 pt-5">
            <div className="px-5">
              <h2 className="font-montserrat text-xl font-black text-foreground">Perfil</h2>
            </div>

            <div className="px-5">
              <Tabs value={profileSubTab} onValueChange={(value) => setProfileSubTab(value as ProfileSubTab)}>
                <TabsList className="grid h-11 w-full grid-cols-3">
                  <TabsTrigger value="meu-perfil" className="text-[11px] sm:text-xs">
                    Meu Perfil
                  </TabsTrigger>
                  <TabsTrigger value="minha-jornada" className="text-[11px] sm:text-xs">
                    Minha Jornada
                  </TabsTrigger>
                  <TabsTrigger value="configuracoes" className="text-[11px] sm:text-xs">
                    Configuracoes
                  </TabsTrigger>
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
                  area={profile?.area}
                />

                <InstallAppCard />

                {(role === "admin" || role === "lider") && (
                  <div className="mt-3 px-5">
                    <button
                      onClick={() => navigate("/admin")}
                      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: "var(--gradient-hero)" }}
                      >
                        <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="font-montserrat text-sm font-bold text-foreground">
                          {role === "admin" ? "Area do Administrador" : "Area do Lider"}
                        </p>
                        <p className="text-xs font-inter text-muted-foreground">
                          {role === "admin" ? "Gerenciar participantes e conteudo" : "Gerenciar cursos e usuarios"}
                        </p>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">-&gt;</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {profileSubTab === "minha-jornada" && (
              <>
                <NextCourseActivityCard onNavigateToDiscipulado={() => setActiveTab("discipulado")} />
                <JourneyPath />
              </>
            )}

            {profileSubTab === "configuracoes" && (
              <>
                <EditProfileForm />
                <NotificationSettings />
              </>
            )}
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
