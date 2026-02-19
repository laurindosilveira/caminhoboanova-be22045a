import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, MessageCircle, Flame } from "lucide-react";

interface CommunityMember {
  user_id: string;
  full_name: string;
  completed_count: number;
  faith_points: number;
}

interface Message {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export default function CommunityTab() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    if (!profile) return;

    // Fetch messages for area/community
    async function fetchMessages() {
      setLoadingMessages(true);
      const { data } = await supabase
        .from("messages")
        .select("id, title, body, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      setMessages(data ?? []);
      setLoadingMessages(false);
    }

    // Fetch community ranking via DB function (bypasses RLS safely)
    async function fetchRanking() {
      setLoadingMembers(true);
      const { data } = await supabase.rpc("get_community_ranking", {
        _community: profile.community as any,
      });
      setMembers((data ?? []) as CommunityMember[]);
      setLoadingMembers(false);
    }

    fetchMessages();
    fetchRanking();
  }, [profile]);

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor(diff / 60000);
    if (d > 0) return `${d}d atrás`;
    if (h > 0) return `${h}h atrás`;
    return `${m}min atrás`;
  }

  const myUserId = profile?.user_id;

  return (
    <div className="px-5 pt-5 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-montserrat font-black text-foreground text-xl">👥 Comunidade</h2>
        {profile?.community && (
          <span className="text-xs font-inter text-muted-foreground bg-muted rounded-full px-3 py-1">
            {profile.community}
          </span>
        )}
      </div>

      {/* Pastor messages */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="font-montserrat font-bold text-foreground text-sm">Mensagens do Pastor</span>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ranking */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-secondary" />
          <span className="font-montserrat font-bold text-foreground text-sm">Ranking da comunidade</span>
        </div>

        {loadingMembers ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="bg-muted rounded-2xl h-16 animate-pulse" />)}
          </div>
        ) : members.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-6 text-center">
            <p className="text-muted-foreground text-sm font-inter">Nenhum participante encontrado.</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            {members.map((m, i) => {
              const isMe = m.user_id === myUserId;
              const initials = m.full_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
              return (
                <div
                  key={m.user_id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < members.length - 1 ? "border-b border-border" : ""
                  } ${isMe ? "bg-primary/5" : ""}`}
                >
                  <div className="w-7 flex-shrink-0 text-center">
                    {medal ? (
                      <span className="text-lg">{medal}</span>
                    ) : (
                      <span className="font-montserrat font-black text-muted-foreground text-sm">#{i + 1}</span>
                    )}
                  </div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-montserrat font-black text-sm text-primary-foreground flex-shrink-0 ${isMe ? "bg-gradient-orange" : "bg-primary"}`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-montserrat font-bold text-card-foreground text-sm">
                      {m.full_name} {isMe && <span className="text-secondary text-xs font-inter">(você)</span>}
                    </p>
                    <p className="text-muted-foreground text-xs font-inter">{Number(m.completed_count)} atividades · {Number(m.faith_points)} pts</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-montserrat font-black text-accent text-sm">{Number(m.faith_points)} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
