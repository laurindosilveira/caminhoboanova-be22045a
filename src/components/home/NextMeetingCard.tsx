import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NextMeetingCard({ onNavigateToAgenda }: { onNavigateToAgenda: () => void }) {
  const [event, setEvent] = useState<{ title: string; event_date: string; location: string | null } | null>(null);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("events")
        .select("title, event_date, location")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(1);
      if (data && data.length > 0) setEvent(data[0]);
    }
    fetch();
  }, []);

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
    <section className="px-5 mb-4" aria-labelledby="proximo-encontro-titulo">
      <button
        onClick={onNavigateToAgenda}
        aria-labelledby="proximo-encontro-titulo proximo-encontro-detalhes"
        className="w-full flex items-center gap-4 rounded-3xl border border-primary/10 bg-primary/5 p-4 hover:bg-primary/10 transition-all duration-300 group shadow-sm hover:shadow-md active:scale-[0.98] min-h-[72px]"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 group-hover:bg-primary/20">
          <CalendarDays className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 id="proximo-encontro-titulo" className="font-montserrat font-bold text-foreground text-sm truncate leading-tight">
            📅 Próximo encontro: {dayLabel} às {timeLabel}
          </h3>
          <p id="proximo-encontro-detalhes" className="text-muted-foreground text-[11px] font-medium font-inter truncate mt-0.5">
            {event.title}{event.location ? ` · ${event.location}` : ""} · {dateLabel}
          </p>
        </div>
        <span className="text-primary text-xs font-bold font-inter flex-shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden="true">Ver →</span>
      </button>
    </section>

  );
}
