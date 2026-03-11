import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Trash2 } from "lucide-react";

const REACTION_EMOJIS = [
  { emoji: "🙏", label: "orando" },
  { emoji: "❤️", label: "amém" },
  { emoji: "🔥", label: "forte" },
  { emoji: "🙌", label: "glória" },
];

interface Message {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

type ReactionMap = Record<string, Record<string, { count: number; hasReacted: boolean }>>;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 0) return `${d}d atrás`;
  if (h > 0) return `${h}h atrás`;
  return `${m}min atrás`;
}

export default function AnnouncementsSection() {
  const { profile, role } = useAuth();
  const canDelete = role === "admin" || role === "lider";
  const [messages, setMessages] = useState<Message[]>([]);
  const [reactions, setReactions] = useState<ReactionMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function fetchMessages() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data }, { data: reactionsData }] = await Promise.all([
        supabase
          .from("messages")
          .select("id, title, body, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("message_reactions").select("message_id, emoji, user_id"),
      ]);
      setMessages(data ?? []);
      const rMap: ReactionMap = {};
      (reactionsData ?? []).forEach((r: any) => {
        if (!rMap[r.message_id]) rMap[r.message_id] = {};
        if (!rMap[r.message_id][r.emoji]) rMap[r.message_id][r.emoji] = { count: 0, hasReacted: false };
        rMap[r.message_id][r.emoji].count++;
        if (user && r.user_id === user.id) rMap[r.message_id][r.emoji].hasReacted = true;
      });
      setReactions(rMap);
      setLoading(false);
    }
    fetchMessages();
  }, [profile]);

  async function toggleReaction(messageId: string, emoji: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const current = reactions[messageId]?.[emoji];
    if (current?.hasReacted) {
      await supabase.from("message_reactions").delete().eq("message_id", messageId).eq("user_id", user.id).eq("emoji", emoji);
      setReactions(prev => {
        const copy = { ...prev };
        if (copy[messageId]?.[emoji]) {
          copy[messageId] = { ...copy[messageId] };
          copy[messageId][emoji] = { count: copy[messageId][emoji].count - 1, hasReacted: false };
          if (copy[messageId][emoji].count <= 0) delete copy[messageId][emoji];
        }
        return copy;
      });
    } else {
      await supabase.from("message_reactions").insert({ message_id: messageId, user_id: user.id, emoji });
      setReactions(prev => {
        const copy = { ...prev };
        if (!copy[messageId]) copy[messageId] = {};
        copy[messageId] = { ...copy[messageId] };
        const old = copy[messageId][emoji] ?? { count: 0, hasReacted: false };
        copy[messageId][emoji] = { count: old.count + 1, hasReacted: true };
        return copy;
      });
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Deseja excluir este aviso?")) return;
    await supabase.from("messages").delete().eq("id", id);
    setMessages(prev => prev.filter(m => m.id !== id));
  }

  if (loading) {
    return (
      <div className="px-5 space-y-2">
        {[1, 2].map(i => <div key={i} className="bg-muted rounded-2xl h-20 animate-pulse" />)}
      </div>
    );
  }

  if (messages.length === 0) return null;

  return (
    <div className="px-5">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="font-montserrat font-bold text-foreground text-sm">Avisos</span>
      </div>
      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✝️</span>
                <div>
                  <p className="font-montserrat font-bold text-card-foreground text-sm">{msg.title}</p>
                  <p className="text-muted-foreground text-xs font-inter">{timeAgo(msg.created_at)}</p>
                </div>
              </div>
              {canDelete && (
                <button onClick={() => deleteMessage(msg.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-card-foreground text-sm font-inter leading-relaxed">{msg.body}</p>
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {REACTION_EMOJIS.map(({ emoji, label }) => {
                const r = reactions[msg.id]?.[emoji];
                const active = r?.hasReacted;
                const count = r?.count ?? 0;
                return (
                  <button
                    key={emoji}
                    onClick={() => toggleReaction(msg.id, emoji)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-inter transition-all ${
                      active
                        ? "bg-primary/15 text-primary border border-primary/30 font-semibold"
                        : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted"
                    }`}
                    title={label}
                  >
                    <span className="text-sm">{emoji}</span>
                    {count > 0 && <span>{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
