import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Flame, GraduationCap, Trophy, Lock } from "lucide-react";
import ClassroomTab from "./ClassroomTab";

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

type Winner = { position: number; user_id: string; full_name: string; faith_points: number; medal: string };
type RankingSeason = { id: string; course_id: string; community: string; closed_at: string; winners: Winner[]; total_participants: number };

type SubTab = "comunidade" | "sala";

export default function CommunityTab() {
  const { profile } = useAuth();
  const [subTab, setSubTab] = useState<SubTab>("comunidade");
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [seasons, setSeasons] = useState<RankingSeason[]>([]);

  useEffect(() => {
    if (!profile) return;

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

    // Fetch seasons for this community
    async function fetchSeasons() {
      const { data } = await supabase
        .from("ranking_seasons")
        .select("*")
        .eq("community", profile.community as string);
      setSeasons((data ?? []) as unknown as RankingSeason[]);
    }
    fetchSeasons();
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
            <Flame className="w-3.5 h-3.5" />
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
          {/* Winner Banner — if user is a winner */}
          {seasons.length > 0 && (() => {
            const myWins = seasons.flatMap(s =>
              ((s.winners ?? []) as Winner[]).filter(w => w.user_id === myUserId).map(w => ({ ...w, season: s }))
            );
            if (myWins.length === 0) return null;
            return (
              <div>
                {myWins.map((win, idx) => (
                  <div key={idx} className="rounded-2xl p-5 text-center border border-accent/30 shadow-lg mb-3"
                    style={{ background: "var(--gradient-gold)" }}>
                    <span className="text-5xl block mb-2">{win.medal}</span>
                    <p className="font-montserrat font-black text-foreground text-lg">Parabéns, Campeão!</p>
                    <p className="font-inter text-sm text-foreground/80 mt-1">
                      Você ficou em <strong>{win.position}º lugar</strong> com <strong>{win.faith_points} pontos</strong>!
                    </p>
                    <p className="font-inter text-xs text-muted-foreground mt-2">
                      Ranking encerrado em {new Date(win.season.closed_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}

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

          {/* Closed Season Podiums */}
          {seasons.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-accent-foreground" />
                <span className="font-montserrat font-bold text-foreground text-sm">🏆 Pódio Final</span>
              </div>
              {seasons.map(s => (
                <div key={s.id} className="bg-card rounded-2xl border border-accent/20 overflow-hidden shadow-sm mb-3">
                  <div className="px-4 py-2.5 bg-accent/10 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-accent-foreground" />
                    <span className="font-montserrat font-bold text-foreground text-xs">Ranking encerrado</span>
                    <span className="text-[10px] font-inter text-muted-foreground ml-auto">
                      {new Date(s.closed_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    {((s.winners ?? []) as Winner[]).map(w => (
                      <div key={w.user_id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${w.user_id === myUserId ? "bg-accent/10 ring-1 ring-accent/30" : "bg-muted/30"}`}>
                        <span className="text-2xl">{w.medal}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-montserrat font-bold text-foreground text-sm">
                            {w.full_name} {w.user_id === myUserId && <span className="text-accent-foreground text-xs font-inter">(você!)</span>}
                          </p>
                        </div>
                        <span className="font-montserrat font-black text-accent-foreground text-sm">{w.faith_points} pts</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-border">
                    <p className="text-muted-foreground font-inter text-[10px]">{s.total_participants} participantes</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Ranking */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-secondary" />
              <span className="font-montserrat font-bold text-foreground text-sm">Ranking da comunidade</span>
              {seasons.length > 0 && (
                <span className="text-[10px] font-inter text-muted-foreground bg-muted rounded-full px-2 py-0.5 ml-auto">em andamento</span>
              )}
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
      )}
    </div>
  );
}
