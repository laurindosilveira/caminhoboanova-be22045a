import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, ChevronDown, Filter, Users, CheckCircle, Clock, BookOpen,
  GraduationCap, CalendarDays, Zap, ChevronLeft, Phone, MapPin, Calendar, Star, AlertTriangle,
  Trash2, Eye, X, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Activity = { id: string; type: string; title: string; points: number; order_num: number; subtitle: string | null };
type Participant = {
  user_id: string; full_name: string; community: string; area: string;
  birth_date: string; phone: string; completed_count: number; completed_activity_ids: string[];
};

type StatusReason = {
  icon: string;
  label: string;
  severity: "high" | "medium" | "low";
};

const ACTIVITY_TYPES = [
  { value: "todos", label: "Todos os tipos" },
  { value: "devocional", label: "📖 Devocionais" },
  { value: "formacao", label: "🎓 Formações" },
  { value: "encontro", label: "📅 Encontros" },
  { value: "desafio", label: "✨ Desafios" },
];

function getStatusInfo(completed: number, total: number) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  if (pct === 0) return { label: "Não iniciou", color: "text-muted-foreground", bg: "bg-muted", dot: "bg-muted-foreground" };
  if (pct < 34) return { label: "Iniciando", color: "text-destructive", bg: "bg-destructive/10", dot: "bg-destructive" };
  if (pct < 70) return { label: "Em andamento", color: "text-accent-foreground", bg: "bg-accent/30", dot: "bg-accent" };
  return { label: "Avançado", color: "text-brand-green", bg: "bg-brand-green/10", dot: "bg-brand-green" };
}

function getTypeIcon(type: string) {
  if (type === "devocional") return <BookOpen className="w-3.5 h-3.5" />;
  if (type === "formacao") return <GraduationCap className="w-3.5 h-3.5" />;
  if (type === "encontro") return <CalendarDays className="w-3.5 h-3.5" />;
  return <Zap className="w-3.5 h-3.5" />;
}

function getTypeColor(type: string) {
  if (type === "devocional") return "text-brand-green bg-brand-green/10";
  if (type === "formacao") return "text-secondary bg-secondary/10";
  if (type === "encontro") return "text-primary bg-primary/10";
  return "text-accent-foreground bg-accent/20";
}

function calcAge(birthDate: string) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

type WorshipInfo = { event_type: string; worship_date: string };

type ActivityResponse = {
  question: string;
  response: string;
};

type DevotionalDetail = {
  title: string;
  day_number: number;
  bible_reference: string;
  questions: string[];
  completed_at: string | null;
};

type DetailProps = { participant: Participant; activities: Activity[]; onBack: () => void };

