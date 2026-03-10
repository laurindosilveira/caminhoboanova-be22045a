import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, MapPin, Users, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import WorshipConfirmation from "./WorshipConfirmation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Event = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  area: string | null;
  community: string | null;
  type: string;
  linked_lesson_id: string | null;
};

type LessonContentInfo = { lesson_id: string; summary: string; bible_texts: string[]; prayer_prompt: string };
type AttendanceRecord = { event_id: string; status: string };
type LessonInfo = { id: string; title: string; order_num: number; course_title: string; course_order: number };

const EVENT_TYPES: Record<string, { label: string; color: string; emoji: string }> = {
  encontro:      { label: "Encontro",          color: "bg-primary/10 text-primary",              emoji: "📅" },
  culto:         { label: "Culto",             color: "bg-brand-green/10 text-brand-green",      emoji: "⛪" },
  jemiac:        { label: "JEMIAC",            color: "bg-secondary/10 text-secondary",          emoji: "✝️" },
  retiro:        { label: "Retiro",            color: "bg-secondary/10 text-secondary",          emoji: "🏕️" },
  confirmatorio: { label: "Ens. Confirmatório", color: "bg-primary/10 text-primary",             emoji: "📖" },
  evento:        { label: "Evento",            color: "bg-accent/20 text-accent-foreground",     emoji: "🎉" },
};

