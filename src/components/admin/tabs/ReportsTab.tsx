import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { FileText, Download, TrendingUp, Users, BookOpen, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { fetchAllSupabaseRows } from "@/lib/fetchAllSupabaseRows";
import { isEventVisibleInGroupScope } from "@/lib/eventScope";

type ReportType = "geral" | "presenca" | "devocionais" | "licoes";
type Tables = Database["public"]["Tables"];
type Participant = Pick<Tables["profiles"]["Row"], "user_id" | "full_name" | "community" | "area">;
type AttendanceEntry = Pick<Tables["attendance"]["Row"], "user_id" | "event_id" | "status" | "created_at">;
type DevotionalEntry = Pick<Tables["devotional_progress"]["Row"], "user_id" | "completed_at">;
type Lesson = Pick<Tables["lessons"]["Row"], "id" | "title" | "course_id" | "order_num">;
type LessonResponse = Pick<Tables["lesson_progress"]["Row"], "user_id" | "lesson_id">;
type ReportEvent = Pick<
  Tables["events"]["Row"],
  "id" | "title" | "event_date" | "type" | "turma_id" | "area" | "target_user_id"
>;

interface LessonData {
  lessons: Lesson[];
  responses: LessonResponse[];
}

type LeaderRpcResult<T> = { data: T | null; error: { message: string } | null };
const callLeaderRpc = supabase.rpc.bind(supabase) as unknown as <T = unknown>(
  functionName: string,
  args?: Record<string, unknown>,
) => PromiseLike<LeaderRpcResult<T>>;

const REPORT_OPTIONS: { id: ReportType; label: string; icon: typeof Users }[] = [
  { id: "geral", label: "Visao Geral", icon: TrendingUp },
  { id: "presenca", label: "Presenca", icon: Users },
  { id: "devocionais", label: "Devocionais", icon: Flame },
  { id: "licoes", label: "Licoes", icon: BookOpen },
];

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--brand-green, 142 71% 45%))",
  "hsl(var(--destructive))",
  "hsl(262 83% 58%)",
  "hsl(199 89% 48%)",
];

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escapeCsvCell(value: string | number) {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function normalizeAttendanceStatus(status: string) {
  if (status === "falta") return "faltou";
  if (status === "justificado") return "justificou";
  return status;
}

function isFinalAttendanceStatus(status: string) {
  return ["presente", "faltou", "justificou"].includes(normalizeAttendanceStatus(status));
}

export default function ReportsTab() {
  const { profile, role } = useAuth();
  const { effectiveArea, effectiveTurmaId } = useAreaSwitch();
  const { toast } = useToast();
  const [reportType, setReportType] = useState<ReportType>("geral");
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceEntry[]>([]);
  const [devProgressData, setDevProgressData] = useState<DevotionalEntry[]>([]);
  const [lessonData, setLessonData] = useState<LessonData>({ lessons: [], responses: [] });
  const [events, setEvents] = useState<ReportEvent[]>([]);

  const isAdmin = role === "admin";
  const turmaId = effectiveTurmaId ?? profile?.turma_id ?? null;
  const churchId = profile?.church_id ?? null;

  const fetchReportData = useCallback(async () => {
    if (!churchId || (!turmaId && !isAdmin)) return;
    setLoading(true);

    const args: Record<string, unknown> = { p_church_id: churchId };
    if (turmaId) args.p_turma_id = turmaId;
    else if (effectiveArea) args.p_area = effectiveArea;

    const [profilesResult, lessonsResult, eventsResult] = await Promise.all([
      callLeaderRpc<Participant[]>("get_leader_participant_summaries", args),
      supabase.from("lessons").select("id, title, course_id, order_num").order("order_num"),
      fetchAllSupabaseRows<ReportEvent>((from, to) =>
        supabase
          .from("events")
          .select("id, title, event_date, type, turma_id, area, target_user_id")
          .eq("church_id", churchId)
          .order("event_date", { ascending: false })
          .range(from, to),
      ),
    ]);

    const initialError = profilesResult.error ?? lessonsResult.error ?? eventsResult.error;
    if (initialError) {
      setLoading(false);
      toast({ title: "Não foi possível carregar o relatório", description: initialError.message, variant: "destructive" });
      return;
    }

    const turmaProfiles = profilesResult.data ?? [];
    const turmaUserIds = new Set(turmaProfiles.map((participant) => participant.user_id));
    const userIds = [...turmaUserIds];
    const reportArea = effectiveArea ?? profile?.area ?? "";
    const scopedEvents = (eventsResult.data ?? []).filter((event) =>
      isEventVisibleInGroupScope(event, {
        turmaId,
        area: reportArea,
        userId: null,
      }),
    );
    const scopedEventIds = new Set(scopedEvents.map((event) => event.id));

    if (userIds.length === 0) {
      setParticipants([]);
      setAttendanceData([]);
      setDevProgressData([]);
      setLessonData({ lessons: lessonsResult.data ?? [], responses: [] });
      setEvents(scopedEvents);
      setLoading(false);
      return;
    }

    const churchScope = `church_id.is.null,church_id.eq.${churchId}`;
    const [attendanceResult, devProgressResult, lessonResponsesResult] = await Promise.all([
      fetchAllSupabaseRows<AttendanceEntry>((from, to) =>
        supabase
          .from("attendance")
          .select("user_id, event_id, status, created_at")
          .in("user_id", userIds)
          .or(churchScope)
          .order("created_at", { ascending: true })
          .range(from, to),
      ),
      fetchAllSupabaseRows<DevotionalEntry>((from, to) =>
        supabase
          .from("devotional_progress")
          .select("user_id, completed_at")
          .in("user_id", userIds)
          .or(churchScope)
          .order("completed_at", { ascending: true })
          .range(from, to),
      ),
      fetchAllSupabaseRows<LessonResponse>((from, to) =>
        supabase
          .from("lesson_progress")
          .select("user_id, lesson_id")
          .in("user_id", userIds)
          .eq("is_completed", true)
          .or(churchScope)
          .order("user_id", { ascending: true })
          .range(from, to),
      ),
    ]);

    const progressError = attendanceResult.error ?? devProgressResult.error ?? lessonResponsesResult.error;
    if (progressError) {
      setLoading(false);
      toast({ title: "Relatório incompleto", description: progressError.message, variant: "destructive" });
      return;
    }

    setParticipants(turmaProfiles);
    setAttendanceData((attendanceResult.data ?? []).filter((item) =>
      turmaUserIds.has(item.user_id)
      && scopedEventIds.has(item.event_id)
      && isFinalAttendanceStatus(item.status),
    ));
    setDevProgressData((devProgressResult.data ?? []).filter((item) => turmaUserIds.has(item.user_id)));
    setLessonData({
      lessons: lessonsResult.data ?? [],
      responses: (lessonResponsesResult.data ?? []).filter((item) => turmaUserIds.has(item.user_id)),
    });
    setEvents(scopedEvents);
    setLoading(false);
  }, [churchId, effectiveArea, isAdmin, profile?.area, toast, turmaId]);

  useEffect(() => {
    if (!turmaId && !isAdmin) return;
    fetchReportData();
  }, [fetchReportData, isAdmin, turmaId]);

  const generalStats = useMemo(() => {
    const totalStudents = participants.length;
    const totalDevotionals = devProgressData.length;
    const totalAttendances = attendanceData.filter((item) => item.status === "presente").length;
    const totalLessonsDone = new Set(
      lessonData.responses.map((response) => `${response.user_id}-${response.lesson_id}`),
    ).size;

    return [
      { name: "Alunos", value: totalStudents, icon: "👥" },
      { name: "Devocionais", value: totalDevotionals, icon: "🔥" },
      { name: "Presencas", value: totalAttendances, icon: "✅" },
      { name: "Licoes feitas", value: totalLessonsDone, icon: "📖" },
    ];
  }, [participants, devProgressData, attendanceData, lessonData]);

  const attendanceChartData = useMemo(() => {
    const byEvent: Record<string, { presente: number; ausente: number; justificado: number; title: string }> = {};
    const eventMap = new Map(events.map((event) => [event.id, event.title]));

    attendanceData.forEach((item) => {
      const title = eventMap.get(item.event_id) ?? item.event_id.slice(0, 8);
      if (!byEvent[item.event_id]) byEvent[item.event_id] = { presente: 0, ausente: 0, justificado: 0, title };
      const normalizedStatus = normalizeAttendanceStatus(item.status);
      if (normalizedStatus === "presente") byEvent[item.event_id].presente++;
      else if (normalizedStatus === "justificou") byEvent[item.event_id].justificado++;
      else if (normalizedStatus === "faltou") byEvent[item.event_id].ausente++;
    });

    return Object.values(byEvent).slice(0, 10);
  }, [attendanceData, events]);

  const devChartData = useMemo(() => {
    const byWeek: Record<string, number> = {};

    devProgressData.forEach((item) => {
      const date = new Date(item.completed_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = formatDateKey(weekStart);
      byWeek[key] = (byWeek[key] ?? 0) + 1;
    });

    return Object.entries(byWeek)
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-8)
      .map(([week, count]) => ({
        semana: new Date(`${week}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        devocionais: count,
      }));
  }, [devProgressData]);

  const lessonChartData = useMemo(() => {
    const responsesByLesson: Record<string, Set<string>> = {};
    lessonData.responses.forEach((response) => {
      if (!responsesByLesson[response.lesson_id]) responsesByLesson[response.lesson_id] = new Set();
      responsesByLesson[response.lesson_id].add(response.user_id);
    });

    return lessonData.lessons.slice(0, 12).map((lesson) => ({
      name: lesson.title.length > 15 ? `${lesson.title.slice(0, 15)}...` : lesson.title,
      alunos: responsesByLesson[lesson.id]?.size ?? 0,
    }));
  }, [lessonData]);

  const communityPieData = useMemo(() => {
    const byCommunity: Record<string, number> = {};
    participants.forEach((participant) => {
      const key = participant.community ?? "Sem comunidade";
      byCommunity[key] = (byCommunity[key] ?? 0) + 1;
    });
    return Object.entries(byCommunity).map(([name, value]) => ({ name, value }));
  }, [participants]);

  function exportCSV() {
    const rows = [[
      escapeCsvCell("Nome"),
      escapeCsvCell("Comunidade"),
      escapeCsvCell("Devocionais"),
      escapeCsvCell("Presencas"),
      escapeCsvCell("Licoes"),
    ].join(",")];

    participants.forEach((participant) => {
      const devCount = devProgressData.filter((item) => item.user_id === participant.user_id).length;
      const attendanceCount = attendanceData.filter((item) => item.user_id === participant.user_id && item.status === "presente").length;
      const lessonCount = new Set(
        lessonData.responses
          .filter((response) => response.user_id === participant.user_id)
          .map((response) => response.lesson_id),
      ).size;

      rows.push([
        escapeCsvCell(participant.full_name),
        escapeCsvCell(participant.community ?? ""),
        escapeCsvCell(devCount),
        escapeCsvCell(attendanceCount),
        escapeCsvCell(lessonCount),
      ].join(","));
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `relatorio-turma-${formatDateKey(new Date())}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    window.print();
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-card border border-border rounded-lg p-5">
            <div className="h-6 w-1/3 bg-muted rounded-lg animate-pulse mb-4" />
            <div className="h-40 bg-muted rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-montserrat font-bold text-foreground text-sm">Relatorios</h3>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Excel/CSV
            </Button>
            <Button variant="outline" size="sm" onClick={printReport} className="text-xs gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              PDF
            </Button>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {REPORT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = reportType === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setReportType(option.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-inter font-semibold whitespace-nowrap transition-all ${
                  isActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {reportType === "geral" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {generalStats.map((stat) => (
              <div key={stat.name} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="font-montserrat font-black text-foreground text-lg">{stat.value}</p>
                  <p className="text-muted-foreground text-xs font-inter">{stat.name}</p>
                </div>
              </div>
            ))}
          </div>

          {communityPieData.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="font-montserrat font-bold text-foreground text-sm mb-3">Distribuicao por Comunidade</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={communityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {communityPieData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {reportType === "presenca" && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-montserrat font-bold text-foreground text-sm mb-3">Presenca por Encontro</h4>
          {attendanceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={attendanceChartData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="title"
                  width={90}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value: string) => value.length > 12 ? `${value.slice(0, 12)}...` : value}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="presente" name="Presente" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="justificado" name="Justificado" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="ausente" name="Ausente" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhum dado de presenca disponivel</p>
          )}

          <div className="mt-4 space-y-2">
            <h5 className="font-inter font-semibold text-foreground text-xs">Resumo por aluno</h5>
            {participants.map((participant) => {
              const present = attendanceData.filter((item) => item.user_id === participant.user_id && item.status === "presente").length;
              const total = attendanceData.filter((item) => item.user_id === participant.user_id && isFinalAttendanceStatus(item.status)).length;
              const percent = total > 0 ? Math.round((present / total) * 100) : 0;

              return (
                <div key={participant.user_id} className="flex items-center gap-2">
                  <span className="text-xs font-inter text-foreground truncate w-28">{participant.full_name.split(" ")[0]}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, background: "hsl(var(--primary))" }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{present}/{total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reportType === "devocionais" && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-montserrat font-bold text-foreground text-sm mb-3">Devocionais por Semana</h4>
          {devChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={devChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="devocionais"
                  name="Devocionais"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(var(--secondary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhum dado de devocional disponivel</p>
          )}

          <div className="mt-4 space-y-2">
            <h5 className="font-inter font-semibold text-foreground text-xs">Total por aluno</h5>
            {participants
              .map((participant) => ({ ...participant, count: devProgressData.filter((item) => item.user_id === participant.user_id).length }))
              .sort((left, right) => right.count - left.count)
              .map((participant) => (
                <div key={participant.user_id} className="flex items-center justify-between">
                  <span className="text-xs font-inter text-foreground truncate">{participant.full_name.split(" ")[0]}</span>
                  <span className="text-xs font-montserrat font-bold text-secondary">{participant.count} 🔥</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {reportType === "licoes" && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-montserrat font-bold text-foreground text-sm mb-3">Progresso nas Licoes</h4>
          {lessonChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={lessonChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="alunos" name="Alunos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">Nenhum dado de licoes disponivel</p>
          )}
        </div>
      )}
    </div>
  );
}
