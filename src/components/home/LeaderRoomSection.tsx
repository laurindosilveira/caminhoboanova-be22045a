import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";
import { Users, CalendarDays, MessageSquare, Bell, ChevronDown, ChevronUp, Clock, BookOpen, BarChart3, GraduationCap, FileText, BookMarked, CircleCheck, CircleAlert } from "lucide-react";
import CircularProgressBar from "@/components/ui/CircularProgressBar";

const AttendanceTab = lazy(() => import("@/components/admin/tabs/AttendanceTab"));
const MessagesTab = lazy(() => import("@/components/admin/tabs/MessagesTab"));
const ParticipantsTab = lazy(() => import("@/components/admin/tabs/ParticipantsTab"));
const AdminPushTab = lazy(() => import("@/components/admin/tabs/AdminPushTab"));
const PushStatusList = lazy(() => import("@/components/admin/tabs/PushStatusList"));
const CourseGuideSubTab = lazy(() => import("@/components/admin/tabs/leader/CourseGuideSubTab"));
const LeaderCareDashboard = lazy(() => import("@/components/admin/tabs/leader/LeaderCareDashboard"));
const ReportsTab = lazy(() => import("@/components/admin/tabs/ReportsTab"));
const LeaderTurmaManagement = lazy(() => import("@/components/admin/tabs/leader/LeaderTurmaManagement"));
const LeaderGuideContent = lazy(() => import("@/components/home/LeaderGuideContent"));
import LeaderWaitingRoom from "@/components/home/LeaderWaitingRoom";


import { AREA_COMMUNITIES, ALL_COMMUNITIES, getCommunitiesForArea } from "@/config/areas";

type Activity = {
  id: string; type: string; title: string; subtitle: string | null; order_num: number; points: number; church_id?: string | null;
};
type Participant = {
  user_id: string; full_name: string; community: string; area: string;
  birth_date: string; phone: string; completed_count: number; completed_activity_ids: string[];
  confirmation_year?: number | null;
  completed_lesson_count?: number;
  completed_devotional_count?: number;
  completed_event_count?: number;
  faith_points?: number;
  church_id?: string | null;
};
type PlanInfo = { health_status: string; is_priority: boolean; needs_pastor?: boolean };
type Turma = { id: string; name: string; area: string | null; church_id?: string | null };

type SubTab = "visao" | "alunos" | "encontros" | "roteiros" | "comunicacao" | "push" | "gerencia" | "relatorios" | "guia";

const SUB_TABS: { id: SubTab; label: string; icon: typeof Users }[] = [
  { id: "visao", label: "Visão", icon: BarChart3 },
  { id: "alunos", label: "Discípulos", icon: Users },
  { id: "encontros", label: "Encontros", icon: CalendarDays },
  { id: "roteiros", label: "Roteiros", icon: BookOpen },
  { id: "guia", label: "Guia", icon: BookMarked },
  { id: "relatorios", label: "Relatórios", icon: FileText },
  { id: "comunicacao", label: "Avisos", icon: MessageSquare },
  { id: "push", label: "Push", icon: Bell },
  { id: "gerencia", label: "Profissão de Fé", icon: GraduationCap },
];

