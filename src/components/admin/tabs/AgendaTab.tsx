import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Plus, X, MapPin, Users } from "lucide-react";
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

const EVENT_TYPES = [
  { value: "encontro", label: "Encontro", color: "bg-primary/10 text-primary" },
  { value: "culto", label: "Culto", color: "bg-brand-green/10 text-brand-green" },
  { value: "jemiac", label: "JEMIAC", color: "bg-secondary/10 text-secondary" },
  { value: "retiro", label: "Retiro", color: "bg-secondary/10 text-secondary" },
  { value: "evento", label: "Evento", color: "bg-accent/20 text-accent-foreground" },
];

const TYPE_EMOJI: Record<string, string> = {
  encontro: "📅", culto: "⛪", jemiac: "✝️", retiro: "🏕️", evento: "🎉",
};

export default function AgendaTab() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", event_date: "", location: "", type: "encontro", area: "", community: "",
  });

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase.from("events").select("*").order("event_date");
    setEvents(data ?? []);
    setLoading(false);
  }

  async function handleSave() {
    if (!form.title || !form.event_date) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("events").insert({
      title: form.title,
      description: form.description || null,
      event_date: form.event_date,
      location: form.location || null,
      type: form.type,
      area: form.area || null,
      community: form.community || null,
      created_by: user?.id,
    });
    setForm({ title: "", description: "", event_date: "", location: "", type: "encontro", area: "", community: "" });
    setShowForm(false);
    setSaving(false);
    fetchEvents();
  }

  async function handleDelete(id: string) {
    await supabase.from("events").delete().eq("id", id);
    fetchEvents();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-montserrat font-bold text-foreground text-base">Eventos e Encontros</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-inter font-medium text-primary-foreground"
          style={{ background: "var(--gradient-hero)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Novo evento
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3 shadow-sm">
          <p className="font-montserrat font-bold text-foreground text-sm">Novo evento</p>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Título do evento *"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Descrição (opcional)"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <div className="grid grid-cols-2 gap-2">
            <input type="datetime-local" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Local (opcional)"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !form.title || !form.event_date}
              className="flex-1 py-2.5 rounded-xl text-sm font-inter font-medium text-primary-foreground disabled:opacity-50 transition-opacity"
              style={{ background: "var(--gradient-hero)" }}>
              {saving ? "Salvando..." : "Salvar evento"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl bg-muted text-foreground font-inter text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground font-inter text-sm">Carregando...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-montserrat font-bold text-foreground">Nenhum evento cadastrado</p>
          <p className="text-muted-foreground font-inter text-sm mt-1">Clique em "Novo evento" para adicionar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => {
            const typeInfo = EVENT_TYPES.find(t => t.value === event.type);
            const dateObj = new Date(event.event_date);
            return (
              <div key={event.id} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-lg leading-none">{TYPE_EMOJI[event.type] ?? "📅"}</span>
                    <span className="font-montserrat font-black text-primary text-xs">{format(dateObj, "d", { locale: ptBR })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-montserrat font-bold text-foreground text-sm">{event.title}</h3>
                    <p className="text-muted-foreground font-inter text-xs mt-0.5">
                      {format(dateObj, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {typeInfo && <span className={`px-2 py-0.5 rounded-md text-[10px] font-inter font-medium ${typeInfo.color}`}>{typeInfo.label}</span>}
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
                    {event.description && <p className="text-muted-foreground font-inter text-xs mt-1.5">{event.description}</p>}
                  </div>
                  <button onClick={() => handleDelete(event.id)} className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <X className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
