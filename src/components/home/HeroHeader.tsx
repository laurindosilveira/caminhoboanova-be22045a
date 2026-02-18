import { Flame, Star, Heart, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeroHeaderProps {
  streakDays: number;
  faithPoints: number;
  faithLevel: number;
  faithEnergy: number;
}

export default function HeroHeader({ streakDays, faithPoints, faithLevel, faithEnergy }: HeroHeaderProps) {
  const { profile, signOut } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] ?? "Bem-vindo";

  return (
    <div style={{ background: "var(--gradient-hero)" }}>
      <header className="px-5 pt-6 pb-5">
        {/* Top row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
              <span className="text-xl">✝️</span>
            </div>
            <div>
              <p className="text-primary-foreground/70 text-xs font-inter">Olá, {firstName}!</p>
              <p className="text-primary-foreground font-montserrat font-bold text-sm">
                {profile?.community ?? "Caminho da Crisma"}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            title="Sair"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <LogOut className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <Flame className="w-5 h-5 text-secondary" style={{ fill: "hsl(var(--secondary))" }} />
              <span className="font-montserrat font-black text-primary-foreground text-xl">{streakDays}</span>
            </div>
            <span className="text-primary-foreground/60 text-xs font-inter">dias seguidos</span>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-accent" style={{ fill: "hsl(var(--accent))" }} />
              <span className="font-montserrat font-black text-primary-foreground text-xl">{faithPoints}</span>
            </div>
            <span className="text-primary-foreground/60 text-xs font-inter">pontos da fé</span>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <Heart className="w-5 h-5" style={{ fill: "hsl(0 80% 70%)", color: "hsl(0 80% 70%)" }} />
              <span className="font-montserrat font-black text-primary-foreground text-xl">{faithLevel}</span>
            </div>
            <span className="text-primary-foreground/60 text-xs font-inter">nível da fé</span>
          </div>
        </div>

        {/* Spiritual energy — flame icons */}
        <div className="mt-3 bg-white/10 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-primary-foreground/80 text-xs font-inter font-medium">Energia espiritual</span>
            <span className="text-primary-foreground/60 text-xs">{faithEnergy}/5</span>
          </div>
          <div className="flex gap-2 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-2xl transition-all duration-300 ${i < faithEnergy ? "drop-shadow-[0_0_6px_hsl(29_100%_50%_/_0.8)]" : "opacity-30 grayscale"}`}
                style={{ filter: i < faithEnergy ? "drop-shadow(0 0 4px hsl(29 100% 50% / 0.9))" : undefined }}
              >
                🔥
              </span>
            ))}
          </div>
        </div>
      </header>
    </div>
  );
}
