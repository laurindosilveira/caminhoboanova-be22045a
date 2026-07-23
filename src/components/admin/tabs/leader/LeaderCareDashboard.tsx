import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CalendarClock,
  CalendarDays,
  Cake,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  HeartHandshake,
  MessageCircle,
  NotebookPen,
  BookOpenCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import PlayerDetailSheet from "@/components/home/PlayerDetailSheet";

type CareMember = {
  assigned_to: string | null;
  assigned_to_name: string | null;
  attendance_4_present: number;
  attendance_4_total: number;
  attendance_8_present: number;
  attendance_8_total: number;
  avatar_url: string | null;
  care_reasons: string[];
  care_status: string;
  community: string | null;
  course_progress: number;
  devotionals_14: number;
  devotionals_30: number;
  devotionals_7: number;
  follow_up_id: string | null;
  full_name: string;
  last_access_at: string | null;
  last_activity_at: string | null;
  last_activity_source: string | null;
  last_contact_at: string | null;
  lessons_completed: number;
  lessons_total: number;
  needs_pastor: boolean;
  next_action: string | null;
  next_action_due_at: string | null;
  pastoral_request_at: string | null;
  pastoral_request_note: string | null;
  phone: string | null;
  progress_trend: string;
  trend_delta: number;
  user_id: string;
};

type Props = {
  area: string | null;
  churchId: string | null;
  turmaId: string | null;
  participants: Array<{ user_id: string; full_name: string; birth_date: string }>;
  onNavigate: (tab: "agenda" | "courses") => void;
};

type AgendaEvent = {
  id: string;
  title: string;
  event_date: string;
  location: string | null;
  linked_lesson_id: string | null;
  area: string | null;
  turma_id: string | null;
  target_user_id: string | null;
};
type NextEvent = Pick<AgendaEvent, "id" | "title" | "event_date" | "location" | "linked_lesson_id">;
type NextLesson = { id: string; title: string; order_num: number; courseTitle: string; eventDate: string };
type LeaderRpcResult<T> = { data: T | null; error: { message: string } | null };

const callLeaderRpc = supabase.rpc.bind(supabase) as unknown as <T = unknown>(
  functionName: string,
  args?: Record<string, unknown>,
) => PromiseLike<LeaderRpcResult<T>>;

type DialogMode = "contact" | "task" | "details" | null;
type StatusFilter = "all" | "critical" | "attention" | "healthy";
type SortKey = "priority" | "name" | "activity" | "progress" | "due";

const STATUS = {
  critical: {
    label: "Critico",
    className: "border-red-200 bg-red-50 text-red-700",
    dotClassName: "bg-red-500",
  },
  attention: {
    label: "Atencao",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    dotClassName: "bg-amber-500",
  },
  healthy: {
    label: "Saudavel",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
} as const;

const SOURCE_LABELS: Record<string, string> = {
  access: "acesso",
  activity: "atividade",
  attendance: "presenca",
  devotional: "devocional",
  lesson: "licao",
  worship: "culto",
};

function statusConfig(status: string) {
  return STATUS[status as keyof typeof STATUS] ?? STATUS.attention;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function relativeDate(value: string | null) {
  if (!value) return "Nunca";
  return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ptBR });
}

function shortDate(value: string | null) {
  if (!value) return "Sem prazo";
  return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
}

function isOverdue(value: string | null) {
  return Boolean(value && new Date(value).getTime() < Date.now());
}

function whatsappUrl(phone: string | null, name: string) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (!digits) return null;
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  const message = encodeURIComponent(`Ola, ${name.split(" ")[0]}! Tudo bem? Gostaria de saber como voce esta.`);
  return `https://wa.me/${normalized}?text=${message}`;
}

