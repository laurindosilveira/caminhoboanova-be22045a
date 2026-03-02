import { useState } from "react";
import { Send, Users, MapPin, Building, Megaphone, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AREAS = ["Área 1", "Área 2"];
const COMMUNITIES = [
  "Martim Lutero", "Bom Pastor", "Rincão Fundo", "Rincão Frente",
  "Linha Brasil", "Iriá Pira 1", "Iriá Pira 2",
];

type TargetType = "all" | "area" | "community" | "turma";

interface Props {
  turmas?: Array<{ id: string; name: string; area: string | null }>;
}

export default function AdminPushTab({ turmas = [] }: Props) {
  const { isSuper, profile } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<TargetType>("all");
  const [targetValue, setTargetValue] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState("");

  const canSendToAll = isSuper;

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      setError("Preencha o título e a mensagem.");
      return;
    }
    if (target !== "all" && !targetValue) {
      setError("Selecione o destino.");
      return;
    }

    setSending(true);
    setError("");
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-push", {
        body: { title, body, target, targetValue: target === "all" ? undefined : targetValue },
      });

      if (fnError) throw fnError;
      setResult({ sent: data.sent, failed: data.failed });
      if (data.sent > 0) {
        setTitle("");
        setBody("");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao enviar notificações.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
          <Megaphone className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-montserrat font-bold text-foreground text-base">Enviar Push</h2>
          <p className="text-muted-foreground font-inter text-xs">Envie avisos instantâneos aos participantes</p>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-inter font-bold text-foreground mb-1.5">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Encontro cancelado amanhã"
          maxLength={80}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm font-inter text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="text-muted-foreground text-[10px] font-inter mt-1 text-right">{title.length}/80</p>
      </div>

      {/* Body */}
      <div>
        <label className="block text-xs font-inter font-bold text-foreground mb-1.5">Mensagem</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva a mensagem que será enviada..."
          maxLength={200}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm font-inter text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <p className="text-muted-foreground text-[10px] font-inter mt-1 text-right">{body.length}/200</p>
      </div>

      {/* Target selector */}
      <div>
        <label className="block text-xs font-inter font-bold text-foreground mb-1.5">Enviar para</label>
        <div className="grid grid-cols-2 gap-2">
          {canSendToAll && (
            <button
              onClick={() => { setTarget("all"); setTargetValue(""); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-inter font-bold transition-colors ${
                target === "all" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              <Users className="w-4 h-4" />
              Todos
            </button>
          )}
          <button
            onClick={() => { setTarget("area"); setTargetValue(""); }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-inter font-bold transition-colors ${
              target === "area" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Por Área
          </button>
          <button
            onClick={() => { setTarget("community"); setTargetValue(""); }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-inter font-bold transition-colors ${
              target === "community" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"
            }`}
          >
            <Building className="w-4 h-4" />
            Comunidade
          </button>
          {turmas.length > 0 && (
            <button
              onClick={() => { setTarget("turma"); setTargetValue(""); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-inter font-bold transition-colors ${
                target === "turma" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              <Users className="w-4 h-4" />
              Turma
            </button>
          )}
        </div>
      </div>

      {/* Target value selector */}
      {target === "area" && (
        <select
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm font-inter text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Selecione a área...</option>
          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      )}

      {target === "community" && (
        <select
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm font-inter text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Selecione a comunidade...</option>
          {COMMUNITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )}

      {target === "turma" && (
        <select
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm font-inter text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Selecione a turma...</option>
          {turmas.map(t => <option key={t.id} value={t.id}>{t.name}{t.area ? ` (${t.area})` : ""}</option>)}
        </select>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-destructive text-xs font-inter">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-green/10 border border-brand-green/20">
          <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" />
          <p className="text-brand-green text-xs font-inter font-bold">
            {result.sent > 0
              ? `✅ Enviado para ${result.sent} dispositivo${result.sent !== 1 ? "s" : ""}${result.failed > 0 ? ` (${result.failed} falha${result.failed !== 1 ? "s" : ""})` : ""}`
              : "Nenhum dispositivo encontrado com push ativo para esse destino."}
          </p>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={sending || !title.trim() || !body.trim()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-inter font-bold text-sm text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "var(--gradient-hero)" }}
      >
        {sending ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Enviar Notificação Push
          </>
        )}
      </button>

      <p className="text-muted-foreground text-[10px] font-inter text-center">
        Apenas usuários com notificações de mensagens ativas receberão o aviso.
      </p>
    </div>
  );
}
