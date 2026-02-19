import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Users, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

type Event = {
  id: string; title: string; event_date: string; type: string; location: string | null; community: string | null; area: string | null;
};

type Participant = {
  user_id: string; full_name: string; community: string;
};

type AttendanceStatus = "presente" | "faltou" | "justificou";

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

export default function AttendanceTab({ participants }: { participants: Participant[] }) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, Record<string, AttendanceStatus>>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("id, title, event_date, type, location, community, area")
      .order("event_date", { ascending: false })
      .limit(20);
    setEvents(data ?? []);
    setLoading(false);
  }

  async function loadAttendanceForEvent(eventId: string) {
    const { data } = await supabase
      .from("attendance")
      .select("user_id, status")
      .eq("event_id", eventId);
    const map: Record<string, AttendanceStatus> = {};
    (data ?? []).forEach(r => { map[r.user_id] = r.status as AttendanceStatus; });
    setAttendance(prev => ({ ...prev, [eventId]: map }));
  }

  async function toggleEvent(eventId: string) {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
      return;
    }
    setExpandedEvent(eventId);
    if (!attendance[eventId]) {
      await loadAttendanceForEvent(eventId);
    }
  }

  async function markAttendance(eventId: string, userId: string, status: AttendanceStatus) {
    setSaving(`${eventId}-${userId}`);
    const current = attendance[eventId]?.[userId];

    // Toggle off if same status
    if (current === status) {
      await supabase.from("attendance").delete()
        .eq("event_id", eventId).eq("user_id", userId);
      setAttendance(prev => {
        const updated = { ...prev[eventId] };
        delete updated[userId];
        return { ...prev, [eventId]: updated };
      });
    } else {
      await supabase.from("attendance").upsert({
        event_id: eventId,
        user_id: userId,
        status,
      }, { onConflict: "event_id,user_id" });
      setAttendance(prev => ({
        ...prev,
        [eventId]: { ...(prev[eventId] ?? {}), [userId]: status },
      }));
    }
    setSaving(null);
  }

  // Filter participants for this event's community/area
  function getParticipantsForEvent(event: Event) {
    return participants.filter(p => {
      if (event.community) return p.community === event.community;
      return true; // area-wide or global
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-montserrat font-black text-foreground text-lg">Controle de Presença</h2>
          <p className="text-muted-foreground text-xs font-inter">Marque presença por evento</p>
        </div>
      </div>

      <div className="space-y-3">
        {events.map(event => {
          const isExpanded = expandedEvent === event.id;
          const eventParticipants = getParticipantsForEvent(event);
          const summary = isExpanded ? getAttendanceSummary(event.id, eventParticipants) : null;
          const dateObj = new Date(event.event_date);

          return (
            <div key={event.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Event header — clickable */}
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
                        const isSaving = saving === `${event.id}-${p.user_id}`;
                        const initials = p.full_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

                        return (
                          <div
                            key={p.user_id}
                            className={`flex items-center gap-3 px-4 py-3 ${!isLast ? "border-b border-border" : ""} ${isSaving ? "opacity-60" : ""}`}
                          >
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-montserrat font-black text-primary-foreground">{initials}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-montserrat font-bold text-foreground text-sm truncate">{p.full_name}</p>
                              <p className="text-muted-foreground text-xs font-inter">{p.community}</p>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                              {(["presente", "faltou", "justificou"] as AttendanceStatus[]).map(status => {
                                const cfg = STATUS_CFG[status];
                                const isActive = current === status;
                                return (
                                  <button
                                    key={status}
                                    onClick={() => markAttendance(event.id, p.user_id, status)}
                                    disabled={isSaving}
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
