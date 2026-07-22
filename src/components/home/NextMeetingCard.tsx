import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Props = {
  churchId?: string | null;
  currentArea?: string;
  onNavigateToAgenda: () => void;
};

export default function NextMeetingCard({ churchId, currentArea, onNavigateToAgenda }: Props) {
  const [event, setEvent] = useState<{ title: string; event_date: string; location: string | null } | null>(null);

  useEffect(() => {
    async function fetch() {
      let query = supabase
        .from("events")
        .select("title, event_date, location")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(1);
      if (churchId) query = query.eq("church_id", churchId);
      if (currentArea) query = query.or(`area.is.null,area.eq.${currentArea}`);
      const { data } = await query;
      if (data && data.length > 0) setEvent(data[0]);
    }
    fetch();
  }, [churchId, currentArea]);

  if (!event) return null;

  const date = new Date(event.event_date);
  const dayLabel = isToday(date)
    ? "Hoje"
    : isTomorrow(date)
    ? "Amanhã"
    : format(date, "EEEE", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase());
  const timeLabel = format(date, "HH'h'mm", { locale: ptBR });
  const dateLabel = format(date, "dd/MM", { locale: ptBR });

  return (
    <div className="px-5 mb-3">
      <button
        onClick={onNavigateToAgenda}
        className="w-full flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 hover:bg-primary/10 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <CalendarDays className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-primary text-[10px] font-inter font-bold uppercase tracking-wide">
            Próximo evento
          </p>
          <p className="font-montserrat font-black text-foreground text-sm leading-tight truncate">
            {event.title}
          </p>
          <p className="text-muted-foreground text-xs font-inter truncate mt-0.5">
            {dayLabel} às {timeLabel} · {dateLabel}{event.location ? ` · ${event.location}` : ""}
          </p>
        </div>
        <span className="text-primary text-xs font-inter font-bold flex-shrink-0">Ver →</span>
      </button>
    </div>
  );
}
