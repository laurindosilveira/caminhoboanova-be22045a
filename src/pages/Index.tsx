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
    <div id="main-content" className="relative mx-auto flex min-h-screen max-w-md flex-col bg-background safe-bottom">
      <HeroHeader
        streakDays={stats.streakDays}
        faithPoints={stats.faithPoints}
        faithLevel={stats.faithLevel}
        faithEnergy={stats.faithEnergy}
      />

      <main className="flex-1 overflow-y-auto pb-32 pt-2" role="main">

        {activeTab === "jornada" && (
          <>
            <PushActivationBanner />

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="px-5 pt-2"
            >
              <section 
                aria-labelledby="foco-dia-titulo"
                className="overflow-hidden rounded-[2.5rem] border border-primary/5 bg-card shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_30px_60px_-25px_rgba(0,0,0,0.15)]"
              >
                <div
                  className="relative px-6 pb-6 pt-6 text-primary-foreground"
                  style={{ background: "var(--gradient-hero)" }}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-20">
                    <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/30 blur-3xl animate-pulse" />
                    <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-secondary/40 blur-2xl" />
                  </div>

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[10px] font-inter font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
                        <Sparkles className="h-3.5 w-3.5 text-accent" />
                        Foco do dia
                      </div>
                      <p className="text-sm font-medium font-inter text-primary-foreground/80">
                        {greetingPeriod}, {firstName}
                      </p>
                      <h2 id="foco-dia-titulo" className="mt-1 font-montserrat text-2xl font-black leading-[1.15] text-balance">
                        Mantenha sua jornada em movimento
                      </h2>
                      <p className="mt-3 max-w-[28ch] text-sm font-inter leading-relaxed text-primary-foreground/75 font-medium">
                        {greetingMessage}
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] bg-white/10 px-4 py-3 text-right backdrop-blur-md border border-white/10 shadow-inner">
                      <p className="text-[9px] font-bold font-inter uppercase tracking-widest text-primary-foreground/60 mb-0.5">
                        Pontos
                      </p>
                      <p className="font-montserrat text-3xl font-black text-primary-foreground tabular-nums">{stats.faithPoints}</p>
                    </div>
                  </div>

                  <div className="relative mt-6 grid grid-cols-3 gap-3">
                    {heroHighlights.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm transition-colors hover:bg-white/10"
                      >
                        <p className="text-[9px] font-bold font-inter uppercase tracking-widest text-primary-foreground/50">
                          {item.label}
                        </p>
                        <p className="mt-1 font-montserrat text-lg font-black text-primary-foreground tabular-nums">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="relative mt-6 flex gap-3">
                    <button
                      onClick={() => setActiveTab("discipulado")}
                      className="flex-[2] rounded-2xl bg-white px-5 py-4 text-left text-primary shadow-xl transition-all hover:bg-white/95 active:scale-[0.98] group min-h-[56px] focus-visible:ring-offset-primary"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>
                          <span className="block text-[10px] font-bold font-inter uppercase tracking-wider text-primary/50">
                            Prioridade
                          </span>
                          <span className="mt-0.5 block font-montserrat text-base font-extrabold group-hover:text-secondary transition-colors">
                            Abrir discipulado
                          </span>
                        </span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("agenda")}
                      className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-primary-foreground backdrop-blur-sm transition-all hover:bg-white/15 active:scale-[0.98] flex items-center justify-center min-h-[56px] focus-visible:ring-offset-primary"
                      aria-label="Ir para agenda"
                    >
                      <CalendarDays className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-px bg-border sm:grid-cols-2">
                  <div className="bg-card px-6 py-6 transition-colors hover:bg-muted/30">
                    <div className="flex items-center gap-2 text-primary/80 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Heart className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold font-inter uppercase tracking-widest">
                        Ritmo espiritual
                      </span>
                    </div>
                    <p className="font-montserrat text-lg font-bold text-foreground leading-tight">
                      {stats.faithEnergy >= 3 ? "Você está em boa constância" : "Hora de retomar o ritmo"}
                    </p>
                    <p className="mt-2 text-xs font-inter leading-relaxed text-muted-foreground/90 font-medium">
                      {stats.faithEnergy >= 3
                        ? "Continue com leitura, presença e devocional para sustentar o crescimento."
                        : "Um passo hoje já melhora sua energia e sua continuidade na jornada."}
                    </p>
                  </div>

                  <div className="bg-card px-6 py-6 transition-colors hover:bg-muted/30 border-t sm:border-t-0 sm:border-l border-border">
                    <div className="flex items-center gap-2 text-secondary/80 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold font-inter uppercase tracking-widest">
                        Direção rápida
                      </span>
                    </div>
                    <p className="font-montserrat text-lg font-bold text-foreground leading-tight">
                      {stats.streakDays >= 3 ? "Sua sequência merece continuidade" : "Construa sua primeira sequência"}
                    </p>
                    <p className="mt-2 text-xs font-inter leading-relaxed text-muted-foreground/90 font-medium">
                      {stats.streakDays >= 3
                        ? "Entre no discipulado antes do fim do dia para não perder o embalo."
                        : "Abra a próxima etapa e transforme hoje no ponto de partida da semana."}
                    </p>
                  </div>
                </div>
              </section>
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

        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 animate-pulse">
              <span className="text-2xl">✝️</span>
            </div>
            <p className="text-muted-foreground font-inter text-sm">Carregando...</p>
          </div>
        }>
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
        </Suspense>
      </main>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