export default function LeaderCareDashboard({ area, churchId, turmaId, participants, onNavigate }: Props) {
  const { toast } = useToast();
  const [members, setMembers] = useState<CareMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("priority");
  const [selected, setSelected] = useState<CareMember | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [notes, setNotes] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [nextEvent, setNextEvent] = useState<NextEvent | null>(null);
  const [nextLesson, setNextLesson] = useState<NextLesson | null>(null);
  const [activityReportMember, setActivityReportMember] = useState<CareMember | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!churchId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const args: {
      p_area?: string;
      p_church_id?: string;
      p_turma_id?: string;
    } = { p_church_id: churchId };
    if (turmaId) args.p_turma_id = turmaId;
    if (area && !turmaId) args.p_area = area;

    const { data, error } = await callLeaderRpc<CareMember[]>("get_leader_care_dashboard", args);
    if (error) {
      toast({
        title: "Nao foi possivel carregar o acompanhamento",
        description: error.message,
        variant: "destructive",
      });
      setMembers([]);
    } else {
      setMembers(data ?? []);
    }
    setLoading(false);
  }, [area, churchId, toast, turmaId]);

  useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    async function fetchNextSteps() {
      if (!churchId) return;
      const now = new Date().toISOString();
      const [eventsResult, coursesResult, lessonsResult, userResult] = await Promise.all([
        supabase.from("events").select("id, title, event_date, location, linked_lesson_id, area, turma_id, target_user_id").gte("event_date", now).order("event_date").limit(50),
        supabase.from("courses").select("id, title, order_num, church_id").or(`church_id.is.null,church_id.eq.${churchId}`).order("order_num"),
        supabase.from("lessons").select("id, title, order_num, course_id, church_id").or(`church_id.is.null,church_id.eq.${churchId}`).order("order_num"),
        supabase.auth.getUser(),
      ]);
      const currentUserId = userResult.data.user?.id ?? null;
      // Keep this visibility rule aligned with UserAgendaTab: managers see
      // global events and events from their current area, including legacy
      // records without church_id or turma_id.
      const visibleEvents = ((eventsResult.data ?? []) as AgendaEvent[]).filter((event) => {
        if (event.target_user_id && event.target_user_id !== currentUserId) return false;
        if (event.area && event.area !== area) return false;
        return true;
      });
      const upcoming = visibleEvents[0] ?? null;
      setNextEvent(upcoming);

      const courses = coursesResult.data ?? [];
      const lessons = lessonsResult.data ?? [];
      const orderedLessons = courses.flatMap((course) => lessons
        .filter((lesson) => lesson.course_id === course.id)
        .map((lesson) => ({ id: lesson.id, title: lesson.title, order_num: lesson.order_num, courseTitle: course.title })));
      const lessonEvent = visibleEvents.find((event) => Boolean(event.linked_lesson_id));
      const linked = lessonEvent?.linked_lesson_id
        ? orderedLessons.find((lesson) => lesson.id === lessonEvent.linked_lesson_id)
        : null;
      setNextLesson(linked && lessonEvent ? { ...linked, eventDate: lessonEvent.event_date } : null);
    }
    void fetchNextSteps();
  }, [area, churchId]);

  const birthdaysThisWeek = useMemo(() => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 7);
    return participants.filter((participant) => {
      if (!participant.birth_date) return false;
      const birth = new Date(`${participant.birth_date}T12:00:00`);
      if (Number.isNaN(birth.getTime())) return false;
      const occurrence = new Date(today.getFullYear(), birth.getMonth(), birth.getDate(), 12);
      if (occurrence < today) occurrence.setFullYear(today.getFullYear() + 1);
      return occurrence <= end;
    }).slice(0, 4);
  }, [participants]);

  const counts = useMemo(() => ({
    critical: members.filter((member) => member.care_status === "critical").length,
    attention: members.filter((member) => member.care_status === "attention").length,
    healthy: members.filter((member) => member.care_status === "healthy").length,
    overdue: members.filter((member) => isOverdue(member.next_action_due_at)).length,
  }), [members]);

  const actionQueue = useMemo(
    () => members
      .filter((member) => member.care_status !== "healthy" || isOverdue(member.next_action_due_at))
      .slice(0, 6),
    [members],
  );

  const visibleMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    const priority = { critical: 0, attention: 1, healthy: 2 } as Record<string, number>;
    const filtered = members.filter((member) => {
      const matchesStatus = filter === "all" || member.care_status === filter;
      const matchesQuery = !normalizedQuery
        || member.full_name.toLocaleLowerCase("pt-BR").includes(normalizedQuery)
        || member.community?.toLocaleLowerCase("pt-BR").includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.full_name.localeCompare(b.full_name, "pt-BR");
      if (sort === "activity") {
        return (new Date(a.last_activity_at ?? 0).getTime() - new Date(b.last_activity_at ?? 0).getTime());
      }
      if (sort === "progress") return b.course_progress - a.course_progress;
      if (sort === "due") {
        return new Date(a.next_action_due_at ?? "9999-12-31").getTime()
          - new Date(b.next_action_due_at ?? "9999-12-31").getTime();
      }
      return priority[a.care_status] - priority[b.care_status];
    });
  }, [filter, members, query, sort]);

  const openDialog = (member: CareMember, mode: Exclude<DialogMode, null>) => {
    setSelected(member);
    setDialogMode(mode);
    setNotes("");
    setTaskTitle(member.next_action ?? "");
    setDueAt("");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setSelected(null);
    setNotes("");
    setTaskTitle("");
    setDueAt("");
  };

  const saveFollowUp = async () => {
    if (!selected || !dialogMode || dialogMode === "details") return;
    if (dialogMode === "task" && (!taskTitle.trim() || !dueAt)) {
      toast({ title: "Informe a proxima acao e o prazo", variant: "destructive" });
      return;
    }
    if (dialogMode === "contact" && notes.trim().length < 3) {
      toast({ title: "Anote um breve resumo da conversa", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await callLeaderRpc("save_leader_follow_up", {
      p_target_user_id: selected.user_id,
      p_kind: dialogMode === "contact" ? "contact" : "task",
      p_title: dialogMode === "contact" ? "Conversa registrada" : taskTitle.trim(),
      p_notes: notes.trim(),
      ...(dialogMode === "task" ? { p_due_at: new Date(dueAt).toISOString() } : {}),
    });
    setSaving(false);

    if (error) {
      toast({ title: "Nao foi possivel salvar", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: dialogMode === "contact" ? "Conversa registrada" : "Acompanhamento agendado" });
    closeDialog();
    await fetchMembers();
  };

  const completeFollowUp = async (member: CareMember) => {
    if (!member.follow_up_id) return;
    setSaving(true);
    const { error } = await callLeaderRpc("complete_leader_follow_up", {
      p_follow_up_id: member.follow_up_id,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Nao foi possivel concluir", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pendencia concluida" });
    await fetchMembers();
  };

  const resolvePastoralRequest = async (member: CareMember) => {
    setSaving(true);
    const { error } = await callLeaderRpc("resolve_member_pastoral_request", {
      p_target_user_id: member.user_id,
      p_notes: "Pedido pastoral tratado pela lideranca",
    });
    setSaving(false);
    if (error) {
      toast({ title: "Nao foi possivel concluir o pedido", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pedido pastoral marcado como tratado" });
    await fetchMembers();
  };

  const openWhatsApp = async (member: CareMember) => {
    const url = whatsappUrl(member.phone, member.full_name);
    if (!url) {
      toast({ title: "Este participante nao possui WhatsApp cadastrado" });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    const { error } = await callLeaderRpc("save_leader_follow_up", {
      p_target_user_id: member.user_id,
      p_kind: "contact",
      p_title: "Contato iniciado pelo WhatsApp",
      p_notes: "Contato iniciado pela area de acompanhamento",
    });
    if (!error) await fetchMembers();
  };

  if (loading) {
    return (
      <div className="space-y-4" aria-label="Carregando acompanhamento">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <section>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Hoje na sua turma</p>
            <h2 className="mt-1 font-montserrat text-2xl font-black text-foreground">Acompanhamento da turma</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {members.length} participante{members.length === 1 ? "" : "s"} em acompanhamento
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={() => void fetchMembers()} title="Atualizar dados">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 border-y border-border md:grid-cols-4">
          {[
            { label: "Criticos", value: counts.critical, icon: CircleAlert, color: "text-red-600" },
            { label: "Em atencao", value: counts.attention, icon: AlertCircle, color: "text-amber-600" },
            { label: "Saudaveis", value: counts.healthy, icon: ShieldCheck, color: "text-emerald-600" },
            { label: "Atrasados", value: counts.overdue, icon: Clock3, color: "text-slate-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex min-h-20 items-center gap-3 border-border px-3 py-4 odd:border-r md:border-r md:last:border-r-0">
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className="font-montserrat text-xl font-black text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="attention-queue-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 id="attention-queue-title" className="font-montserrat text-base font-bold text-foreground">Quem precisa de atencao</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Prioridades ordenadas por risco e prazo</p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{actionQueue.length} na fila</span>
        </div>

        {actionQueue.length === 0 ? (
          <div className="flex min-h-28 items-center justify-center gap-3 border-y border-border text-sm text-muted-foreground">
            <UserRoundCheck className="h-5 w-5 text-emerald-600" />
            Nenhuma pessoa exige acao imediata.
          </div>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {actionQueue.map((member) => {
              const config = statusConfig(member.care_status);
              return (
                <div key={member.user_id} className="flex items-center gap-3 py-3">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${config.dotClassName}`} />
                  <button className="min-w-0 flex-1 text-left" onClick={() => openDialog(member, "details")}>
                    <p className="truncate text-sm font-bold text-foreground">{member.full_name}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{member.care_reasons[0]}</p>
                  </button>
                  <div className="hidden text-right sm:block">
                    <p className={`text-xs font-semibold ${isOverdue(member.next_action_due_at) ? "text-red-600" : "text-muted-foreground"}`}>
                      {member.next_action ?? "Sem acao agendada"}
                    </p>
                    {member.next_action_due_at && <p className="text-xs text-muted-foreground">{shortDate(member.next_action_due_at)}</p>}
                  </div>
                  <QuickActions
                    member={member}
                    saving={saving}
                    onComplete={completeFollowUp}
                    onContact={(item) => openDialog(item, "contact")}
                    onSchedule={(item) => openDialog(item, "task")}
                    onWhatsApp={openWhatsApp}
                  />
                </div>
              );
            })}
          </div>
        )}

        {birthdaysThisWeek.length > 0 && (
          <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3">
            <div className="flex items-center gap-2 text-violet-800">
              <Cake className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wide">Aniversários nos próximos 7 dias</p>
            </div>
            <p className="mt-2 text-sm text-violet-950">
              {birthdaysThisWeek.map((participant) => participant.full_name).join(", ")}
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="next-steps-title">
        <div className="mb-3">
          <h3 id="next-steps-title" className="font-montserrat text-base font-bold text-foreground">Próximos passos</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Prepare o próximo encontro sem perder o fluxo</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <button type="button" onClick={() => onNavigate("agenda")} className="group flex min-h-28 items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/40">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700"><CalendarDays className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Próximo encontro</span>
              <span className="mt-1 block truncate text-sm font-bold text-foreground">{nextEvent?.title ?? "Nenhum encontro agendado"}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{nextEvent ? `${format(new Date(nextEvent.event_date), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}${nextEvent.location ? ` · ${nextEvent.location}` : ""}` : "Abra a agenda para criar o próximo encontro"}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
          <button type="button" onClick={() => onNavigate("courses")} className="group flex min-h-28 items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50/40">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><BookOpenCheck className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Próxima lição da jornada</span>
              <span className="mt-1 block truncate text-sm font-bold text-foreground">{nextLesson?.title ?? "Nenhuma lição disponível"}</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {nextLesson
                  ? `${nextLesson.courseTitle} · Lição ${nextLesson.order_num} · ${format(new Date(nextLesson.eventDate), "dd/MM 'às' HH:mm", { locale: ptBR })}`
                  : "Nenhuma lição vinculada a um evento futuro na agenda"}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </section>

      <section aria-labelledby="people-title">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 id="people-title" className="font-montserrat text-base font-bold text-foreground">Visão geral da turma</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Status e progresso individual em uma leitura rápida</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <span className="sr-only">Buscar participante</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar participante" className="h-10 pl-9 sm:w-56" />
            </label>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Ordenar participantes"
            >
              <option value="priority">Prioridade</option>
              <option value="due">Prazo</option>
              <option value="activity">Atividade mais antiga</option>
              <option value="progress">Maior progresso</option>
              <option value="name">Nome</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex gap-1 overflow-x-auto border-b border-border pb-3">
          {([
            ["all", "Todos", members.length],
            ["critical", "Criticos", counts.critical],
            ["attention", "Atencao", counts.attention],
            ["healthy", "Saudaveis", counts.healthy],
          ] as const).map(([value, label, count]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                filter === value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {label} <span className="ml-1 opacity-70">{count}</span>
            </button>
          ))}
        </div>

        {visibleMembers.length === 0 ? (
          <div className="py-14 text-center">
            <Search className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground">Nenhum participante encontrado</p>
            <p className="mt-1 text-xs text-muted-foreground">Ajuste a busca ou o filtro selecionado.</p>
          </div>
        ) : (
          <>
            <div className="mt-2 hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground">
                    <th className="px-2 py-3">Pessoa</th>
                    <th className="px-2 py-3">Situacao</th>
                    <th className="px-2 py-3">Ultima atividade</th>
                    <th className="px-2 py-3">Curso</th>
                    <th className="px-2 py-3">Presenca</th>
                    <th className="px-2 py-3">Devocionais</th>
                    <th className="px-2 py-3">Proxima acao</th>
                    <th className="px-2 py-3 text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleMembers.map((member) => (
                    <MemberTableRow
                      key={member.user_id}
                      member={member}
                      saving={saving}
                      onComplete={completeFollowUp}
                      onContact={(item) => openDialog(item, "contact")}
                      onDetails={(item) => openDialog(item, "details")}
                      onSchedule={(item) => openDialog(item, "task")}
                      onWhatsApp={openWhatsApp}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 space-y-2 lg:hidden">
              {visibleMembers.map((member) => (
                <MemberCard
                  key={member.user_id}
                  member={member}
                  saving={saving}
                  onComplete={completeFollowUp}
                  onContact={(item) => openDialog(item, "contact")}
                  onDetails={(item) => openDialog(item, "details")}
                  onSchedule={(item) => openDialog(item, "task")}
                  onWhatsApp={openWhatsApp}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-lg sm:max-w-lg">
          {selected && dialogMode === "details" && (
            <MemberDetails
              member={selected}
              saving={saving}
              onResolvePastoral={resolvePastoralRequest}
              onOpenActivityReport={(member) => {
                setActivityReportMember(member);
                closeDialog();
              }}
            />
          )}
          {selected && dialogMode === "contact" && (
            <>
              <DialogHeader>
                <DialogTitle>Registrar conversa com {selected.full_name}</DialogTitle>
              </DialogHeader>
              <label className="space-y-2 text-sm font-semibold text-foreground">
                Resumo da conversa
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} placeholder="Pontos conversados e combinados" />
              </label>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
                <Button onClick={() => void saveFollowUp()} disabled={saving}>Salvar conversa</Button>
              </div>
            </>
          )}
          {selected && dialogMode === "task" && (
            <>
              <DialogHeader>
                <DialogTitle>Agendar acompanhamento</DialogTitle>
              </DialogHeader>
              <label className="space-y-2 text-sm font-semibold text-foreground">
                Proxima acao
                <Input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Ex.: telefonar e marcar uma visita" />
              </label>
              <label className="space-y-2 text-sm font-semibold text-foreground">
                Prazo
                <Input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
              </label>
              <label className="space-y-2 text-sm font-semibold text-foreground">
                Observacoes
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Contexto para o proximo contato" />
              </label>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
                <Button onClick={() => void saveFollowUp()} disabled={saving}>Agendar</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {activityReportMember && (
        <PlayerDetailSheet
          userId={activityReportMember.user_id}
          fullName={activityReportMember.full_name}
          currentArea={area ?? undefined}
          onClose={() => setActivityReportMember(null)}
          onPointsChanged={() => void fetchMembers()}
        />
      )}
    </div>
  );
}

type MemberActions = {
  member: CareMember;
  saving: boolean;
  onComplete: (member: CareMember) => void;
  onContact: (member: CareMember) => void;
  onSchedule: (member: CareMember) => void;
  onWhatsApp: (member: CareMember) => void;
};

function QuickActions({ member, saving, onComplete, onContact, onSchedule, onWhatsApp }: MemberActions) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700" onClick={() => void onWhatsApp(member)} title="Abrir WhatsApp">
        <MessageCircle className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onContact(member)} title="Anotar conversa">
        <NotebookPen className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSchedule(member)} title="Agendar acompanhamento">
        <CalendarClock className="h-4 w-4" />
      </Button>
      {member.follow_up_id && (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700" disabled={saving} onClick={() => void onComplete(member)} title="Concluir pendencia">
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function MemberIdentity({ member }: { member: CareMember }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [member.avatar_url]);

  const showPhoto = Boolean(member.avatar_url) && !imageFailed;

  return (
    <div className="flex min-w-0 items-center gap-3">
      {showPhoto ? (
        <img
          src={member.avatar_url ?? undefined}
          alt={`Foto de ${member.full_name}`}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
          {initials(member.full_name)}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-foreground">{member.full_name}</p>
        <p className="truncate text-xs text-muted-foreground">{member.community || "Sem comunidade"}</p>
      </div>
    </div>
  );
}

function StatusBadge({ member }: { member: CareMember }) {
  const config = statusConfig(member.care_status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClassName}`} />
      {config.label}
    </span>
  );
}

function Trend({ member }: { member: CareMember }) {
  if (member.progress_trend === "up") return <ArrowUp className="h-3.5 w-3.5 text-emerald-600" aria-label="Tendencia de alta" />;
  if (member.progress_trend === "down") return <ArrowDown className="h-3.5 w-3.5 text-red-600" aria-label="Tendencia de queda" />;
  return <span className="text-xs text-muted-foreground" aria-label="Tendencia estavel">-</span>;
}

function MemberTableRow({ member, saving, onComplete, onContact, onDetails, onSchedule, onWhatsApp }: MemberActions & { onDetails: (member: CareMember) => void }) {
  return (
    <tr className="align-middle text-sm transition-colors hover:bg-muted/40">
      <td className="px-2 py-3">
        <button className="block max-w-52 text-left" onClick={() => onDetails(member)}><MemberIdentity member={member} /></button>
      </td>
      <td className="px-2 py-3"><StatusBadge member={member} /></td>
      <td className="px-2 py-3">
        <p className="text-xs font-semibold text-foreground">{relativeDate(member.last_activity_at)}</p>
        <p className="text-xs text-muted-foreground">{SOURCE_LABELS[member.last_activity_source ?? ""] ?? "sem registro"}</p>
      </td>
      <td className="px-2 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">{member.course_progress}%</span>
          <Trend member={member} />
        </div>
        <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-muted"><div className="h-full bg-emerald-600" style={{ width: `${member.course_progress}%` }} /></div>
      </td>
      <td className="px-2 py-3 text-xs"><strong>{member.attendance_4_present}</strong>/{member.attendance_4_total} <span className="text-muted-foreground">ultimos 4</span></td>
      <td className="px-2 py-3 text-xs"><strong>{member.devotionals_7}</strong> em 7d <span className="text-muted-foreground">/ {member.devotionals_30} em 30d</span></td>
      <td className="max-w-44 px-2 py-3">
        <p className="truncate text-xs font-semibold text-foreground">{member.next_action ?? "Nao agendada"}</p>
        <p className={`mt-0.5 text-xs ${isOverdue(member.next_action_due_at) ? "font-semibold text-red-600" : "text-muted-foreground"}`}>{shortDate(member.next_action_due_at)}</p>
      </td>
      <td className="px-2 py-3"><div className="flex justify-end"><QuickActions member={member} saving={saving} onComplete={onComplete} onContact={onContact} onSchedule={onSchedule} onWhatsApp={onWhatsApp} /></div></td>
    </tr>
  );
}

function MemberCard({ member, saving, onComplete, onContact, onDetails, onSchedule, onWhatsApp }: MemberActions & { onDetails: (member: CareMember) => void }) {
  return (
    <article className="rounded-lg border border-border bg-card p-3">
      <button className="flex w-full items-center gap-3 text-left" onClick={() => onDetails(member)}>
        <div className="min-w-0 flex-1"><MemberIdentity member={member} /></div>
        <StatusBadge member={member} />
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`Progresso de ${member.full_name}`} aria-valuenow={member.course_progress} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full rounded-full ${member.care_status === "critical" ? "bg-red-500" : member.care_status === "attention" ? "bg-amber-500" : "bg-emerald-600"}`} style={{ width: `${Math.max(0, Math.min(100, member.course_progress))}%` }} />
        </div>
        <span className="w-9 text-right text-xs font-bold text-foreground">{member.course_progress}%</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 border-y border-border py-3 text-xs">
        <div><p className="font-bold text-foreground">{relativeDate(member.last_activity_at)}</p><p className="mt-0.5 text-muted-foreground">Atividade</p></div>
        <div><div className="flex items-center gap-1"><p className="font-bold text-foreground">{member.course_progress}%</p><Trend member={member} /></div><p className="mt-0.5 text-muted-foreground">Curso</p></div>
        <div><p className="font-bold text-foreground">{member.attendance_4_present}/{member.attendance_4_total}</p><p className="mt-0.5 text-muted-foreground">Presencas</p></div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{member.next_action ?? member.care_reasons[0]}</p>
          <p className={`mt-0.5 text-xs ${isOverdue(member.next_action_due_at) ? "font-semibold text-red-600" : "text-muted-foreground"}`}>{shortDate(member.next_action_due_at)}</p>
        </div>
        <QuickActions member={member} saving={saving} onComplete={onComplete} onContact={onContact} onSchedule={onSchedule} onWhatsApp={onWhatsApp} />
      </div>
    </article>
  );
}

function MemberDetails({ member, saving, onResolvePastoral, onOpenActivityReport }: {
  member: CareMember;
  saving: boolean;
  onResolvePastoral: (member: CareMember) => void;
  onOpenActivityReport: (member: CareMember) => void;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3"><MemberIdentity member={member} /></DialogTitle>
      </DialogHeader>
      <div className="flex items-center gap-2"><StatusBadge member={member} />{member.needs_pastor && <span className="text-xs font-semibold text-red-600">Pedido pastoral ativo</span>}</div>
      <div className="space-y-2 border-y border-border py-3">
        {member.care_reasons.map((reason) => <p key={reason} className="flex gap-2 text-sm text-foreground"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />{reason}</p>)}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
        <Metric label="Ultima atividade" value={relativeDate(member.last_activity_at)} />
        <Metric label="Ultimo acesso" value={relativeDate(member.last_access_at)} />
        <Metric label="Progresso do curso" value={`${member.course_progress}% (${member.lessons_completed}/${member.lessons_total})`} />
        <Metric label="Tendencia em 4 semanas" value={member.progress_trend === "up" ? "Subindo" : member.progress_trend === "down" ? "Caindo" : "Estavel"} />
        <Metric label="Presenca em 4 encontros" value={`${member.attendance_4_present}/${member.attendance_4_total}`} />
        <Metric label="Presenca em 8 encontros" value={`${member.attendance_8_present}/${member.attendance_8_total}`} />
        <Metric label="Devocionais 7/14/30 dias" value={`${member.devotionals_7} / ${member.devotionals_14} / ${member.devotionals_30}`} />
        <Metric label="Ultimo contato" value={relativeDate(member.last_contact_at)} />
        <Metric label="Proxima acao" value={member.next_action ?? "Nao agendada"} />
        <Metric label="Prazo" value={shortDate(member.next_action_due_at)} />
        <Metric label="Responsavel" value={member.assigned_to_name ?? "Lider atual"} />
      </div>
      <Button type="button" variant="outline" onClick={() => onOpenActivityReport(member)} className="w-full">
        <BookOpenCheck className="mr-2 h-4 w-4" /> Ver relatório completo de atividades
      </Button>
      {member.pastoral_request_note && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-900"><strong>Pedido pastoral:</strong> {member.pastoral_request_note}</div>}
      {member.needs_pastor && (
        <Button variant="outline" disabled={saving} onClick={() => void onResolvePastoral(member)} className="border-emerald-300 text-emerald-800">
          <HeartHandshake className="mr-2 h-4 w-4" /> Marcar pedido pastoral como tratado
        </Button>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold text-foreground">{value}</p></div>;
}
