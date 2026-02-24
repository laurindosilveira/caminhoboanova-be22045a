import { useEffect, useState, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Lock, Flame } from "lucide-react";

interface AchievementsGridProps {
  faithPoints: number;
  streakDays: number;
  completedCount: number;
}

type Achievement = {
  id: number;
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
  current: number;
  target: number;
  secret?: boolean;
};

type Winner = { position: number; user_id: string; full_name: string; faith_points: number; medal: string };
type RankingSeason = { id: string; course_id: string; community: string; closed_at: string; winners: Winner[]; total_participants: number };

interface RankingMember {
  user_id: string;
  full_name: string;
  completed_count: number;
  faith_points: number;
}

export default function AchievementsGrid({ faithPoints, streakDays, completedCount }: AchievementsGridProps) {
  const { profile } = useAuth();
  const myUserId = profile?.user_id;
  const [seasons, setSeasons] = useState<RankingSeason[]>([]);
  const [members, setMembers] = useState<RankingMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [celebrationFired, setCelebrationFired] = useState(false);
  const winnerBannerRef = useRef<HTMLDivElement>(null);

  const fireCelebration = useCallback(() => {
    if (celebrationFired) return;
    const seasonIds = seasons.map(s => s.id).sort().join(",");
    const storageKey = `celebration_seen_${myUserId}_${seasonIds}`;
    if (localStorage.getItem(storageKey)) return;

    setCelebrationFired(true);
    localStorage.setItem(storageKey, "true");

    const end = Date.now() + 2500;
    const colors = ["#FFD700", "#FFA500", "#FF6347", "#9b59b6", "#3498db"];

    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [celebrationFired, seasons, myUserId]);

  useEffect(() => {
    if (!profile) return;
    async function fetchSeasons() {
      const { data } = await supabase
        .from("ranking_seasons")
        .select("*")
        .eq("community", profile!.community as string);
      setSeasons((data ?? []) as unknown as RankingSeason[]);
    }
    async function fetchRanking() {
      setLoadingMembers(true);
      const { data } = await supabase.rpc("get_community_ranking", {
        _community: profile!.community as any,
      });
      setMembers((data ?? []) as RankingMember[]);
      setLoadingMembers(false);
    }
    fetchSeasons();
    fetchRanking();
  }, [profile]);

  const achievements: Achievement[] = [
    { id: 1, icon: "🔥", title: "7 dias seguidos", desc: "Sequência de fé incrível!", unlocked: streakDays >= 7, current: streakDays, target: 7 },
    { id: 2, icon: "📖", title: "Primeiros passos", desc: "Completou sua 1ª atividade!", unlocked: completedCount >= 1, current: completedCount, target: 1 },
    { id: 3, icon: "🎓", title: "5 atividades", desc: "Comprometido com a jornada!", unlocked: completedCount >= 5, current: completedCount, target: 5 },
    { id: 4, icon: "⭐", title: "100 pontos da fé", desc: "Crescendo sempre!", unlocked: faithPoints >= 100, current: faithPoints, target: 100 },
    { id: 5, icon: "🏆", title: "10 atividades", desc: "Dedicação exemplar!", unlocked: completedCount >= 10, current: completedCount, target: 10 },
    { id: 6, icon: "💎", title: "200 pontos", desc: "Nível máximo de fé!", unlocked: faithPoints >= 200, current: faithPoints, target: 200 },
    // Conquistas surpresa — só aparecem quando desbloqueadas
    { id: 7, icon: "🛡️", title: "Guardião da Fé", desc: "14 dias seguidos de dedicação!", unlocked: streakDays >= 14, current: streakDays, target: 14, secret: true },
    { id: 8, icon: "👁️‍🗨️", title: "Constância Invisível", desc: "30 dias seguidos — lendário!", unlocked: streakDays >= 30, current: streakDays, target: 30, secret: true },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="px-5 pt-2 pb-4 space-y-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-montserrat font-black text-foreground text-xl">🏆 Conquistas</h2>
        <span className="text-xs font-inter text-muted-foreground bg-muted rounded-full px-3 py-1">
          {unlockedCount}/{achievements.length} desbloqueadas
        </span>
      </div>

      {/* Winner Banner */}
      {seasons.length > 0 && (() => {
        const myWins = seasons.flatMap(s =>
          ((s.winners ?? []) as Winner[]).filter(w => w.user_id === myUserId).map(w => ({ ...w, season: s }))
        );
        if (myWins.length === 0) return null;
        return (
          <div ref={winnerBannerRef}>
            {myWins.map((win, idx) => (
              <div key={idx} className="rounded-2xl p-5 text-center border border-accent/30 shadow-lg mb-3 animate-scale-in relative overflow-hidden"
                style={{ background: "var(--gradient-gold)" }}
                onAnimationEnd={() => fireCelebration()}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)", backgroundSize: "200% 100%", animation: "shimmer 2s ease-in-out infinite" }} />
                <span className="text-5xl block mb-2 drop-shadow-lg animate-float">{win.medal}</span>
                <p className="font-montserrat font-black text-foreground text-lg">🎉 Parabéns, Campeão! 🎉</p>
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


      {/* Ranking da Turma */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-secondary" />
          <span className="font-montserrat font-bold text-foreground text-sm">Ranking da turma</span>
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

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 gap-3">
        {achievements.filter(a => !a.secret || a.unlocked).map((a) => (
          <div
            key={a.id}
            className={`rounded-2xl p-4 border transition-all ${
              a.unlocked
                ? a.secret
                  ? "bg-card border-amber-400/40 shadow-lg ring-1 ring-amber-400/20"
                  : "bg-card border-accent/30 shadow-md"
                : "bg-muted border-border opacity-50"
            }`}
          >
            <span className="text-3xl block mb-2">{a.unlocked ? a.icon : "🔒"}</span>
            <p className="font-montserrat font-bold text-card-foreground text-sm leading-tight">
              {a.secret && a.unlocked && <span className="text-amber-500 text-[10px] font-inter block mb-0.5">✨ SURPRESA!</span>}
              {a.title}
            </p>
            <p className="text-muted-foreground text-xs font-inter mt-1">{a.desc}</p>
            {a.unlocked ? (
              <div className="mt-2 flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${a.secret ? "bg-amber-500" : "bg-brand-green"}`} />
                <span className={`text-xs font-inter ${a.secret ? "text-amber-500" : "text-brand-green"}`}>Desbloqueada</span>
              </div>
            ) : (
              <div className="mt-2">
                <div className="h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full bg-secondary/60 transition-all"
                    style={{ width: `${Math.min(100, (a.current / a.target) * 100)}%` }}
                  />
                </div>
                <p className="text-muted-foreground text-[10px] font-inter">
                  Faltam {Math.max(0, a.target - a.current)} {a.target <= 10 && a.title.includes("dias") ? "dias" : ""}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Placeholder para conquistas secretas não desbloqueadas */}
        {achievements.filter(a => a.secret && !a.unlocked).length > 0 && (
          <div className="rounded-2xl p-4 border border-dashed border-amber-400/30 bg-amber-400/5 flex flex-col items-center justify-center text-center col-span-2">
            <span className="text-3xl mb-2">❓</span>
            <p className="font-montserrat font-bold text-foreground/60 text-sm">Conquistas secretas</p>
            <p className="text-muted-foreground text-[10px] font-inter mt-1">
              {achievements.filter(a => a.secret && !a.unlocked).length} conquista{achievements.filter(a => a.secret && !a.unlocked).length > 1 ? "s" : ""} escondida{achievements.filter(a => a.secret && !a.unlocked).length > 1 ? "s" : ""} — continue sua jornada!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
