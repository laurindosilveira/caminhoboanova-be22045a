import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, MapPin, Users } from "lucide-react";
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
};

const EVENT_TYPES: Record<string, { label: string; color: string; emoji: string }> = {
  encontro: { label: "Encontro", color: "bg-primary/10 text-primary", emoji: "📅" },
  culto:    { label: "Culto",    color: "bg-brand-green/10 text-brand-green", emoji: "⛪" },
  retiro:   { label: "Retiro",   color: "bg-secondary/10 text-secondary", emoji: "🏕️" },
  evento:   { label: "Evento",   color: "bg-accent/20 text-accent-foreground", emoji: "🎉" },
};

export default function UserAgendaTab() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("event_date");
      // Filter to show events for user's area/community or general events
      const all = (data ?? []) as Event[];
      const filtered = all.filter(e =>
        !e.area ||
        e.area === profile?.area ||
        e.community === profile?.community
      );
      setEvents(filtered);
      setLoading(false);
    }
    if (profile) fetch();
  }, [profile]);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.event_date) >= now);
  const past = events.filter(e => new Date(e.event_date) < now);

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
              {upcoming.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-3">
              <p className="font-montserrat font-bold text-muted-foreground text-sm">Eventos anteriores</p>
              {past.slice(0, 3).map(event => (
                <EventCard key={event.id} event={event} past />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ event, past = false }: { event: Event; past?: boolean }) {
  const typeInfo = EVENT_TYPES[event.type] ?? EVENT_TYPES.evento;
  const dateObj = new Date(event.event_date);

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
          {event.description && (
            <p className="text-muted-foreground font-inter text-xs mt-1.5 leading-relaxed">{event.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
