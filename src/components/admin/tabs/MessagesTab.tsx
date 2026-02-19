import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Plus, Send, Users, MapPin, Globe } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Message = {
  id: string; title: string; body: string;
  area: string | null; community: string | null; created_at: string;
};

const AREA_1_COMMUNITIES = ["Rincão Frente", "Rincão Fundo", "Bom Pastor", "Iriá Pira 1"];
const AREA_2_COMMUNITIES = ["Martim Lutero", "Linha Brasil", "Iriá Pira 2"];

export default function MessagesTab() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", target: "area" as "all" | "area" | "community", community: "" });

  const communities = profile?.area === "Área 1" ? AREA_1_COMMUNITIES : AREA_2_COMMUNITIES;

  useEffect(() => { fetchMessages(); }, []);

  async function fetchMessages() {
    setLoading(true);
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  }

  async function handleSend() {
    if (!form.title || !form.body) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("messages").insert({
      title: form.title,
      body: form.body,
      area: form.target === "all" ? null : profile?.area ?? null,
      community: form.target === "community" ? form.community : null,
      sent_by: user?.id,
    });
    setForm({ title: "", body: "", target: "area", community: "" });
    setShowForm(false);
    setSaving(false);
    fetchMessages();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-montserrat font-bold text-foreground text-base">Comunicados</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-inter font-medium text-primary-foreground"
          style={{ background: "var(--gradient-hero)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Novo comunicado
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3 shadow-sm">
          <p className="font-montserrat font-bold text-foreground text-sm">Novo comunicado</p>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Título *"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            placeholder="Mensagem *" rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />

          {/* Target */}
          <div>
            <p className="font-inter text-xs text-muted-foreground mb-2">Enviar para:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "all" as const, label: "Todos", icon: Globe },
                { value: "area" as const, label: profile?.area ?? "Minha área", icon: MapPin },
                { value: "community" as const, label: "Comunidade", icon: Users },
              ].map(opt => (
                <button key={opt.value} onClick={() => setForm(f => ({ ...f, target: opt.value }))}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-inter transition-colors ${
                    form.target === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"
                  }`}>
                  <opt.icon className="w-4 h-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {form.target === "community" && (
            <select value={form.community} onChange={e => setForm(f => ({ ...f, community: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-inter text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
              <option value="">Selecione a comunidade</option>
              {communities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          <div className="flex gap-2">
            <button onClick={handleSend} disabled={saving || !form.title || !form.body || (form.target === "community" && !form.community)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-inter font-medium text-primary-foreground disabled:opacity-50 transition-opacity"
              style={{ background: "var(--gradient-hero)" }}>
              <Send className="w-4 h-4" /> {saving ? "Enviando..." : "Enviar"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl bg-muted text-foreground font-inter text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground font-inter text-sm">Carregando...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-montserrat font-bold text-foreground">Nenhum comunicado enviado</p>
          <p className="text-muted-foreground font-inter text-sm mt-1">Clique em "Novo comunicado" para enviar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className="bg-card rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-montserrat font-bold text-foreground text-sm">{msg.title}</h3>
                  <p className="text-muted-foreground font-inter text-xs mt-1 leading-relaxed">{msg.body}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-muted-foreground font-inter text-[10px]">
                      {format(new Date(msg.created_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                    </span>
                    {msg.community ? (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[10px] font-inter font-medium">{msg.community}</span>
                    ) : msg.area ? (
                      <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-md text-[10px] font-inter font-medium">{msg.area}</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-[10px] font-inter font-medium">Todos</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
