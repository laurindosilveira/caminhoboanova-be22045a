import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarDays, ChevronDown, ChevronUp, Star, BookOpen,
  CheckCircle2, XCircle, Clock, Users, FileText, Save,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Event = {
  id: string; title: string; event_date: string; type: string;
  location: string | null; community: string | null; area: string | null;
};
type Participant = {
  user_id: string; full_name: string; community: string;
};
type Evaluation = {
  participation_score: number | null;
  understanding_score: number | null;
  engagement_score: number | null;
  notes: string;
};
type Activity = {
  id: string; title: string; type: string; order_num: number;
};

const TYPE_EMOJI: Record<string, string> = {
  encontro: "📅", culto: "⛪", retiro: "🏕️", evento: "🎉",
};
const SCORE_LABELS = ["", "Fraco", "Regular", "Bom", "Muito bom", "Excelente"];

export default function MeetingsTab({ participants, activities }: { participants: Participant[]; activities: Activity[] }) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  // Evaluations: eventId -> userId -> Evaluation
  const [evaluations, setEvaluations] = useState<Record<string, Record<string, Evaluation>>>({});
  // Attendance for the event
  const [attendance, setAttendance] = useState<Record<string, Record<string, string>>>({});
  // Preparation report: userId -> activity_ids completed before event date
  const [prepReport, setPrepReport] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("id, title, event_date, type, location, community, area")
      .eq("type", "encontro")
      .order("event_date", { ascending: false })
      .limit(30);
    setEvents(data ?? []);
    setLoading(false);
  }

  async function loadEventData(eventId: string, eventDate: string) {
    const eventParticipants = getParticipantsForEvent(events.find(e => e.id === eventId)!);
    const userIds = eventParticipants.map(p => p.user_id);
    if (userIds.length === 0) return;

    const [{ data: evalData }, { data: attData }, { data: progressData }] = await Promise.all([
      supabase.from("meeting_evaluations").select("*").eq("event_id", eventId),
      supabase.from("attendance").select("user_id, status").eq("event_id", eventId),
      supabase.from("user_progress").select("user_id, activity_id, completed_at").in("user_id", userIds),
    ]);

    // Map evaluations
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

    // Map attendance
    const attMap: Record<string, string> = {};
    (attData ?? []).forEach(a => { attMap[a.user_id] = a.status; });
    setAttendance(prev => ({ ...prev, [eventId]: attMap }));

    // Build prep report: activities completed BEFORE event date
    const eventDateObj = new Date(eventDate);
    const prepMap: Record<string, string[]> = {};
    (progressData ?? []).forEach(pr => {
      if (new Date(pr.completed_at) <= eventDateObj) {
        if (!prepMap[pr.user_id]) prepMap[pr.user_id] = [];
        prepMap[pr.user_id].push(pr.activity_id);
      }
    });
    setPrepReport(prepMap);
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
    if (event) await loadEventData(eventId, event.event_date);
  }

  function getParticipantsForEvent(event: Event) {
    return participants.filter(p => {
      if (event.community) return p.community === event.community;
      return true;
    });
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
    setSaving(true);
    const ev = evaluations[eventId]?.[userId];
    if (!ev) { setSaving(false); return; }

    const { error } = await supabase.from("meeting_evaluations").upsert({
      event_id: eventId,
      user_id: userId,
      admin_id: profile?.user_id ?? "",
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
    setSaving(false);
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
        <p className="font-montserrat font-bold text-foreground">Nenhum encontro encontrado</p>
        <p className="text-muted-foreground font-inter text-sm mt-1">Crie encontros do tipo "encontro" na aba Agenda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-montserrat font-black text-foreground text-lg">Encontros Presenciais</h2>
          <p className="text-muted-foreground text-xs font-inter">Avalie participantes e veja relatórios de preparação</p>
        </div>
      </div>

      <div className="space-y-3">
        {events.map(event => {
          const isExpanded = expandedEvent === event.id;
          const eventParticipants = getParticipantsForEvent(event);
          const dateObj = new Date(event.event_date);
          const attMap = attendance[event.id] ?? {};
          const evalMap = evaluations[event.id] ?? {};
          const evaluatedCount = Object.keys(evalMap).filter(uid => evalMap[uid]?.participation_score).length;

          return (
            <div key={event.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
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
                  <p className="font-montserrat font-bold text-foreground text-sm">{event.title}</p>
                  <p className="text-muted-foreground font-inter text-xs">
                    {format(dateObj, "d 'de' MMMM yyyy", { locale: ptBR })}
                    {event.community && ` · ${event.community}`}
                  </p>
                  {isExpanded && (
                    <div className="flex gap-2 mt-1 text-xs font-inter">
                      <span className="text-primary font-medium">{evaluatedCount}/{eventParticipants.length} avaliados</span>
                    </div>
                  )}
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  {eventParticipants.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-6">Nenhum participante.</p>
                  ) : (
                    <div>
                      {eventParticipants.map((p, i) => {
                        const isSelected = selectedParticipant === p.user_id;
                        const initials = p.full_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
                        const att = attMap[p.user_id];
                        const ev = evalMap[p.user_id] ?? { participation_score: null, understanding_score: null, engagement_score: null, notes: "" };
                        const hasEval = !!ev.participation_score;
                        const userPrep = prepReport[p.user_id] ?? [];

                        return (
                          <div key={p.user_id} className={`${i > 0 ? "border-t border-border" : ""}`}>
                            {/* Participant row */}
                            <button
                              onClick={() => setSelectedParticipant(isSelected ? null : p.user_id)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                hasEval ? "bg-primary" : "bg-muted"
                              }`}>
                                <span className={`text-xs font-montserrat font-black ${hasEval ? "text-primary-foreground" : "text-muted-foreground"}`}>
                                  {initials}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-montserrat font-bold text-foreground text-sm truncate">{p.full_name}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground text-xs font-inter">{p.community}</span>
                                  {att && (
                                    <span className={`text-xs font-inter font-medium ${
                                      att === "presente" ? "text-brand-green" : att === "faltou" ? "text-destructive" : "text-muted-foreground"
                                    }`}>
                                      · {att === "presente" ? "Presente" : att === "faltou" ? "Faltou" : "Justificou"}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {hasEval && <Star className="w-4 h-4 text-primary fill-primary" />}
                                <span className="text-xs font-inter text-muted-foreground">
                                  {userPrep.length}/{activities.length}
                                </span>
                                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                            </button>

                            {/* Expanded evaluation + report */}
                            {isSelected && (
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
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-montserrat font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 w-full justify-center"
                                  >
                                    <Save className="w-4 h-4" />
                                    {saving ? "Salvando..." : "Salvar Avaliação"}
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
