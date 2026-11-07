import { useState, useEffect, useCallback, useRef, lazy, Suspense, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";
import { Users, CalendarDays, MessageSquare, Bell, ChevronDown, ChevronUp, Clock, BookOpen, BarChart3, GraduationCap, FileText, BookMarked, Settings, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
import type { Database } from "@/integrations/supabase/types";

type CommunityName = Database["public"]["Enums"]["community_name"];

type Activity = {
  id: string; type: string; title: string; subtitle: string | null; order_num: number; points: number; church_id?: string | null;
};
type Participant = {
  user_id: string; full_name: string; community: string; area: string;
  birth_date: string; phone: string; completed_count: number; completed_activity_ids: string[];
  confirmation_year?: number | null;
  turma_id?: string | null;
  completed_lesson_count?: number;
  completed_devotional_count?: number;
  completed_event_count?: number;
  faith_points?: number;
  church_id?: string | null;
  progress_total?: number;
  last_activity_at?: string | null;
  last_activity_source?: string | null;
  last_devotional_at?: string | null;
  recent_attendance_statuses?: string[];
  health_status?: string;
  is_priority?: boolean;
  needs_pastor?: boolean;
  avatar_url?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  father_phone?: string | null;
  mother_phone?: string | null;
  address?: string | null;
};
type Turma = { id: string; name: string; area: string | null; church_id?: string | null };

type SubTab = "visao" | "alunos" | "encontros" | "roteiros" | "comunicacao" | "push" | "gerencia" | "relatorios" | "guia";

type SubTabDefinition = {
  id: SubTab;
  label: string;
  description: string;
  section: string;
  icon: typeof Users;
  adminOnly?: boolean;
};

const SUB_TABS: SubTabDefinition[] = [
  { id: "visao", label: "Hoje", description: "Prioridades e próximos passos", section: "Acompanhamento", icon: Sparkles },
  { id: "alunos", label: "Pessoas e cursos", description: "Discípulos, aprovações e liberações", section: "Pessoas", icon: Users },
  { id: "encontros", label: "Agenda e presença", description: "Encontros, chamada e avaliações", section: "Encontros", icon: CalendarDays },
  { id: "roteiros", label: "Roteiro do encontro", description: "Conteúdo para conduzir a reunião", section: "Encontros", icon: BookOpen },
  { id: "guia", label: "Guia da lição", description: "Orientações do curso selecionado", section: "Conteúdo", icon: BookMarked },
  { id: "comunicacao", label: "Avisos", description: "Mensagens para o grupo", section: "Comunicação", icon: MessageSquare },
  { id: "push", label: "Notificações", description: "Envios imediatos ou agendados", section: "Comunicação", icon: Bell },
  { id: "relatorios", label: "Relatórios", description: "Progresso e presença do grupo", section: "Análise", icon: FileText },
  { id: "gerencia", label: "Configurações", description: "Turma, profissão de fé e reinício", section: "Administração", icon: Settings, adminOnly: true },
];

type ParticipantSummaryRow = {
  user_id: string;
  full_name: string;
  community: string | null;
  area: string | null;
  birth_date: string | null;
  phone: string | null;
  turma_id: string | null;
  confirmation_year: number | null;
  avatar_url: string | null;
  father_name: string | null;
  mother_name: string | null;
  father_phone: string | null;
  mother_phone: string | null;
  address: string | null;
  church_id: string | null;
  completed_activity_ids: string[] | null;
  completed_lesson_count: number | null;
  completed_devotional_count: number | null;
  completed_event_count: number | null;
  progress_total: number | null;
  last_activity_at: string | null;
  last_activity_source: string | null;
  last_devotional_at: string | null;
  recent_attendance_statuses: string[] | null;
  health_status: string | null;
  is_priority: boolean | null;
  needs_pastor: boolean | null;
};

type LeaderRpcResult<T> = { data: T | null; error: { message: string } | null };
const callLeaderRpc = supabase.rpc.bind(supabase) as unknown as <T = unknown>(
  functionName: string,
  args?: Record<string, unknown>,
) => PromiseLike<LeaderRpcResult<T>>;

export default function LeaderRoomSection({ asTab = false }: { asTab?: boolean }) {
  const { profile, role } = useAuth();
  const { effectiveArea, effectiveTurmaId } = useAreaSwitch();
  const { toast } = useToast();
  const canView = role === "admin" || role === "lider";
  const visibleSubTabs = useMemo(
    () => SUB_TABS.filter((tab) => !tab.adminOnly || role === "admin"),
    [role],
  );

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
    const currentIdx = visibleSubTabs.findIndex(t => t.id === activeSubTab);
    const nextIdx = direction === "left"
      ? Math.min(currentIdx + 1, visibleSubTabs.length - 1)
      : Math.max(currentIdx - 1, 0);
    if (nextIdx !== currentIdx) {
      scrollToTab(visibleSubTabs[nextIdx].id);
    }
  }, [activeSubTab, scrollToTab, visibleSubTabs]);

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

  useEffect(() => {
    if (!visibleSubTabs.some((tab) => tab.id === activeSubTab)) {
      setActiveSubTab("visao");
    }
  }, [activeSubTab, visibleSubTabs]);

  const [loading, setLoading] = useState(false);
  const fetchRequestId = useRef(0);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [waitingCount, setWaitingCount] = useState(0);

  const turmaArea = effectiveArea || profile?.area || "";
  const churchId = profile?.church_id ?? null;
  const managedTurmaId = effectiveTurmaId ?? profile?.turma_id ?? null;

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
        const filtered = data.filter((participant) => participant.user_id !== myId && (!participant.area || participant.area === turmaArea) && (!churchId || participant.church_id === churchId));
        setWaitingCount(filtered.length);
      }
    }
    fetchWaitingCount();
  }, [canView, turmaArea, expanded, churchId]);

  const fetchData = useCallback(async () => {
    const isAdmin = role === "admin";
    if (!churchId || (!managedTurmaId && !isAdmin)) return;
    const requestId = ++fetchRequestId.current;
    setLoading(true);

    const summaryArgs: Record<string, unknown> = { p_church_id: churchId };
    if (managedTurmaId) summaryArgs.p_turma_id = managedTurmaId;
    else if (turmaArea) summaryArgs.p_area = turmaArea;

    const [
      activitiesResult,
      summariesResult,
      turmasResult,
    ] = await Promise.all([
      supabase.from("activities").select("*").or(churchId ? `church_id.is.null,church_id.eq.${churchId}` : "church_id.is.null").order("order_num"),
      callLeaderRpc<ParticipantSummaryRow[]>("get_leader_participant_summaries", summaryArgs),
      supabase.from("turmas").select("id, name, area, church_id").eq("is_active", true).eq("church_id", churchId),
    ]);

    const loadError = activitiesResult.error ?? summariesResult.error ?? turmasResult.error;
    if (requestId !== fetchRequestId.current) return;
    if (loadError) {
      setActivities([]);
      setParticipants([]);
      setTurmas([]);
      setLoading(false);
      toast({
        title: "Não foi possível carregar a Sala do Líder",
        description: loadError.message,
        variant: "destructive",
      });
      return;
    }

    const summaryRows = summariesResult.data ?? [];
    const communitiesInScope = [
      ...new Set(summaryRows.map((row) => row.community).filter((value): value is string => Boolean(value))),
    ];
    const rankingResponses = await Promise.all(
      communitiesInScope.map((community) =>
        supabase.rpc("get_community_ranking", {
          _community: community as CommunityName,
          _church_id: churchId,
        }),
      ),
    );
    if (requestId !== fetchRequestId.current) return;

    const rankingMap = new Map<string, number>();
    const rankingFailedCommunities = new Set<string>();
    (rankingResponses ?? []).forEach((response, index) => {
      const community = communitiesInScope[index];
      if (response?.error) {
        if (community) rankingFailedCommunities.add(community);
        return;
      }
      (response.data ?? []).forEach((item) => {
        rankingMap.set(item.user_id, Number(item.faith_points ?? 0));
      });
    });

    const participantList: Participant[] = summaryRows.map((row) => {
      const lessonCount = Number(row.completed_lesson_count ?? 0);
      const devotionalCount = Number(row.completed_devotional_count ?? 0);

      return {
        ...row,
        full_name: row.full_name ?? "",
        community: row.community ?? "Aguardando definição",
        area: row.area ?? "Sem área",
        birth_date: row.birth_date ?? "",
        phone: row.phone ?? "",
        completed_count: lessonCount + devotionalCount,
        completed_activity_ids: row.completed_activity_ids ?? [],
        completed_lesson_count: lessonCount,
        completed_devotional_count: devotionalCount,
        completed_event_count: Number(row.completed_event_count ?? 0),
        progress_total: Number(row.progress_total ?? 0),
        recent_attendance_statuses: row.recent_attendance_statuses ?? [],
        health_status: row.health_status ?? "saudavel",
        is_priority: row.is_priority ?? false,
        needs_pastor: row.needs_pastor ?? false,
        faith_points: row.community && rankingFailedCommunities.has(row.community)
          ? undefined
          : rankingMap.get(row.user_id),
      };
    });

    setActivities(activitiesResult.data ?? []);
    setParticipants(participantList);
    setTurmas(
      role === "lider" && managedTurmaId
        ? (turmasResult.data ?? []).filter((turma) => turma.id === managedTurmaId)
        : (turmasResult.data ?? []),
    );
    setLoading(false);
  }, [churchId, managedTurmaId, role, toast, turmaArea]);

  // Re-fetch when area changes (admin switching) or on first expand
  useEffect(() => {
    if (expanded && canView) {
      void fetchData();
    }
  }, [expanded, canView, turmaArea, churchId, fetchData]);

  if (!canView) return null;

  const communities = [
    ...new Set(participants.map((participant) => participant.community).filter(Boolean)),
  ].sort((left, right) => left.localeCompare(right, "pt-BR"));
  const managedTurma = turmas.find((turma) => turma.id === managedTurmaId) ?? null;

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
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
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
            {waitingCount} pessoa{waitingCount !== 1 ? "s" : ""} aguardando na sala de espera da sua área
          </p>
        </button>
      )}

      {expanded && (
        <div className={`${asTab ? "mt-2" : "mt-3"} animate-in slide-in-from-top-2 duration-200`}>
          {/* Sub-tab selector */}
          <div className="relative pb-4">
            {(() => {
              const currentTab = visibleSubTabs.find(tab => tab.id === activeSubTab) ?? visibleSubTabs[0];
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
                        <p className="font-inter text-xs font-bold uppercase tracking-wide text-muted-foreground">{currentTab.section}</p>
                        <p className="truncate font-montserrat text-sm font-black text-foreground">{currentTab.label}</p>
                        <p className="truncate font-inter text-[11px] text-muted-foreground">{currentTab.description}</p>
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
                      {visibleSubTabs.map((tab, index) => {
                        const Icon = tab.icon;
                        const isActive = activeSubTab === tab.id;
                        const showBadge = tab.id === "alunos" && waitingCount > 0;
                        const showSection = index === 0 || visibleSubTabs[index - 1]?.section !== tab.section;

                        return (
                          <div key={tab.id}>
                            {showSection && (
                              <p className="px-3 pb-1 pt-2 font-inter text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                                {tab.section}
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() => scrollToTab(tab.id)}
                              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-foreground hover:bg-muted"
                              }`}
                            >
                              <Icon className="h-5 w-5 shrink-0" />
                              <span className="min-w-0 flex-1">
                                <span className="block font-inter text-sm font-semibold">{tab.label}</span>
                                <span className={`block truncate font-inter text-[11px] ${
                                  isActive ? "text-primary-foreground/75" : "text-muted-foreground"
                                }`}>
                                  {tab.description}
                                </span>
                              </span>
                              {showBadge && (
                                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                                  isActive ? "bg-primary-foreground text-primary" : "bg-destructive text-destructive-foreground"
                                }`}>
                                  {waitingCount}
                                </span>
                              )}
                            </button>
                          </div>
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
                  area={turmaArea || null}
                  churchId={churchId}
                  turmaId={managedTurmaId}
                  participants={participants.map((participant) => ({
                    user_id: participant.user_id,
                    full_name: participant.full_name,
                    birth_date: participant.birth_date,
                  }))}
                  onNavigate={(target) => {
                    setActiveSubTab(target === "agenda" ? "encontros" : "alunos");
                  }}
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
                  <ParticipantsTab
                    participants={participants}
                    activities={activities}
                    communities={communities}
                    turmaId={managedTurmaId}
                    turmaArea={turmaArea}
                    onDataChanged={() => void fetchData()}
                  />
                </div>
              )}

              {activeSubTab === "encontros" && (
                <AttendanceTab
                  participants={participants}
                  activities={activities}
                  communities={communities}
                  adminArea={turmaArea}
                  churchId={churchId}
                  turmaId={managedTurmaId}
                  turmaName={managedTurma?.name ?? turmaArea}
                  initialParticipant={highlightedParticipant}
                  onClearInitial={() => setHighlightedParticipant(null)}
                />
              )}

              {activeSubTab === "roteiros" && (
                <CourseGuideSubTab />
              )}

              {activeSubTab === "comunicacao" && (
                <MessagesTab leaderMode={role === "lider"} churchId={churchId} />
              )}

              {activeSubTab === "push" && (
                <div className="space-y-4">
                  <AdminPushTab
                    turmas={turmas}
                    churchId={churchId}
                    leaderMode={role === "lider"}
                    managedTurmaId={managedTurmaId}
                    areas={[...new Set(turmas.map((turma) => turma.area).filter((area): area is string => Boolean(area)))]}
                    communities={communities}
                  />
                  {role === "admin" && (
                    <div className="border-t border-border pt-4">
                      <PushStatusList adminArea={turmaArea} />
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === "relatorios" && (
                <ReportsTab />
              )}

              {activeSubTab === "gerencia" && role === "admin" && (
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