function ParticipantDetail({ participant: p, activities, onBack }: DetailProps) {
  const [typeFilter, setTypeFilter] = useState("todos");
  const [worshipRecords, setWorshipRecords] = useState<WorshipInfo[]>([]);
  const [activityTitleMap, setActivityTitleMap] = useState<Map<string, string>>(new Map());
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [activityResponses, setActivityResponses] = useState<ActivityResponse[]>([]);
  const [devotionalDetail, setDevotionalDetail] = useState<DevotionalDetail | null>(null);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set(p.completed_activity_ids));
  const { toast } = useToast();

  useEffect(() => {
    async function fetchTitles() {
      const [{ data: worshipData }, { data: devData }, { data: lessonData }] = await Promise.all([
        supabase.from("worship_attendance").select("event_type, worship_date").eq("user_id", p.user_id).eq("status", "aprovado").order("worship_date", { ascending: true }),
        supabase.from("devotional_content").select("activity_id, day_number, lesson_id").not("activity_id", "is", null),
        supabase.from("lessons").select("id, title"),
      ]);

      setWorshipRecords(worshipData ?? []);

      const lessonMap = new Map<string, string>();
      (lessonData ?? []).forEach(l => lessonMap.set(l.id, l.title));

      const titleMap = new Map<string, string>();

      (devData ?? []).forEach(d => {
        if (d.activity_id) {
          const lessonTitle = d.lesson_id ? lessonMap.get(d.lesson_id) : null;
          titleMap.set(d.activity_id, lessonTitle ? `Devocional dia ${d.day_number} - ${lessonTitle}` : `Devocional dia ${d.day_number}`);
        }
      });

      const formacaoActivities = activities.filter(a => a.type === "formacao").sort((a, b) => a.order_num - b.order_num);
      const { data: orderedLessons } = await supabase.from("lessons").select("id, title, order_num, course_id").order("course_id").order("order_num");
      if (orderedLessons) {
        formacaoActivities.forEach((act, idx) => {
          if (orderedLessons[idx]) {
            titleMap.set(act.id, orderedLessons[idx].title);
          }
        });
      }

      const encontroActivities = activities.filter(a => a.type === "encontro").sort((a, b) => a.order_num - b.order_num);
      encontroActivities.forEach((act, idx) => {
        if (p.completed_activity_ids.includes(act.id) && (worshipData ?? [])[idx]) {
          const w = (worshipData ?? [])[idx];
          const label = w.event_type === "jemiac" ? "JEMIAC" : w.event_type === "retiro" ? "Retiro" : "Culto";
          titleMap.set(act.id, label);
        }
      });

      setActivityTitleMap(titleMap);
    }
    fetchTitles();
  }, [p.user_id, activities]);

  async function handleViewActivity(activity: Activity) {
    if (!completedIds.has(activity.id)) return;
    setViewingActivity(activity);
    setLoadingResponses(true);
    setActivityResponses([]);
    setDevotionalDetail(null);

    if (activity.type === "devocional") {
      // Find the devotional_content linked to this activity
      const { data: devContent } = await supabase
        .from("devotional_content")
        .select("id, title, day_number, bible_reference, questions")
        .eq("activity_id", activity.id)
        .maybeSingle();

      if (devContent) {
        // Check if user completed it
        const { data: devProgress } = await supabase
          .from("devotional_progress")
          .select("completed_at")
          .eq("user_id", p.user_id)
          .eq("devotional_id", devContent.id)
          .maybeSingle();

        setDevotionalDetail({
          title: devContent.title,
          day_number: devContent.day_number,
          bible_reference: devContent.bible_reference,
          questions: devContent.questions ?? [],
          completed_at: devProgress?.completed_at ?? null,
        });
      }
    } else if (activity.type === "formacao") {
      // Find the lesson linked to this activity (by order mapping)
      const formacaoActivities = activities.filter(a => a.type === "formacao").sort((a, b) => a.order_num - b.order_num);
      const idx = formacaoActivities.findIndex(a => a.id === activity.id);
      
      const { data: orderedLessons } = await supabase
        .from("lessons").select("id, title, order_num, course_id")
        .order("course_id").order("order_num");

      if (orderedLessons && orderedLessons[idx]) {
        const lessonId = orderedLessons[idx].id;
        
        // Get lesson content questions
        const { data: lessonContent } = await supabase
          .from("lesson_content")
          .select("questions")
          .eq("lesson_id", lessonId)
          .maybeSingle();

        // Get user responses
        const { data: responses } = await supabase
          .from("lesson_responses")
          .select("question_key, response")
          .eq("user_id", p.user_id)
          .eq("lesson_id", lessonId)
          .order("question_key");

        const questions = lessonContent?.questions ?? [];
        const responseMap = new Map((responses ?? []).map(r => [r.question_key, r.response]));

        const mapped: ActivityResponse[] = questions.map((q, i) => ({
          question: q,
          response: responseMap.get(`q${i}`) ?? responseMap.get(`question_${i}`) ?? responseMap.get(String(i)) ?? "",
        }));

        // Also add any responses with keys not matching questions
        (responses ?? []).forEach(r => {
          const exists = mapped.some(m => m.response === r.response && m.response !== "");
          if (!exists && r.response) {
            mapped.push({ question: r.question_key, response: r.response });
          }
        });

        setActivityResponses(mapped.filter(m => m.response));
      }
    }

    setLoadingResponses(false);
  }

  async function handleDeleteActivity(activityId: string) {
    setDeletingId(activityId);
    const activity = activities.find(a => a.id === activityId);

    try {
      // Delete from user_progress
      await supabase.from("user_progress").delete().eq("user_id", p.user_id).eq("activity_id", activityId);

      // If devotional, also delete devotional_progress
      if (activity?.type === "devocional") {
        const { data: devContent } = await supabase
          .from("devotional_content")
          .select("id")
          .eq("activity_id", activityId)
          .maybeSingle();
        if (devContent) {
          await supabase.from("devotional_progress").delete().eq("user_id", p.user_id).eq("devotional_id", devContent.id);
        }
      }

      // If formacao, also delete lesson_responses
      if (activity?.type === "formacao") {
        const formacaoActivities = activities.filter(a => a.type === "formacao").sort((a, b) => a.order_num - b.order_num);
        const idx = formacaoActivities.findIndex(a => a.id === activityId);
        const { data: orderedLessons } = await supabase
          .from("lessons").select("id").order("course_id").order("order_num");
        if (orderedLessons && orderedLessons[idx]) {
          await supabase.from("lesson_responses").delete().eq("user_id", p.user_id).eq("lesson_id", orderedLessons[idx].id);
        }
      }

      // Update local state
      const newCompleted = new Set(completedIds);
      newCompleted.delete(activityId);
      setCompletedIds(newCompleted);
      p.completed_activity_ids = [...newCompleted];
      p.completed_count = newCompleted.size;

      toast({ title: "Atividade removida", description: `Pontuação de "${activity?.title ?? "atividade"}" foi retirada.` });
    } catch (err) {
      toast({ title: "Erro ao remover", description: "Não foi possível remover a atividade.", variant: "destructive" });
    }

    setDeletingId(null);
    setConfirmDeleteId(null);
    setViewingActivity(null);
  }

  const pct = activities.length > 0 ? Math.round((completedIds.size / activities.length) * 100) : 0;
  const status = getStatusInfo(completedIds.size, activities.length);
  const totalPts = activities.filter(a => completedIds.has(a.id)).reduce((s, a) => s + a.points, 0);
  const age = calcAge(p.birth_date);

  const filteredActivities = typeFilter === "todos" ? activities : activities.filter(a => a.type === typeFilter);

  const byType = (type: string) => {
    const list = activities.filter(a => a.type === type);
    const done = list.filter(a => completedIds.has(a.id)).length;
    return { total: list.length, done };
  };

  // Activity response viewer modal
  if (viewingActivity) {
    const done = completedIds.has(viewingActivity.id);
    return (
      <div>
        <button onClick={() => { setViewingActivity(null); setActivityResponses([]); setDevotionalDetail(null); }}
          className="flex items-center gap-2 text-muted-foreground font-inter text-sm mb-4 hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar às atividades
        </button>

        <div className="bg-card rounded-2xl border border-border p-5 mb-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(viewingActivity.type)}`}>
              {getTypeIcon(viewingActivity.type)}
            </div>
            <div className="flex-1">
              <h3 className="font-montserrat font-bold text-foreground text-sm">
                {activityTitleMap.get(viewingActivity.id) ?? viewingActivity.title}
              </h3>
              <p className="font-inter text-[10px] text-muted-foreground">
                {viewingActivity.type === "devocional" ? "📖 Devocional" : viewingActivity.type === "formacao" ? "🎓 Formação" : viewingActivity.type === "encontro" ? "📅 Encontro" : "✨ Desafio"}
                {" · "}{viewingActivity.points} pts
              </p>
            </div>
            {done && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-green/10 text-brand-green">✅ Concluída</span>
            )}
          </div>

          {loadingResponses ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground font-inter text-sm animate-pulse">Carregando respostas...</p>
            </div>
          ) : (
            <>
              {/* Devotional detail */}
              {devotionalDetail && (
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="font-inter text-xs text-muted-foreground mb-1">📖 Referência bíblica</p>
                    <p className="font-inter text-sm text-foreground">{devotionalDetail.bible_reference || "Não informada"}</p>
                  </div>
                  {devotionalDetail.completed_at && (
                    <div className="bg-brand-green/5 rounded-xl p-3 border border-brand-green/20">
                      <p className="font-inter text-xs text-brand-green">
                        ✅ Concluído em {new Date(devotionalDetail.completed_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  )}
                  {devotionalDetail.questions.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-montserrat font-bold text-foreground text-xs">Perguntas do devocional:</p>
                      {devotionalDetail.questions.map((q, i) => (
                        <div key={i} className="bg-muted/30 rounded-xl p-3 border border-border">
                          <p className="font-inter text-xs text-muted-foreground mb-1">Pergunta {i + 1}:</p>
                          <p className="font-inter text-sm text-foreground">{q}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {!devotionalDetail.completed_at && (
                    <div className="bg-accent/10 rounded-xl p-3 border border-accent/20">
                      <p className="font-inter text-xs text-accent-foreground">⚠️ Este devocional está marcado como atividade concluída, mas sem registro de conclusão detalhado.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Lesson responses */}
              {activityResponses.length > 0 && (
                <div className="space-y-3">
                  <p className="font-montserrat font-bold text-foreground text-xs">Respostas do aluno:</p>
                  {activityResponses.map((r, i) => (
                    <div key={i} className="bg-muted/30 rounded-xl p-3 border border-border space-y-1.5">
                      <p className="font-inter text-xs text-muted-foreground font-medium">📝 {r.question}</p>
                      <p className="font-inter text-sm text-foreground leading-relaxed whitespace-pre-wrap">{r.response}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* No responses found */}
              {!devotionalDetail && activityResponses.length === 0 && viewingActivity.type !== "encontro" && viewingActivity.type !== "desafio" && (
                <div className="text-center py-6">
                  <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="font-inter text-sm text-muted-foreground">Nenhuma resposta salva para esta atividade.</p>
                  <p className="font-inter text-[10px] text-muted-foreground mt-1">O aluno pode ter concluído sem registrar respostas detalhadas.</p>
                </div>
              )}

              {(viewingActivity.type === "encontro" || viewingActivity.type === "desafio") && (
                <div className="text-center py-6">
                  <p className="font-inter text-sm text-muted-foreground">
                    {viewingActivity.type === "encontro" ? "📅 Atividade de presença em encontro." : "✨ Atividade de desafio comunitário."}
                  </p>
                  <p className="font-inter text-[10px] text-muted-foreground mt-1">Este tipo de atividade não possui respostas escritas.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete action */}
        {done && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4">
            {confirmDeleteId === viewingActivity.id ? (
              <div className="space-y-3">
                <p className="font-inter text-sm text-destructive font-medium">⚠️ Tem certeza que deseja remover esta atividade?</p>
                <p className="font-inter text-xs text-muted-foreground">
                  Isso irá remover a pontuação (+{viewingActivity.points}pts) e todas as respostas associadas de <strong>{p.full_name}</strong>.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteActivity(viewingActivity.id)}
                    disabled={deletingId === viewingActivity.id}
                    className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-inter text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === viewingActivity.id ? "Removendo..." : "🗑️ Confirmar remoção"}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-4 py-2.5 rounded-xl bg-muted text-foreground font-inter text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(viewingActivity.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-destructive/30 text-destructive font-inter text-sm font-medium hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Remover atividade e pontuação
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground font-inter text-sm mb-4 hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Voltar aos participantes
      </button>

      {/* Profile card */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="font-montserrat font-black text-primary text-2xl">{p.full_name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="font-montserrat font-black text-foreground text-lg">{p.full_name}</h2>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-inter font-medium ${status.bg} ${status.color}`}>{status.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground font-inter">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{p.community} · {p.area}</span>
          </div>
          {p.phone && (
            <div className="flex items-center gap-2 text-muted-foreground font-inter">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{p.phone}</span>
            </div>
          )}
          {age !== null && (
            <div className="flex items-center gap-2 text-muted-foreground font-inter">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{age} anos</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-accent font-montserrat font-bold">
            <Star className="w-4 h-4 flex-shrink-0" />
            <span>{totalPts} pontos</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-muted-foreground font-inter text-xs">{completedIds.size}/{activities.length} atividades</span>
            <span className="font-montserrat font-bold text-foreground text-xs">{pct}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{
              width: `${pct}%`,
              background: pct >= 70 ? "var(--gradient-green)" : pct >= 34 ? "var(--gradient-orange)" : "hsl(var(--destructive))",
            }} />
          </div>
        </div>
      </div>

      {/* Mini stats by type */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { type: "devocional", label: "Devocionais", icon: "📖" },
          { type: "formacao", label: "Formações", icon: "🎓" },
          { type: "encontro", label: "Encontros", icon: "📅" },
          { type: "desafio", label: "Desafios", icon: "✨" },
        ].map(({ type, label, icon }) => {
          const { total, done } = byType(type);
          return (
            <div key={type} className="bg-card rounded-xl border border-border p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{icon}</span>
                <span className="font-inter text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="font-montserrat font-black text-foreground text-lg leading-none">{done}<span className="text-muted-foreground font-inter text-xs font-normal">/{total}</span></p>
            </div>
          );
        })}
      </div>

      {/* Activity detail */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="font-montserrat font-bold text-foreground text-sm">Atividades</p>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-inter border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none"
          >
            {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <p className="font-inter text-[10px] text-muted-foreground mb-3">Clique em uma atividade concluída para ver as respostas</p>
        <div className="space-y-2">
          {filteredActivities.map((activity) => {
            const done = completedIds.has(activity.id);
            return (
              <div key={activity.id}
                onClick={() => done && handleViewActivity(activity)}
                className={`flex items-center gap-3 rounded-xl p-2 transition-all ${
                  done ? "cursor-pointer hover:bg-muted/50 hover:border-primary/20" : ""
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? "bg-brand-green/10" : "bg-muted"}`}>
                  {done ? <CheckCircle className="w-4 h-4 text-brand-green" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-inter text-xs truncate ${done ? "text-foreground" : "text-muted-foreground"}`}>{activityTitleMap.get(activity.id) ?? activity.title}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 ${getTypeColor(activity.type)}`}>
                  {getTypeIcon(activity.type)} {activity.type}
                </span>
                {done ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-inter text-accent font-bold">+{activity.points}pts</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                ) : (
                  <span className="text-[10px] font-inter text-muted-foreground">pendente</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type Props = {
  participants: Participant[];
  activities: Activity[];
  communities: string[];
};

type StatusFilter = "todos" | "iniciando" | "andamento" | "avancado";

export default function ParticipantsTab({ participants, activities, communities }: Props) {
  const [search, setSearch] = useState("");
  const [communityFilter, setCommunityFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const [statusReasons, setStatusReasons] = useState<Record<string, StatusReason[]>>({});

  // Fetch objective status reasons from DB
  useEffect(() => {
    async function fetchReasons() {
      const userIds = participants.map(p => p.user_id);
      if (userIds.length === 0) return;

      const now = new Date();
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

      const [{ data: devData }, { data: attData }, { data: planData }, { data: assessData }] = await Promise.all([
        supabase.from("devotional_progress").select("user_id, completed_at").in("user_id", userIds),
        supabase.from("attendance").select("user_id, status, created_at").in("user_id", userIds).order("created_at", { ascending: false }),
        supabase.from("discipleship_plans").select("user_id, health_status, is_priority").in("user_id", userIds),
        supabase.from("spiritual_assessments").select("user_id, needs_pastor, prayer_score, presence_score, month, year")
          .in("user_id", userIds).eq("month", now.getMonth() + 1).eq("year", now.getFullYear()),
      ]);

      // Last devotional per user
      const lastDev: Record<string, Date> = {};
      (devData ?? []).forEach(d => {
        const dt = new Date(d.completed_at);
        if (!lastDev[d.user_id] || dt > lastDev[d.user_id]) lastDev[d.user_id] = dt;
      });

      // Consecutive absences per user
      const userAtt: Record<string, string[]> = {};
      (attData ?? []).forEach(a => {
        if (!userAtt[a.user_id]) userAtt[a.user_id] = [];
        userAtt[a.user_id].push(a.status);
      });

      const planMap: Record<string, { health_status: string; is_priority: boolean }> = {};
      (planData ?? []).forEach(p => { planMap[p.user_id] = { health_status: p.health_status, is_priority: p.is_priority ?? false }; });

      const assessMap: Record<string, any> = {};
      (assessData ?? []).forEach(a => { assessMap[a.user_id] = a; });

      const reasons: Record<string, StatusReason[]> = {};

      participants.forEach(p => {
        const r: StatusReason[] = [];

        // Consecutive absences
        const statuses = userAtt[p.user_id] ?? [];
        let consecutive = 0;
        for (const s of statuses) {
          if (s !== "presente") consecutive++;
          else break;
        }
        if (consecutive >= 3) r.push({ icon: "📅", label: `${consecutive} faltas seguidas`, severity: "high" });
        else if (consecutive === 2) r.push({ icon: "📅", label: "2 faltas seguidas", severity: "medium" });

        // Devotional inactivity
        const last = lastDev[p.user_id];
        if (!last) {
          r.push({ icon: "📖", label: "Nunca fez devocional", severity: "high" });
        } else if (last < fourteenDaysAgo) {
          const days = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
          r.push({ icon: "📖", label: `Sem devocional há ${days} dias`, severity: "high" });
        } else if (last < tenDaysAgo) {
          const days = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
          r.push({ icon: "📖", label: `Sem devocional há ${days} dias`, severity: "medium" });
        }

        // Needs pastor
        if (assessMap[p.user_id]?.needs_pastor) {
          r.push({ icon: "🙏", label: "Pediu ajuda pastoral", severity: "high" });
        }

        // Health status
        const plan = planMap[p.user_id];
        if (plan?.health_status === "critico") {
          r.push({ icon: "🚨", label: "Status crítico", severity: "high" });
        } else if (plan?.is_priority) {
          r.push({ icon: "⚠️", label: "Prioridade pastoral", severity: "medium" });
        }

        // Low activity progress
        if (activities.length > 0 && p.completed_count === 0) {
          r.push({ icon: "😴", label: "Nenhuma atividade concluída", severity: "medium" });
        }

        if (r.length > 0) reasons[p.user_id] = r;
      });

      setStatusReasons(reasons);
    }
    fetchReasons();
  }, [participants, activities]);

  if (selectedParticipant) {
    return <ParticipantDetail participant={selectedParticipant} activities={activities} onBack={() => setSelectedParticipant(null)} />;
  }

  const filtered = participants.filter((p) => {
    if (search && !p.full_name.toLowerCase().includes(search.toLowerCase()) && !p.community.toLowerCase().includes(search.toLowerCase())) return false;
    if (communityFilter !== "todas" && p.community !== communityFilter) return false;
    const pct = activities.length > 0 ? (p.completed_count / activities.length) * 100 : 0;
    if (statusFilter === "iniciando" && (pct === 0 || pct >= 34)) return false;
    if (statusFilter === "andamento" && (pct < 34 || pct >= 70)) return false;
    if (statusFilter === "avancado" && pct < 70) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou comunidade..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <select value={communityFilter} onChange={(e) => setCommunityFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-xs focus:outline-none focus:ring-2 focus:ring-secondary transition-all appearance-none">
              <option value="todas">Todas as comunidades</option>
              {communities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="relative">
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-xs focus:outline-none focus:ring-2 focus:ring-secondary transition-all appearance-none">
              <option value="todos">Qualquer status</option>
              <option value="iniciando">Iniciando</option>
              <option value="andamento">Em andamento</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground font-inter text-xs">
            {filtered.length} participante{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </span>
          {(communityFilter !== "todas" || statusFilter !== "todos" || search) && (
            <button onClick={() => { setCommunityFilter("todas"); setStatusFilter("todos"); setSearch(""); }}
              className="ml-auto text-secondary font-inter text-xs font-medium">
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-montserrat font-bold text-foreground">Nenhum participante encontrado</p>
          <p className="text-muted-foreground font-inter text-sm mt-1">Tente ajustar os filtros.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const pct = activities.length > 0 ? Math.round((p.completed_count / activities.length) * 100) : 0;
            const status = getStatusInfo(p.completed_count, activities.length);
            const totalPts = activities.filter(a => p.completed_activity_ids.includes(a.id)).reduce((s, a) => s + a.points, 0);
            const age = calcAge(p.birth_date);
            return (
              <button
                key={p.user_id}
                onClick={() => setSelectedParticipant(p)}
                className="w-full text-left bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:border-primary/30 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-montserrat font-black text-primary text-lg">{p.full_name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-montserrat font-bold text-card-foreground text-sm truncate">{p.full_name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-muted-foreground font-inter text-xs">{p.community}</span>
                          {age !== null && <><span className="text-muted-foreground">·</span><span className="text-muted-foreground font-inter text-xs">{age} anos</span></>}
                          <span className="text-muted-foreground">·</span>
                          <span className="text-accent font-inter text-xs font-medium">⭐ {totalPts}pts</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-inter font-medium flex-shrink-0 ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-muted-foreground font-inter text-xs">{p.completed_count}/{activities.length} atividades</span>
                      <span className="font-montserrat font-bold text-foreground text-xs">{pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${pct}%`,
                        background: pct >= 70 ? "var(--gradient-green)" : pct >= 34 ? "var(--gradient-orange)" : "hsl(var(--destructive))",
                      }} />
                    </div>
                  </div>
                  {/* Status reasons */}
                  {statusReasons[p.user_id] && statusReasons[p.user_id].length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {statusReasons[p.user_id].map((reason, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-inter font-medium ${
                            reason.severity === "high"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-accent/20 text-accent-foreground"
                          }`}
                        >
                          {reason.icon} {reason.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
