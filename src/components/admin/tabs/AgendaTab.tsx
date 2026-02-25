import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarDays, Plus, X, MapPin, Users, BookOpen } from "lucide-react";
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

type LessonOption = {
  id: string;
  title: string;
  order_num: number;
  course_title: string;
  course_order: number;
};

const EVENT_TYPES = [
  { value: "encontro", label: "Encontro", color: "bg-primary/10 text-primary" },
  { value: "culto", label: "Culto", color: "bg-brand-green/10 text-brand-green" },
  { value: "jemiac", label: "JEMIAC", color: "bg-secondary/10 text-secondary" },
  { value: "retiro", label: "Retiro", color: "bg-secondary/10 text-secondary" },
  { value: "confirmatorio", label: "Ens. Confirmatório", color: "bg-primary/10 text-primary" },
  { value: "evento", label: "Evento", color: "bg-accent/20 text-accent-foreground" },
];

const TYPE_EMOJI: Record<string, string> = {
  encontro: "📅", culto: "⛪", jemiac: "✝️", retiro: "🏕️", confirmatorio: "📖", evento: "🎉",
};

export default function AgendaTab() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", event_date: "", location: "", type: "encontro", area: "", community: "", linked_lesson_id: "",
  });

  useEffect(() => { fetchEvents(); fetchLessons(); }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase.from("events").select("*").order("event_date");
    setEvents((data ?? []) as Event[]);
    setLoading(false);
  }

  async function fetchLessons() {
    const [{ data: coursesData }, { data: lessonsData }] = await Promise.all([
      supabase.from("courses").select("id, title, order_num").order("order_num"),
      supabase.from("lessons").select("id, title, order_num, course_id").order("order_num"),
    ]);
    const courses = coursesData ?? [];
    const lessonsList = lessonsData ?? [];
    const options: LessonOption[] = [];
    courses.forEach(c => {
      lessonsList.filter(l => l.course_id === c.id).forEach(l => {
        options.push({ id: l.id, title: l.title, order_num: l.order_num, course_title: c.title, course_order: c.order_num });
      });
    });
    setLessons(options);
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
      linked_lesson_id: form.linked_lesson_id || null,
    });
    setForm({ title: "", description: "", event_date: "", location: "", type: "encontro", area: "", community: "", linked_lesson_id: "" });
    setShowForm(false);
    setSaving(false);
    fetchEvents();
  }

  async function handleDelete(id: string) {
    await supabase.from("events").delete().eq("id", id);
    fetchEvents();
  }

  // Get lesson info for display
  const getLessonLabel = (lessonId: string | null) => {
    if (!lessonId) return null;
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return null;
    return `Curso ${lesson.course_order} — Lição ${lesson.order_num}: ${lesson.title}`;
  };

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
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, linked_lesson_id: "" }))}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          {/* Lesson selector for confirmatorio events */}
          {form.type === "confirmatorio" && (
            <div className="space-y-1">
              <label className="font-inter text-xs font-medium text-muted-foreground">📖 Vincular a um estudo (opcional)</label>
              <select
                value={form.linked_lesson_id}
                onChange={e => setForm(f => ({ ...f, linked_lesson_id: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              >
                <option value="">Sem vínculo</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>
                    Curso {l.course_order} — Lição {l.order_num}: {l.title}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            const lessonLabel = getLessonLabel(event.linked_lesson_id);
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
                    {lessonLabel && (
                      <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg bg-secondary/10">
                        <BookOpen className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                        <p className="font-inter text-[10px] text-secondary font-medium truncate">
                          📖 {lessonLabel}
                        </p>
                      </div>
                    )}
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
