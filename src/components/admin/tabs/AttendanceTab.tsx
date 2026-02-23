import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  CalendarDays, Users, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp,
  Star, BookOpen, FileText, Save, Church,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

type Event = {
  id: string; title: string; event_date: string; type: string;
  location: string | null; community: string | null; area: string | null;
};
type Participant = {
  user_id: string; full_name: string; community: string;
};
type Activity = {
  id: string; title: string; type: string; order_num: number;
};
type AttendanceStatus = "presente" | "faltou" | "justificou";
type Evaluation = {
  participation_score: number | null;
  understanding_score: number | null;
  engagement_score: number | null;
  notes: string;
};

const STATUS_CFG: Record<AttendanceStatus, { label: string; icon: React.ReactNode; btn: string; active: string }> = {
  presente: {
    label: "Presente",
    icon: <CheckCircle2 className="w-4 h-4" />,
    btn: "border-brand-green text-brand-green hover:bg-brand-green/10",
    active: "bg-brand-green text-white border-brand-green",
  },
  faltou: {
    label: "Faltou",
    icon: <XCircle className="w-4 h-4" />,
    btn: "border-destructive text-destructive hover:bg-destructive/10",
    active: "bg-destructive text-white border-destructive",
  },
  justificou: {
    label: "Justificou",
    icon: <Clock className="w-4 h-4" />,
    btn: "border-accent text-accent-foreground hover:bg-accent/20",
    active: "bg-accent text-accent-foreground border-accent",
  },
};

const TYPE_EMOJI: Record<string, string> = {
  encontro: "📅", culto: "⛪", retiro: "🏕️", evento: "🎉",
};
const SCORE_LABELS = ["", "Fraco", "Regular", "Bom", "Muito bom", "Excelente"];

type WorshipRequest = {
  id: string; user_id: string; worship_date: string; worship_time: string;
  preacher_name: string; status: string; created_at: string;
  full_name?: string; community?: string;
};

