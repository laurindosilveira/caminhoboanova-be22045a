import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, GraduationCap, Cake } from "lucide-react";
import ClassroomTab from "./ClassroomTab";

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
// { messageId: { emoji: { count, hasReacted } } }

interface BirthdayPerson {
  full_name: string;
  birth_date: string;
  day: number;
}

type SubTab = "comunidade" | "sala";

export default function CommunityTab() {
  const { profile } = useAuth();
  const [subTab, setSubTab] = useState<SubTab>("comunidade");
  const [messages, setMessages] = useState<Message[]>([]);
  const [reactions, setReactions] = useState<ReactionMap>({});
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [birthdays, setBirthdays] = useState<BirthdayPerson[]>([]);

  useEffect(() => {
    if (!profile) return;

    async function fetchMessages() {
      setLoadingMessages(true);
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
      // Build reactions map
      const rMap: ReactionMap = {};
      (reactionsData ?? []).forEach((r: any) => {
        if (!rMap[r.message_id]) rMap[r.message_id] = {};
        if (!rMap[r.message_id][r.emoji]) rMap[r.message_id][r.emoji] = { count: 0, hasReacted: false };
        rMap[r.message_id][r.emoji].count++;
        if (user && r.user_id === user.id) rMap[r.message_id][r.emoji].hasReacted = true;
      });
      setReactions(rMap);
      setLoadingMessages(false);
    }


    async function fetchBirthdays() {
      const currentMonth = new Date().getMonth() + 1;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, birth_date")
        .eq("community", profile.community as any);
      const bdays: BirthdayPerson[] = (data ?? [])
        .filter(p => {
          const month = new Date(p.birth_date + "T00:00:00").getMonth() + 1;
          return month === currentMonth;
        })
        .map(p => ({
          full_name: p.full_name,
          birth_date: p.birth_date,
          day: new Date(p.birth_date + "T00:00:00").getDate(),
        }))
        .sort((a, b) => a.day - b.day);
      setBirthdays(bdays);
    }

    fetchMessages();
    fetchBirthdays();
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

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor(diff / 60000);
    if (d > 0) return `${d}d atrás`;
    if (h > 0) return `${h}h atrás`;
    return `${m}min atrás`;
  }

  return (
    <div className="pt-5 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between px-5">
        <h2 className="font-montserrat font-black text-foreground text-xl">👥 Comunidade</h2>
        {profile?.community && (
          <span className="text-xs font-inter text-muted-foreground bg-muted rounded-full px-3 py-1">
            {profile.community}
          </span>
        )}
      </div>

      {/* Sub-nav tabs */}
      <div className="px-5">
        <div className="flex bg-muted rounded-2xl p-1 gap-1">
          <button
            onClick={() => setSubTab("comunidade")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-montserrat font-bold transition-all ${
              subTab === "comunidade"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Comunidade
          </button>
          <button
            onClick={() => setSubTab("sala")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-montserrat font-bold transition-all ${
              subTab === "sala"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Sala da Turma
          </button>
        </div>
      </div>

      {/* ===== SALA DA TURMA ===== */}
      {subTab === "sala" && <ClassroomTab />}

      {/* ===== COMUNIDADE ===== */}
      {subTab === "comunidade" && (
        <div className="px-5 space-y-5">
          {/* Pastor messages */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="font-montserrat font-bold text-foreground text-sm">Avisos</span>
            </div>

            {loadingMessages ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="bg-muted rounded-2xl h-20 animate-pulse" />)}
              </div>
            ) : messages.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-4 text-center">
                <p className="text-muted-foreground text-sm font-inter">Nenhuma mensagem ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">✝️</span>
                      <div>
                        <p className="font-montserrat font-bold text-card-foreground text-sm">{msg.title}</p>
                        <p className="text-muted-foreground text-xs font-inter">{timeAgo(msg.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-card-foreground text-sm font-inter leading-relaxed">{msg.body}</p>
                    {/* Reactions */}
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
            )}
          </div>

          {/* Aniversariantes do mês */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cake className="w-4 h-4 text-secondary" />
              <span className="font-montserrat font-bold text-foreground text-sm">
                🎂 Aniversariantes de {new Date().toLocaleString("pt-BR", { month: "long" })}
              </span>
            </div>
            {birthdays.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-4 text-center">
                <p className="text-muted-foreground text-sm font-inter">Nenhum aniversariante este mês.</p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                {birthdays.map((b, i) => {
                  const isToday = b.day === new Date().getDate();
                  return (
                    <div
                      key={b.full_name + b.birth_date}
                      className={`flex items-center gap-3 px-4 py-3 ${i < birthdays.length - 1 ? "border-b border-border" : ""} ${isToday ? "bg-secondary/5" : ""}`}
                    >
                      <span className="text-lg">{isToday ? "🎉" : "🎂"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-montserrat font-bold text-card-foreground text-sm truncate">
                          {b.full_name}
                          {isToday && <span className="text-secondary text-xs font-inter ml-1">(hoje!)</span>}
                        </p>
                      </div>
                      <span className="text-muted-foreground text-xs font-inter flex-shrink-0">dia {b.day}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