export default function UserAgendaTab() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [lessonInfoMap, setLessonInfoMap] = useState<Map<string, LessonInfo>>(new Map());
  const [lessonContentMap, setLessonContentMap] = useState<Map<string, LessonContentInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("agenda");

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: eventsData }, attResult, { data: coursesData }, { data: lessonsData }, { data: lessonContentData }] = await Promise.all([
        supabase.from("events").select("*").order("event_date"),
        user
          ? supabase.from("attendance").select("event_id, status").eq("user_id", user.id)
          : Promise.resolve({ data: [] }),
        supabase.from("courses").select("id, title, order_num").order("order_num"),
        supabase.from("lessons").select("id, title, order_num, course_id").order("order_num"),
        supabase.from("lesson_content").select("lesson_id, summary, bible_texts, prayer_prompt"),
      ]);
      const { data: attendanceData } = attResult;
      const all = (eventsData ?? []) as Event[];
      const filtered = all.filter(e =>
        !e.area ||
        e.area === profile?.area ||
        e.community === profile?.community
      );
      setEvents(filtered);
      setAttendanceRecords((attendanceData ?? []) as AttendanceRecord[]);

      // Build lesson info map keyed by lesson id
      const courses = coursesData ?? [];
      const lessons = lessonsData ?? [];
      const infoMap = new Map<string, LessonInfo>();
      courses.forEach(c => {
        lessons.filter(l => l.course_id === c.id).forEach(l => {
          infoMap.set(l.id, { id: l.id, title: l.title, order_num: l.order_num, course_title: c.title, course_order: c.order_num });
        });
      });
      setLessonInfoMap(infoMap);

      // Build lesson content map
      const contentMap = new Map<string, LessonContentInfo>();
      (lessonContentData ?? []).forEach((lc: any) => {
        contentMap.set(lc.lesson_id, lc);
      });
      setLessonContentMap(contentMap);
      setLoading(false);
    }
    if (profile) fetch();
  }, [profile]);

  // Realtime: re-fetch when events change
  useEffect(() => {
    const channel = supabase
      .channel('user-agenda-events-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          // Re-run fetch without showing loading spinner
          async function refetch() {
            const { data: { user } } = await supabase.auth.getUser();
            const [{ data: eventsData }] = await Promise.all([
              supabase.from("events").select("*").order("event_date"),
            ]);
            const all = (eventsData ?? []) as Event[];
            const filtered = all.filter(e =>
              !e.area ||
              e.area === profile?.area ||
              e.community === profile?.community
            );
            setEvents(filtered);
          }
          if (profile) refetch();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.event_date) >= now);
  const past = events.filter(e => new Date(e.event_date) < now);

  async function handleCheckIn(eventId: string, status: "presente" | "faltou", justification?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload: any = { status };
    if (justification) payload.justification = justification;
    const existing = attendanceRecords.find(a => a.event_id === eventId);
    if (existing) {
      await supabase.from("attendance").update(payload).eq("event_id", eventId).eq("user_id", user.id);
    } else {
      await supabase.from("attendance").insert({ event_id: eventId, user_id: user.id, ...payload });
    }
    setAttendanceRecords(prev => {
      const filtered = prev.filter(a => a.event_id !== eventId);
      return [...filtered, { event_id: eventId, status }];
    });
  }

  // Attendance history: past events only
  const pastEvents = events
    .filter(e => new Date(e.event_date) < now)
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  return (
    <div className="px-5 pt-5 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-montserrat font-black text-foreground text-xl">📅 Agenda</h2>
        {profile?.community && (
          <span className="text-xs font-inter text-muted-foreground bg-muted rounded-full px-3 py-1">
            {profile.community}
          </span>
        )}
      </div>

      {/* ── CONFIRMAÇÃO DE PRESENÇA EM EVENTOS ──── */}
      <WorshipConfirmation />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-muted rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : upcoming.length === 0 && past.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm">
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-montserrat font-bold text-foreground text-base mb-1">Nenhum evento cadastrado</p>
          <p className="text-muted-foreground text-sm font-inter">Os próximos encontros e eventos aparecerão aqui.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <p className="font-montserrat font-bold text-foreground text-sm">📌 Próximos eventos</p>
              {upcoming.map(event => {
                const linkedLesson = event.linked_lesson_id ? lessonInfoMap.get(event.linked_lesson_id) : undefined;
                const lessonContent = linkedLesson ? lessonContentMap.get(linkedLesson.id) : undefined;
                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    linkedLesson={linkedLesson}
                    lessonContent={lessonContent}
                    attendanceRecords={attendanceRecords}
                    onCheckIn={handleCheckIn}
                    onNavigateToLesson={setActiveTab}
                  />
                );
              })}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-3">
              <p className="font-montserrat font-bold text-muted-foreground text-sm">Eventos anteriores</p>
              {past.slice(0, 3).map(event => {
                const linkedLesson = event.linked_lesson_id ? lessonInfoMap.get(event.linked_lesson_id) : undefined;
                return (
                  <EventCard key={event.id} event={event} past linkedLesson={linkedLesson} attendanceRecords={attendanceRecords} onCheckIn={handleCheckIn} />
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── HISTÓRICO DE PRESENÇA ────────────────── */}
      {pastEvents.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-2.5 border-b border-border bg-muted/30">
            <CalendarDays className="w-4 h-4 text-secondary" />
            <p className="font-montserrat font-bold text-foreground text-sm">Histórico de Presença</p>
          </div>
          <div className="p-4 space-y-2">
            {pastEvents.slice(0, 8).map((evt) => {
              const record = attendanceRecords.find(a => a.event_id === evt.id);
              const status = record?.status;
              const statusCfg = {
                presente: { icon: "🟢", label: "Presente", cls: "text-brand-green bg-brand-green/10" },
                faltou: { icon: "🔴", label: "Faltou", cls: "text-destructive bg-destructive/10" },
                justificou: { icon: "🟡", label: "Justificou", cls: "text-accent-foreground bg-accent/20" },
              }[status ?? ""] ?? { icon: "⚪", label: "Sem registro", cls: "text-muted-foreground bg-muted" };

              const date = new Date(evt.event_date);
              const dateStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

              return (
                <div key={evt.id} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-muted/30">
                  <span className="text-base">{statusCfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm text-foreground truncate">{evt.title}</p>
                    <p className="font-inter text-[10px] text-muted-foreground">{dateStr}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-inter font-semibold ${statusCfg.cls}`}>
                    {statusCfg.label}
                  </span>
                </div>
              );
            })}

            {(() => {
              const total = pastEvents.filter(e => attendanceRecords.some(a => a.event_id === e.id)).length;
              const present = attendanceRecords.filter(a => a.status === "presente").length;
              const rate = total > 0 ? Math.round((present / total) * 100) : 0;
              return total > 0 ? (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="font-inter text-xs text-muted-foreground">Taxa de presença</span>
                  <span className={`font-montserrat font-bold text-sm ${rate >= 70 ? "text-brand-green" : rate >= 40 ? "text-accent-foreground" : "text-destructive"}`}>
                    {rate}%
                  </span>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, past = false, linkedLesson, lessonContent, attendanceRecords = [], onCheckIn, onNavigateToLesson }: { 
  event: Event; past?: boolean; linkedLesson?: LessonInfo; lessonContent?: LessonContentInfo;
  attendanceRecords?: AttendanceRecord[]; onCheckIn?: (eventId: string, status: "presente" | "faltou", justification?: string) => void;
  onNavigateToLesson?: (tab: string) => void;
}) {
  const [showJustification, setShowJustification] = useState(false);
  const [justificationText, setJustificationText] = useState("");
  const [showPrep, setShowPrep] = useState(false);
  const typeInfo = EVENT_TYPES[event.type] ?? EVENT_TYPES.evento;
  const dateObj = new Date(event.event_date);
  
  // Check-in: show for today's events or events in the last 24h
  const now = new Date();
  const diffHours = (now.getTime() - dateObj.getTime()) / 3600000;
  const isCheckInWindow = diffHours >= -2 && diffHours <= 24;
  const existingRecord = attendanceRecords.find(a => a.event_id === event.id);

  const handleLessonClick = () => {
    // Navigate to the Jornada tab where the user can access the lesson
    if (onNavigateToLesson) {
      // Dispatch a custom event so the parent (Index page) can switch tabs
      window.dispatchEvent(new CustomEvent("navigate-to-lesson", { detail: { lessonId: linkedLesson?.id } }));
    }
  };

  return (
    <div className={`bg-card rounded-2xl border border-border p-4 shadow-sm ${past ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-lg leading-none">{typeInfo.emoji}</span>
          <span className="font-montserrat font-black text-primary text-xs leading-none mt-0.5">
            {format(dateObj, "d", { locale: ptBR })}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-montserrat font-bold text-foreground text-sm">{event.title}</h3>
          <p className="text-muted-foreground font-inter text-xs mt-0.5">
            {format(dateObj, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-inter font-medium ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            {event.location && (
              <span className="flex items-center gap-1 text-muted-foreground text-[10px] font-inter">
                <MapPin className="w-3 h-3" />{event.location}
              </span>
            )}
            {event.area && (
              <span className="flex items-center gap-1 text-muted-foreground text-[10px] font-inter">
                <Users className="w-3 h-3" />{event.area}
              </span>
            )}
          </div>
          {linkedLesson && (
            <button
              onClick={handleLessonClick}
              className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors w-full text-left"
            >
              <BookOpen className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
              <p className="font-inter text-[10px] text-secondary font-medium truncate">
                📖 Ligado ao Curso {linkedLesson.course_order} — Lição {linkedLesson.order_num}: {linkedLesson.title}
              </p>
            </button>
          )}
          {/* Preparation section for upcoming events with linked lesson */}
          {!past && linkedLesson && lessonContent && (lessonContent.summary || lessonContent.prayer_prompt || (lessonContent.bible_texts && lessonContent.bible_texts.length > 0)) && (
            <div className="mt-2">
              <button
                onClick={() => setShowPrep(p => !p)}
                className="flex items-center gap-1.5 text-primary font-inter text-[11px] font-semibold hover:underline"
              >
                {showPrep ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                📖 Preparação para o encontro
              </button>
              {showPrep && (
                <div className="mt-2 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200 p-3 rounded-xl bg-muted/40 border border-border">
                  {lessonContent.bible_texts && lessonContent.bible_texts.length > 0 && lessonContent.bible_texts[0] !== "" && (
                    <div>
                      <p className="font-inter text-[10px] font-bold text-foreground mb-1">📖 Conteúdo a estudar</p>
                      {lessonContent.bible_texts.map((t, i) => (
                        <p key={i} className="font-inter text-[11px] text-muted-foreground leading-relaxed">• {t}</p>
                      ))}
                    </div>
                  )}
                  {lessonContent.summary && (
                    <div>
                      <p className="font-inter text-[10px] font-bold text-foreground mb-1">📝 Resumo</p>
                      <p className="font-inter text-[11px] text-muted-foreground leading-relaxed">{lessonContent.summary}</p>
                    </div>
                  )}
                  {lessonContent.prayer_prompt && (
                    <div>
                      <p className="font-inter text-[10px] font-bold text-foreground mb-1">🙏 Preparação espiritual</p>
                      <p className="font-inter text-[11px] text-muted-foreground leading-relaxed">{lessonContent.prayer_prompt}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {event.description && (
            <p className="text-muted-foreground font-inter text-xs mt-1.5 leading-relaxed">{event.description}</p>
          )}

          {/* Check-in buttons */}
          {isCheckInWindow && onCheckIn && (
            <div className="mt-2.5">
              {existingRecord ? (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                  existingRecord.status === "presente" ? "bg-brand-green/10" : "bg-destructive/10"
                }`}>
                  <span className="text-sm">{existingRecord.status === "presente" ? "📍" : "❌"}</span>
                  <p className={`font-inter text-xs font-semibold ${
                    existingRecord.status === "presente" ? "text-brand-green" : "text-destructive"
                  }`}>
                    {existingRecord.status === "presente" ? "Check-in realizado ✓" : "Ausência registrada"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onCheckIn(event.id, "presente")}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-green/10 text-brand-green hover:bg-brand-green/20 transition-colors"
                    >
                      <span className="text-sm">📍</span>
                      <span className="font-inter text-xs font-semibold">Cheguei</span>
                    </button>
                    <button
                      onClick={() => setShowJustification(prev => !prev)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition-colors ${showJustification ? "bg-destructive/20 text-destructive" : "bg-destructive/10 text-destructive hover:bg-destructive/20"}`}
                    >
                      <span className="text-sm">❌</span>
                      <span className="font-inter text-xs font-semibold">Não compareci</span>
                    </button>
                  </div>
                  {showJustification && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <textarea
                        value={justificationText}
                        onChange={e => setJustificationText(e.target.value)}
                        placeholder="Não poderei participar por…"
                        className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-inter text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        rows={2}
                        maxLength={300}
                      />
                      <button
                        onClick={() => {
                          onCheckIn(event.id, "faltou", justificationText || undefined);
                          setShowJustification(false);
                        }}
                        className="w-full py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors font-inter text-xs font-semibold"
                      >
                        Confirmar ausência
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