export default function LeaderRoomSection({ asTab = false }: { asTab?: boolean }) {
  const { profile, role } = useAuth();
  const { effectiveArea } = useAreaSwitch();
  const canView = role === "admin" || role === "lider";

  const [expanded, setExpanded] = useState(asTab);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("visao");
  const [isSubTabMenuOpen, setIsSubTabMenuOpen] = useState(false);
  const [highlightedParticipant, setHighlightedParticipant] = useState<Participant | null>(null);

  const scrollToTab = useCallback((tabId: SubTab) => {
    setActiveSubTab(tabId);
    setIsSubTabMenuOpen(false);
  }, []);

  // Swipe gesture support for navigating between sub-tabs
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSwipe = useCallback((direction: "left" | "right") => {
    const currentIdx = SUB_TABS.findIndex(t => t.id === activeSubTab);
    const nextIdx = direction === "left"
      ? Math.min(currentIdx + 1, SUB_TABS.length - 1)
      : Math.max(currentIdx - 1, 0);
    if (nextIdx !== currentIdx) {
      scrollToTab(SUB_TABS[nextIdx].id);
    }
  }, [activeSubTab, scrollToTab]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el || !expanded) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;
      // Only trigger if horizontal swipe is dominant and > 50px
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        handleSwipe(dx < 0 ? "left" : "right");
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [expanded, handleSwipe]);

  const [loading, setLoading] = useState(false);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [plans, setPlans] = useState<Record<string, PlanInfo>>({});
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);
  const [memberLimit, setMemberLimit] = useState<number | null>(null);

  const turmaArea = effectiveArea || profile?.area || "";
  const churchId = profile?.church_id ?? null;

  useEffect(() => {
    if (!churchId) return;
    void supabase.from("church_subscriptions")
      .select("member_limit")
      .eq("church_id", churchId)
      .maybeSingle()
      .then(({ data }) => setMemberLimit(data?.member_limit ?? null));
  }, [churchId]);

  // Fetch waiting room count for the leader's area
  useEffect(() => {
    if (!canView || !turmaArea) return;
    async function fetchWaitingCount() {
      let waitingQuery = supabase
        .from("profiles")
        .select("user_id, area, enrollment_status, church_id")
        .is("turma_id", null)
        .eq("enrollment_status", "pending");
      if (churchId) waitingQuery = waitingQuery.eq("church_id", churchId);
      const { data, error } = await waitingQuery;
      if (!error && data) {
        const myId = (await supabase.auth.getUser()).data.user?.id;
        const filtered = data.filter((p: any) => p.user_id !== myId && (!p.area || p.area === turmaArea) && (!churchId || p.church_id === churchId));
        setWaitingCount(filtered.length);
      }
    }
    fetchWaitingCount();
  }, [canView, turmaArea, expanded, churchId]);

  async function fetchData() {
    // Admins can view any area even without a turma_id
    const isAdmin = role === "admin";
    if (!profile?.turma_id && !isAdmin) return;
    setLoading(true);

    let profilesQuery = supabase.from("profiles").select("user_id, full_name, community, area, birth_date, phone, turma_id, confirmation_year, avatar_url, father_name, mother_name, father_phone, mother_phone, address, church_id");
    if (churchId) profilesQuery = profilesQuery.eq("church_id", churchId);
    
    if (isAdmin) {
      // Admin: fetch all profiles from the effective area
      profilesQuery = profilesQuery.eq("area", turmaArea as any);
    } else {
      // Leader: fetch only their turma
      profilesQuery = profilesQuery.eq("turma_id", profile!.turma_id!);
    }

    const [
      { data: activitiesData },
      { data: profilesData },
      userResult,
      { data: turmasData },
    ] = await Promise.all([
      supabase.from("activities").select("*").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : "church_id.is.null").order("order_num"),
      profilesQuery,
      supabase.auth.getUser(),
      churchId
        ? supabase.from("turmas").select("id, name, area, church_id").eq("is_active", true).eq("church_id", churchId)
        : supabase.from("turmas").select("id, name, area, church_id").eq("is_active", true).is("church_id", null),
    ]);

    const myId = userResult.data.user?.id ?? "";
    const profilesList = (profilesData ?? []).filter(p => p.user_id !== myId);

    const userIds = profilesList.map(p => p.user_id);
    const communitiesInScope = [...new Set(profilesList.map(p => p.community).filter(Boolean))];
    const now = new Date();
    const churchScope = churchId ? `church_id.is.null,church_id.eq.${churchId}` : "church_id.is.null";
    const [
      { data: progressData },
      { data: lessonResponsesData },
      { data: devotionalProgressData },
      { data: attendanceData },
      rankingResponses,
      { data: plansData },
      { data: assessData },
    ] = userIds.length > 0
      ? await Promise.all([
          supabase.from("user_progress").select("user_id, activity_id").in("user_id", userIds).or(churchScope),
          supabase.from("lesson_progress").select("user_id, lesson_id").in("user_id", userIds).eq("is_completed", true).or(churchScope),
          supabase.from("devotional_progress").select("user_id, devotional_id, completed_at").in("user_id", userIds).or(churchScope),
          supabase.from("attendance").select("user_id, status").in("user_id", userIds).eq("status", "presente").or(churchScope),
          Promise.all(
            communitiesInScope.map((community) =>
              supabase.rpc("get_community_ranking" as any, { _community: community as any, _church_id: churchId })
            )
          ),
          supabase.from("discipleship_plans").select("user_id, health_status, is_priority").in("user_id", userIds).or(churchScope),
          supabase.from("spiritual_assessments").select("user_id, needs_pastor")
            .in("user_id", userIds)
            .or(churchScope)
            .eq("month", now.getMonth() + 1)
            .eq("year", now.getFullYear()),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, [] as any, { data: [] }, { data: [] }];

    const rankingMap = new Map<string, number>();
    const rankingFailedCommunities = new Set<string>();
    (rankingResponses ?? []).forEach((response: any, index: number) => {
      const community = communitiesInScope[index];
      if (response?.error) {
        if (community) rankingFailedCommunities.add(community);
        return;
      }
      (response.data ?? []).forEach((item: any) => {
        rankingMap.set(item.user_id, Number(item.faith_points ?? 0));
      });
    });

    const participantList: Participant[] = profilesList.map((p) => {
      const userProgress = (progressData ?? []).filter((pr) => pr.user_id === p.user_id);
      const lessonCount = new Set(
        (lessonResponsesData ?? [])
          .filter((response) => response.user_id === p.user_id)
          .map((response) => response.lesson_id)
      ).size;
      const devotionals = (devotionalProgressData ?? []).filter((progress) => progress.user_id === p.user_id);
      const devotionalCount = devotionals.length;
      const completedActivityIds = userProgress.map((pr) => pr.activity_id);
      const completedEventCount = (attendanceData ?? []).filter(a => a.user_id === p.user_id).length;

      return {
        ...p,
        completed_count: userProgress.length + lessonCount + devotionalCount,
        completed_activity_ids: completedActivityIds,
        completed_lesson_count: lessonCount,
        completed_devotional_count: devotionalCount,
        completed_event_count: completedEventCount,
        faith_points: rankingFailedCommunities.has(p.community)
          ? undefined
          : rankingMap.get(p.user_id),
        turma_id: p.turma_id,
      } as any;
    });

    const plansMap: Record<string, PlanInfo> = {};
    (plansData ?? []).forEach((pl: any) => {
      plansMap[pl.user_id] = { health_status: pl.health_status, is_priority: pl.is_priority ?? false };
    });
    (assessData ?? []).forEach((a: any) => {
      if (!plansMap[a.user_id]) plansMap[a.user_id] = { health_status: "atencao", is_priority: false };
      plansMap[a.user_id].needs_pastor = a.needs_pastor;
    });

    setActivities(activitiesData ?? []);
    setParticipants(participantList);
    setTurmas(turmasData ?? []);
    setPlans(plansMap);
    setLoading(false);
    setDataLoaded(true);
  }

  // Re-fetch when area changes (admin switching) or on first expand
  useEffect(() => {
    if (expanded && canView) {
      setDataLoaded(false);
      fetchData();
    }
  }, [expanded, canView, turmaArea, churchId]);

  useEffect(() => {
    if (expanded && !dataLoaded && canView) {
      fetchData();
    }
  }, [expanded, dataLoaded, canView]);

  if (!canView) return null;

  const communities = getCommunitiesForArea(turmaArea ?? "");
  const advancedCount = participants.filter((participant) => activities.length > 0 && participant.completed_activity_ids.length / activities.length >= 0.7).length;
  const alertCount = participants.filter((participant) => participant.completed_activity_ids.length === 0 || plans[participant.user_id]?.health_status === "critico" || plans[participant.user_id]?.needs_pastor).length;
  const averageProgress = participants.length > 0
    ? Math.round(participants.reduce((total, participant) => total + (activities.length > 0 ? participant.completed_activity_ids.length / activities.length * 100 : 0), 0) / participants.length)
    : 0;

  return (
    <div className={asTab ? "" : "mx-5"}>
      {/* Collapsible header - hidden in tab mode */}
      {!asTab && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between bg-card border border-border rounded-2xl p-4 shadow-sm hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative" style={{ background: "var(--gradient-hero)" }}>
              <span className="text-lg">📋</span>
              {waitingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {waitingCount}
                </span>
              )}
            </div>
            <div className="text-left">
              <p className="font-montserrat font-bold text-foreground text-sm">Sala do Líder</p>
              <p className="text-muted-foreground text-xs font-inter">
                {waitingCount > 0 && !expanded
                  ? `${waitingCount} pessoa${waitingCount !== 1 ? "s" : ""} na sala de espera`
                  : expanded ? "Toque para fechar" : "Gerencie sua turma"}
              </p>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>
      )}

      {/* Waiting room alert banner */}
      {expanded && waitingCount > 0 && (
        <button
          onClick={() => setActiveSubTab("alunos")}
          className={`w-full ${asTab ? "" : "mt-2"} flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-2xl p-3 hover:bg-destructive/15 transition-colors`}
        >
          <Clock className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-destructive font-inter text-xs font-semibold text-left">
            {waitingCount} pessoa{waitingCount !== 1 ? "s" : ""} aguardando na sala de espera do seu GC
          </p>
        </button>
      )}

      {expanded && (
        <div className={`${asTab ? "mt-2" : "mt-3"} animate-in slide-in-from-top-2 duration-200`}>
          <section className="mb-4 rounded-2xl bg-slate-950 p-4 text-white shadow-sm" aria-label="Resumo da saúde da turma">
            <div className="grid gap-4 sm:grid-cols-[1.15fr_.8fr_1.35fr]">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs font-semibold text-white/70"><Users className="h-4 w-4 text-cyan-300" /> Ocupação da turma</span>
                  <strong className="font-montserrat text-lg">{participants.length}{memberLimit ? `/${memberLimit}` : ""}</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Ocupação da turma" aria-valuemin={0} aria-valuemax={memberLimit ?? Math.max(participants.length, 1)} aria-valuenow={participants.length}>
                  <div className="h-full rounded-full bg-cyan-300" style={{ width: `${memberLimit ? Math.min(100, participants.length / memberLimit * 100) : participants.length ? 100 : 0}%` }} />
                </div>
                <p className="mt-1.5 text-[11px] text-white/50">{memberLimit ? `${Math.max(memberLimit - participants.length, 0)} vagas disponíveis` : `${participants.length} participantes`}</p>
              </div>
              <div className="flex items-center justify-center gap-3 border-white/15 sm:border-x">
                <CircularProgressBar progress={averageProgress} size={56} />
                <div><p className="text-xs font-semibold text-white/70">Progresso médio</p><p className="mt-1 text-[11px] text-white/50">da turma</p></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2.5">
                  <CircleCheck className="h-5 w-5 text-emerald-300" /><div><p className="font-montserrat text-lg font-black leading-none">{advancedCount}</p><p className="mt-1 text-[11px] text-emerald-100/70">Avançados</p></div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2.5">
                  <CircleAlert className="h-5 w-5 text-amber-300" /><div><p className="font-montserrat text-lg font-black leading-none">{alertCount}</p><p className="mt-1 text-[11px] text-amber-100/70">Em alerta</p></div>
                </div>
              </div>
            </div>
          </section>

          {/* Sub-tab selector */}
          <div className="relative pb-4">
            {(() => {
              const currentTab = SUB_TABS.find(tab => tab.id === activeSubTab) ?? SUB_TABS[0];
              const CurrentIcon = currentTab.icon;

              return (
                <>
                  <button
                    type="button"
                    onClick={() => setIsSubTabMenuOpen(prev => !prev)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:bg-muted/50"
                    aria-expanded={isSubTabMenuOpen}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <CurrentIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-inter text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Subaba atual</p>
                        <p className="truncate font-montserrat text-sm font-black text-foreground">{currentTab.label}</p>
                      </div>
                    </div>
                    {isSubTabMenuOpen ? (
                      <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                    )}
                  </button>

                  {isSubTabMenuOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%-0.75rem)] z-30 max-h-72 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-2xl">
                      {SUB_TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeSubTab === tab.id;
                        const showBadge = tab.id === "alunos" && waitingCount > 0;

                        return (
                          <button
                            type="button"
                            key={tab.id}
                            onClick={() => scrollToTab(tab.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                            <span className="min-w-0 flex-1 font-inter text-sm font-semibold">{tab.label}</span>
                            {showBadge && (
                              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                isActive ? "bg-primary-foreground text-primary" : "bg-destructive text-destructive-foreground"
                              }`}>
                                {waitingCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Content - swipe enabled */}
          <div ref={contentRef} className="touch-pan-y">
          {loading ? (
            <div className="space-y-4 animate-fade-in">
              {/* Skeleton cards mimicking dashboard layout */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-2/3 rounded-md bg-muted animate-pulse" />
                    <div className="h-3 w-1/3 rounded-md bg-muted animate-pulse" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 rounded-md bg-muted animate-pulse" style={{ width: `${70 - i * 10}%` }} />
                      <div className="h-2.5 w-1/4 rounded-md bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Suspense fallback={
              <div className="bg-card border border-border rounded-2xl p-6 space-y-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
                  <div className="h-4 w-1/2 rounded-md bg-muted animate-pulse" />
                </div>
                <div className="h-3 w-3/4 rounded-md bg-muted animate-pulse" />
                <div className="h-3 w-2/3 rounded-md bg-muted animate-pulse" />
              </div>
            }>
              <div
                key={activeSubTab}
                className="animate-[tab-slide-in_0.35s_ease-out]"
              >
              {activeSubTab === "visao" && (
                <LeaderCareDashboard
                  area={turmaArea}
                  churchId={churchId}
                  turmaId={profile?.turma_id ?? null}
                  participants={participants.map(({ user_id, full_name, birth_date }) => ({ user_id, full_name, birth_date }))}
                  onNavigate={(tab) => setActiveSubTab(tab === "agenda" ? "encontros" : "roteiros")}
                />
              )}

              {activeSubTab === "alunos" && (
                <div className="space-y-4">
                  {waitingCount > 0 && (
                    <LeaderWaitingRoom
                      areaFilter={turmaArea}
                      churchId={churchId}
                      onAssigned={() => setWaitingCount(prev => Math.max(0, prev - 1))}
                    />
                  )}
                  <ParticipantsTab participants={participants} activities={activities} communities={communities} />
                </div>
              )}

              {activeSubTab === "encontros" && (
                <AttendanceTab
                  participants={participants}
                  activities={activities}
                  communities={communities}
                  adminArea={turmaArea}
                  churchId={churchId}
                  initialParticipant={highlightedParticipant}
                  onClearInitial={() => setHighlightedParticipant(null)}
                />
              )}

              {activeSubTab === "roteiros" && (
                <CourseGuideSubTab />
              )}

              {activeSubTab === "comunicacao" && (
                <MessagesTab churchId={churchId} />
              )}

              {activeSubTab === "push" && (
                <div className="space-y-4">
                  <AdminPushTab turmas={turmas} churchId={churchId} />
                  <div className="border-t border-border pt-4">
                    <PushStatusList adminArea={turmaArea} />
                  </div>
                </div>
              )}

              {activeSubTab === "relatorios" && (
                <ReportsTab />
              )}

              {activeSubTab === "gerencia" && (
                <LeaderTurmaManagement defaultArea={turmaArea} defaultChurchId={churchId} />
              )}

              {activeSubTab === "guia" && (
                <LeaderGuideContent />
              )}
              </div>
            </Suspense>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