export default function AttendanceTab({ participants, activities }: { participants: Participant[]; activities: Activity[] }) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, Record<string, AttendanceStatus>>>({});
  const [savingAtt, setSavingAtt] = useState<string | null>(null);

  // Meetings-specific state
  const [evaluations, setEvaluations] = useState<Record<string, Record<string, Evaluation>>>({});
  const [prepReport, setPrepReport] = useState<Record<string, string[]>>({});
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [savingEval, setSavingEval] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);

  // Worship attendance requests
  const [worshipRequests, setWorshipRequests] = useState<WorshipRequest[]>([]);
  const [savingWorship, setSavingWorship] = useState<string | null>(null);

  useEffect(() => { fetchEvents(); fetchWorshipRequests(); }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("id, title, event_date, type, location, community, area")
      .order("event_date", { ascending: false })
      .limit(30);
    setEvents(data ?? []);
    setLoading(false);
  }

  async function fetchWorshipRequests() {
    const participantIds = participants.map(p => p.user_id);
    if (participantIds.length === 0) return;
    const { data } = await supabase
      .from("worship_attendance")
      .select("*")
      .in("user_id", participantIds)
      .order("created_at", { ascending: false })
      .limit(50);
    const enriched = (data ?? []).map(w => {
      const p = participants.find(p => p.user_id === w.user_id);
      return { ...w, full_name: p?.full_name ?? "Desconhecido", community: p?.community ?? "" };
    });
    setWorshipRequests(enriched);
  }

  async function handleWorshipAction(id: string, action: "aprovado" | "rejeitado") {
    setSavingWorship(id);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("worship_attendance").update({
      status: action,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: action === "aprovado" ? "Presença aprovada ✅" : "Presença rejeitada" });
      setWorshipRequests(prev => prev.map(w => w.id === id ? { ...w, status: action } : w));
    }
    setSavingWorship(null);
  }

  async function loadEventData(eventId: string, eventDate: string, isEncontro: boolean) {
    const eventParticipants = getParticipantsForEvent(events.find(e => e.id === eventId)!);
    const userIds = eventParticipants.map(p => p.user_id);

    // Always load attendance
    const { data: attData } = await supabase.from("attendance").select("user_id, status").eq("event_id", eventId);

    const attMap: Record<string, AttendanceStatus> = {};
    (attData ?? []).forEach((r: any) => { attMap[r.user_id] = r.status as AttendanceStatus; });
    setAttendance(prev => ({ ...prev, [eventId]: attMap }));

    // For encontros, also load evaluations + progress
    if (isEncontro && userIds.length > 0) {
      const [{ data: evalData }, { data: progressData }] = await Promise.all([
        supabase.from("meeting_evaluations").select("*").eq("event_id", eventId),
        supabase.from("user_progress").select("user_id, activity_id, completed_at").in("user_id", userIds),
      ]);

      const evalMap: Record<string, Evaluation> = {};
      (evalData ?? []).forEach((e: any) => {
        evalMap[e.user_id] = {
          participation_score: e.participation_score,
          understanding_score: e.understanding_score,
          engagement_score: e.engagement_score,
          notes: e.notes ?? "",
        };
      });
      setEvaluations(prev => ({ ...prev, [eventId]: evalMap }));

      const eventDateObj = new Date(eventDate);
      const prepMap: Record<string, string[]> = {};
      (progressData ?? []).forEach((pr: any) => {
        if (new Date(pr.completed_at) <= eventDateObj) {
          if (!prepMap[pr.user_id]) prepMap[pr.user_id] = [];
          prepMap[pr.user_id].push(pr.activity_id);
        }
      });
      setPrepReport(prepMap);
    }
  }


  async function toggleEvent(eventId: string) {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
      setSelectedParticipant(null);
      return;
    }
    setExpandedEvent(eventId);
    setSelectedParticipant(null);
    const event = events.find(e => e.id === eventId);
    if (event) await loadEventData(eventId, event.event_date, event.type === "encontro");
  }

  async function markAttendance(eventId: string, userId: string, status: AttendanceStatus) {
    setSavingAtt(`${eventId}-${userId}`);
    const current = attendance[eventId]?.[userId];
    if (current === status) {
      await supabase.from("attendance").delete().eq("event_id", eventId).eq("user_id", userId);
      setAttendance(prev => {
        const updated = { ...prev[eventId] };
        delete updated[userId];
        return { ...prev, [eventId]: updated };
      });
    } else {
      await supabase.from("attendance").upsert({
        event_id: eventId, user_id: userId, status,
      }, { onConflict: "event_id,user_id" });
      setAttendance(prev => ({
        ...prev,
        [eventId]: { ...(prev[eventId] ?? {}), [userId]: status },
      }));
    }
    setSavingAtt(null);
  }

  function updateLocalEval(eventId: string, userId: string, field: keyof Evaluation, value: any) {
    setEvaluations(prev => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] ?? {}),
        [userId]: {
          ...(prev[eventId]?.[userId] ?? { participation_score: null, understanding_score: null, engagement_score: null, notes: "" }),
          [field]: value,
        },
      },
    }));
  }

  async function saveEvaluation(eventId: string, userId: string) {
    setSavingEval(true);
    const ev = evaluations[eventId]?.[userId];
    if (!ev) { setSavingEval(false); return; }
    const { error } = await supabase.from("meeting_evaluations").upsert({
      event_id: eventId, user_id: userId, admin_id: profile?.user_id ?? "",
      participation_score: ev.participation_score,
      understanding_score: ev.understanding_score,
      engagement_score: ev.engagement_score,
      notes: ev.notes,
    }, { onConflict: "event_id,user_id" });
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Avaliação salva ✅" });
    }
    setSavingEval(false);
  }

  function getParticipantsForEvent(event: Event) {
    return participants.filter(p => {
      if (event.community) return p.community === event.community;
      return true;
    });
  }

  function getAttendanceSummary(eventId: string, eventParticipants: Participant[]) {
    const map = attendance[eventId] ?? {};
    const total = eventParticipants.length;
    const present = Object.values(map).filter(s => s === "presente").length;
    const absent = Object.values(map).filter(s => s === "faltou").length;
    const justified = Object.values(map).filter(s => s === "justificou").length;
    const unmarked = total - present - absent - justified;
    return { total, present, absent, justified, unmarked };
  }

  function ScoreSelector({ value, onChange, label }: { value: number | null; onChange: (v: number) => void; label: string }) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-inter font-medium text-muted-foreground">{label}</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => onChange(n)}
              title={SCORE_LABELS[n]}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                value === n
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-primary/20"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {value && <p className="text-[10px] text-primary font-inter">{SCORE_LABELS[value]}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="bg-muted rounded-2xl h-20 animate-pulse" />)}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="font-montserrat font-bold text-foreground">Nenhum evento encontrado</p>
        <p className="text-muted-foreground font-inter text-sm mt-1">Crie eventos na aba Agenda primeiro.</p>
      </div>
    );
  }

  const EVENT_TYPES = [
    { value: null, label: "Todos" },
    { value: "encontro", label: "📅 Encontros" },
    { value: "culto", label: "⛪ Cultos" },
    { value: "jemiac", label: "✝️ JEMIAC" },
    { value: "retiro", label: "🏕️ Retiros" },
    { value: "evento", label: "🎉 Eventos" },
  ];

  const filteredEvents = filterType ? events.filter(e => e.type === filterType) : events;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-montserrat font-black text-foreground text-lg">Presença & Encontros</h2>
          <p className="text-muted-foreground text-xs font-inter">Presença, avaliação e preparação</p>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {EVENT_TYPES.map(t => (
          <button
            key={t.label}
            onClick={() => setFilterType(t.value)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-inter font-medium transition-all ${
              filterType === t.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-primary/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Worship attendance requests */}
      {(filterType === null || filterType === "culto") && worshipRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Church className="w-4 h-4 text-primary" />
            <p className="font-montserrat font-bold text-foreground text-sm">
              Confirmações de Cultos
              {(() => {
                const pending = worshipRequests.filter(w => w.status === "pendente").length;
                return pending > 0 ? (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-inter font-bold bg-accent/20 text-accent-foreground">
                    {pending} pendente{pending !== 1 ? "s" : ""}
                  </span>
                ) : null;
              })()}
            </p>
          </div>
          {worshipRequests.map(w => {
            const isPending = w.status === "pendente";
            const isSaving = savingWorship === w.id;
            return (
              <div key={w.id} className={`bg-card rounded-2xl border ${isPending ? "border-accent/50" : "border-border"} p-4 shadow-sm space-y-2`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">⛪</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-montserrat font-bold text-foreground text-sm">{w.full_name}</p>
                    <p className="text-muted-foreground font-inter text-xs">{w.community}</p>
                  </div>
                  {!isPending && (
                    <span className={`text-xs font-inter font-medium px-2 py-0.5 rounded-full ${
                      w.status === "aprovado" ? "bg-brand-green/10 text-brand-green" : "bg-destructive/10 text-destructive"
                    }`}>
                      {w.status === "aprovado" ? "✅ Aprovado" : "❌ Rejeitado"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs font-inter text-muted-foreground">
                  <span>📅 {new Date(w.worship_date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  <span>🕐 {w.worship_time}</span>
                  <span>🎤 {w.preacher_name}</span>
                </div>
                {isPending && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleWorshipAction(w.id, "aprovado")}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-green/10 text-brand-green font-inter text-xs font-medium border border-brand-green/30 hover:bg-brand-green/20 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                    </button>
                    <button
                      onClick={() => handleWorshipAction(w.id, "rejeitado")}
                      disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-destructive/10 text-destructive font-inter text-xs font-medium border border-destructive/30 hover:bg-destructive/20 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Rejeitar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        {filteredEvents.map(event => {
          const isExpanded = expandedEvent === event.id;
          const isEncontro = event.type === "encontro";
          const eventParticipants = getParticipantsForEvent(event);
          const summary = isExpanded ? getAttendanceSummary(event.id, eventParticipants) : null;
          const dateObj = new Date(event.event_date);
          const evalMap = evaluations[event.id] ?? {};
          const evaluatedCount = isEncontro ? Object.keys(evalMap).filter(uid => evalMap[uid]?.participation_score).length : 0;

          return (
            <div key={event.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Event header */}
              <button
                onClick={() => toggleEvent(event.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-lg leading-none">{TYPE_EMOJI[event.type] ?? "📅"}</span>
                  <span className="font-montserrat font-black text-primary text-xs">
                    {format(dateObj, "d", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-montserrat font-bold text-foreground text-sm">{event.title}</p>
                    {isEncontro && (
                      <span className="text-[10px] font-inter font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">Encontro</span>
                    )}
                  </div>
                  <p className="text-muted-foreground font-inter text-xs">
                    {format(dateObj, "d 'de' MMMM yyyy", { locale: ptBR })}
                    {event.community && ` · ${event.community}`}
                  </p>
                  {isExpanded && summary && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs font-inter text-brand-green font-medium">
                        <CheckCircle2 className="w-3 h-3" />{summary.present}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-inter text-destructive font-medium">
                        <XCircle className="w-3 h-3" />{summary.absent}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-inter text-accent-foreground font-medium">
                        <Clock className="w-3 h-3" />{summary.justified}
                      </span>
                      {summary.unmarked > 0 && (
                        <span className="text-xs font-inter text-muted-foreground">{summary.unmarked} sem registro</span>
                      )}
                      {isEncontro && evaluatedCount > 0 && (
                        <span className="flex items-center gap-1 text-xs font-inter text-primary font-medium ml-1">
                          <Star className="w-3 h-3" />{evaluatedCount} avaliados
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {/* Participants list */}
              {isExpanded && (
                <div className="border-t border-border">
                  {eventParticipants.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm font-inter py-6">
                      Nenhum participante nesta comunidade.
                    </p>
                  ) : (
                    <div>
                      {eventParticipants.map((p, i) => {
                        const current = attendance[event.id]?.[p.user_id];
                        const isLast = i === eventParticipants.length - 1;
                        const isSavingThis = savingAtt === `${event.id}-${p.user_id}`;
                        const initials = p.full_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
                        const isSelected = isEncontro && selectedParticipant === p.user_id;
                        const ev = isEncontro ? (evalMap[p.user_id] ?? { participation_score: null, understanding_score: null, engagement_score: null, notes: "" }) : null;
                        const hasEval = isEncontro && !!ev?.participation_score;
                        const userPrep = isEncontro ? (prepReport[p.user_id] ?? []) : [];

                        return (
                          <div key={p.user_id} className={`${!isLast ? "border-b border-border" : ""}`}>
                            <div className={`flex items-center gap-3 px-4 py-3 ${isSavingThis ? "opacity-60" : ""}`}>
                              {/* Avatar */}
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  hasEval ? "bg-primary" : "bg-muted"
                                } ${isEncontro ? "cursor-pointer" : ""}`}
                                onClick={() => isEncontro && setSelectedParticipant(isSelected ? null : p.user_id)}
                              >
                                <span className={`text-xs font-montserrat font-black ${hasEval ? "text-primary-foreground" : "text-muted-foreground"}`}>
                                  {initials}
                                </span>
                              </div>

                              {/* Name + info */}
                              <div
                                className={`flex-1 min-w-0 ${isEncontro ? "cursor-pointer" : ""}`}
                                onClick={() => isEncontro && setSelectedParticipant(isSelected ? null : p.user_id)}
                              >
                                <p className="font-montserrat font-bold text-foreground text-sm truncate">{p.full_name}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground text-xs font-inter">{p.community}</span>
                                  {isEncontro && hasEval && (
                                    <Star className="w-3 h-3 text-primary fill-primary" />
                                  )}
                                  {isEncontro && (
                                    <span className="text-xs font-inter text-muted-foreground">
                                      {userPrep.length}/{activities.length}
                                      <BookOpen className="w-3 h-3 inline ml-0.5 -mt-0.5" />
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Attendance buttons */}
                              <div className="flex gap-1.5 flex-shrink-0">
                                {(["presente", "faltou", "justificou"] as AttendanceStatus[]).map(status => {
                                  const cfg = STATUS_CFG[status];
                                  const isActive = current === status;
                                  return (
                                    <button
                                      key={status}
                                      onClick={() => markAttendance(event.id, p.user_id, status)}
                                      disabled={isSavingThis}
                                      title={cfg.label}
                                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                                        isActive ? cfg.active : `border-border bg-card ${cfg.btn}`
                                      }`}
                                    >
                                      {cfg.icon}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Encontro: expanded evaluation + prep report */}
                            {isEncontro && isSelected && ev && (
                              <div className="px-4 pb-4 space-y-4 bg-muted/10">
                                {/* Preparation Report */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <p className="font-montserrat font-bold text-foreground text-sm">Relatório de Preparação</p>
                                  </div>
                                  <div className="bg-card rounded-xl border border-border p-3 space-y-1.5">
                                    <p className="text-xs font-inter text-muted-foreground mb-2">
                                      Atividades concluídas antes do encontro ({userPrep.length}/{activities.length}):
                                    </p>
                                    {activities.map(act => {
                                      const done = userPrep.includes(act.id);
                                      return (
                                        <div key={act.id} className="flex items-center gap-2">
                                          {done ? (
                                            <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />
                                          ) : (
                                            <XCircle className="w-4 h-4 text-destructive/50 flex-shrink-0" />
                                          )}
                                          <span className={`text-xs font-inter ${done ? "text-foreground" : "text-muted-foreground line-through"}`}>
                                            {act.title}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Evaluation form */}
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-primary" />
                                    <p className="font-montserrat font-bold text-foreground text-sm">Avaliação do Encontro</p>
                                  </div>
                                  <div className="grid grid-cols-1 gap-3">
                                    <ScoreSelector
                                      label="Participação"
                                      value={ev.participation_score}
                                      onChange={v => updateLocalEval(event.id, p.user_id, "participation_score", v)}
                                    />
                                    <ScoreSelector
                                      label="Compreensão"
                                      value={ev.understanding_score}
                                      onChange={v => updateLocalEval(event.id, p.user_id, "understanding_score", v)}
                                    />
                                    <ScoreSelector
                                      label="Engajamento"
                                      value={ev.engagement_score}
                                      onChange={v => updateLocalEval(event.id, p.user_id, "engagement_score", v)}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-inter font-medium text-muted-foreground">Observações</p>
                                    <Textarea
                                      value={ev.notes}
                                      onChange={e => updateLocalEval(event.id, p.user_id, "notes", e.target.value)}
                                      placeholder="Anotações sobre o participante neste encontro..."
                                      className="text-sm min-h-[60px]"
                                    />
                                  </div>
                                  <button
                                    onClick={() => saveEvaluation(event.id, p.user_id)}
                                    disabled={savingEval}
                                    className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-montserrat font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 w-full justify-center"
                                  >
                                    <Save className="w-4 h-4" />
                                    {savingEval ? "Salvando..." : "Salvar Avaliação"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}