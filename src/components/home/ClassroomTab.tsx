import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Send, MessageSquare, Heart, BookOpen, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
  community: string;
}

interface PrayerRequest {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  is_anonymous: boolean;
  amen_count: number;
  created_at: string;
}

interface CommunitySettings {
  whatsapp_link: string | null;
  verse_of_week: string | null;
  verse_reference: string | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 0) return `${d}d`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}min`;
  return "agora";
}

export default function ClassroomTab() {
  const { profile } = useAuth();

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Orações
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [prayerInput, setPrayerInput] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sendingPrayer, setSendingPrayer] = useState(false);
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [amenLoading, setAmenLoading] = useState<string | null>(null);

  // Settings
  const [settings, setSettings] = useState<CommunitySettings | null>(null);

  const community = profile?.community as string | undefined;
  const myUserId = profile?.user_id;
  const myName = profile?.full_name ?? "Anônimo";

  // ---- Fetch initial data ----
  useEffect(() => {
    if (!community) return;

    async function fetchAll() {
      const [chatRes, prayerRes, settingsRes] = await Promise.all([
        supabase
          .from("community_chat")
          .select("*")
          .eq("community", community!)
          .order("created_at", { ascending: true })
          .limit(50),
        supabase
          .from("prayer_requests")
          .select("*")
          .eq("community", community!)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("community_settings")
          .select("whatsapp_link, verse_of_week, verse_reference")
          .eq("community", community!)
          .maybeSingle(),
      ]);

      setChatMessages((chatRes.data ?? []) as ChatMessage[]);
      setPrayers((prayerRes.data ?? []) as PrayerRequest[]);
      setSettings(settingsRes.data as CommunitySettings | null);
    }

    fetchAll();
  }, [community]);

  // ---- Realtime: chat ----
  useEffect(() => {
    if (!community) return;

    const channel = supabase
      .channel(`community_chat:${community}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_chat",
          filter: `community=eq.${community}`,
        },
        (payload) => {
          setChatMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [community]);

  // ---- Realtime: prayers ----
  useEffect(() => {
    if (!community) return;

    const channel = supabase
      .channel(`prayer_requests:${community}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prayer_requests",
          filter: `community=eq.${community}`,
        },
        () => {
          // Re-fetch prayers on any change
          supabase
            .from("prayer_requests")
            .select("*")
            .eq("community", community!)
            .order("created_at", { ascending: false })
            .limit(20)
            .then(({ data }) => setPrayers((data ?? []) as PrayerRequest[]));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [community]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ---- Actions ----
  async function sendChat() {
    if (!chatInput.trim() || !community || !myUserId) return;
    setSendingChat(true);
    await supabase.from("community_chat").insert({
      community,
      user_id: myUserId,
      user_name: myName,
      message: chatInput.trim(),
    });
    setChatInput("");
    setSendingChat(false);
  }

  async function sendPrayer() {
    if (!prayerInput.trim() || !community || !myUserId) return;
    setSendingPrayer(true);
    await supabase.from("prayer_requests").insert({
      community,
      user_id: myUserId,
      user_name: myName,
      content: prayerInput.trim(),
      is_anonymous: isAnonymous,
    });
    setPrayerInput("");
    setIsAnonymous(false);
    setShowPrayerForm(false);
    setSendingPrayer(false);
  }

  async function handleAmen(prayer: PrayerRequest) {
    setAmenLoading(prayer.id);
    await supabase
      .from("prayer_requests")
      .update({ amen_count: prayer.amen_count + 1 })
      .eq("id", prayer.id);
    setPrayers((prev) =>
      prev.map((p) => p.id === prayer.id ? { ...p, amen_count: p.amen_count + 1 } : p)
    );
    setAmenLoading(null);
  }

  if (!community) return null;

  return (
    <div className="space-y-5">

      {/* ===== VERSÍCULO DA SEMANA ===== */}
      {settings?.verse_of_week && (
        <div
          className="mx-5 rounded-2xl p-4 border border-border shadow-sm"
          style={{ background: "var(--gradient-gold)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-foreground/70" />
            <span className="font-montserrat font-bold text-foreground/80 text-xs uppercase tracking-wide">
              Versículo da semana
            </span>
          </div>
          <p className="font-inter text-foreground text-sm leading-relaxed italic">
            "{settings.verse_of_week}"
          </p>
          {settings.verse_reference && (
            <p className="font-montserrat font-bold text-foreground/70 text-xs mt-2">
              — {settings.verse_reference}
            </p>
          )}
        </div>
      )}

      {/* ===== LINK DO WHATSAPP ===== */}
      {settings?.whatsapp_link && (
        <div className="mx-5">
          <a
            href={settings.whatsapp_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 shadow-sm hover:bg-muted/50 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(145 63% 45%), hsl(145 63% 35%))" }}
            >
              <span className="text-xl">💬</span>
            </div>
            <div className="flex-1">
              <p className="font-montserrat font-bold text-foreground text-sm">Grupo do WhatsApp</p>
              <p className="text-muted-foreground text-xs font-inter">Participe do grupo da turma</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </a>
        </div>
      )}

      {/* ===== MURAL DE ORAÇÕES ===== */}
      <div className="mx-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🙏</span>
            <span className="font-montserrat font-bold text-foreground text-sm">Mural de Orações</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 rounded-xl border-primary/40 text-primary"
            onClick={() => setShowPrayerForm(!showPrayerForm)}
          >
            {showPrayerForm ? "Cancelar" : "+ Pedido"}
          </Button>
        </div>

        {/* Form de pedido */}
        {showPrayerForm && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-3 space-y-3">
            <Textarea
              placeholder="Compartilhe seu pedido de oração com a turma..."
              value={prayerInput}
              onChange={(e) => setPrayerInput(e.target.value)}
              className="text-sm resize-none min-h-[80px] border-border"
              maxLength={300}
            />
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {isAnonymous ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {isAnonymous ? "Anônimo" : "Com meu nome"}
              </button>
              <Button
                size="sm"
                className="h-8 rounded-xl text-xs"
                onClick={sendPrayer}
                disabled={!prayerInput.trim() || sendingPrayer}
              >
                {sendingPrayer ? "Enviando..." : "Enviar 🙏"}
              </Button>
            </div>
          </div>
        )}

        {/* Lista de orações */}
        {prayers.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-5 text-center">
            <p className="text-3xl mb-2">🙏</p>
            <p className="text-muted-foreground text-sm font-inter">Nenhum pedido ainda. Seja o primeiro!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {prayers.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-montserrat font-bold text-muted-foreground mb-1">
                      {p.is_anonymous ? "Anônimo" : p.user_name}
                      <span className="font-normal ml-1">· {timeAgo(p.created_at)}</span>
                    </p>
                    <p className="text-sm font-inter text-card-foreground leading-relaxed">{p.content}</p>
                  </div>
                  <button
                    onClick={() => handleAmen(p)}
                    disabled={amenLoading === p.id}
                    className="flex flex-col items-center gap-0.5 flex-shrink-0 ml-2 group"
                  >
                    <Heart className="w-5 h-5 text-primary group-hover:fill-primary transition-all" />
                    <span className="text-xs font-montserrat font-bold text-primary">
                      {p.amen_count > 0 ? p.amen_count : "Amém"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== CHAT DA TURMA ===== */}
      <div className="mx-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="font-montserrat font-bold text-foreground text-sm">Chat da Turma</span>
          <span className="text-xs text-muted-foreground font-inter ml-auto">tempo real</span>
        </div>

        {/* Messages */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-2xl mb-1">💬</p>
                  <p className="text-muted-foreground text-sm font-inter">Nenhuma mensagem ainda. Diga olá!</p>
                </div>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isMe = msg.user_id === myUserId;
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-montserrat font-black text-primary-foreground">
                          {msg.user_name[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                      {!isMe && (
                        <span className="text-xs text-muted-foreground font-montserrat font-bold mb-0.5 px-1">
                          {msg.user_name.split(" ")[0]}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm font-inter leading-relaxed ${
                          isMe
                            ? "text-primary-foreground rounded-tr-sm"
                            : "bg-muted text-foreground rounded-tl-sm"
                        }`}
                        style={isMe ? { background: "var(--gradient-hero)" } : undefined}
                      >
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                        {timeAgo(msg.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <Input
              placeholder="Mensagem para a turma..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChat()}
              className="flex-1 h-9 text-sm border-border rounded-xl"
              maxLength={500}
            />
            <button
              onClick={sendChat}
              disabled={!chatInput.trim() || sendingChat}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
