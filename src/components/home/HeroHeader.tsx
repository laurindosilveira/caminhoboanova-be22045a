import { Flame, Star, Heart, LogOut, ArrowLeftRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";

interface HeroHeaderProps {
  streakDays: number;
  faithPoints: number;
  faithLevel: number;
  faithEnergy: number;
}

export default function HeroHeader({ streakDays, faithPoints, faithLevel, faithEnergy }: HeroHeaderProps) {
  const { profile, role, signOut } = useAuth();
  const { effectiveArea, setEffectiveArea, isOverriding } = useAreaSwitch();
  const firstName = profile?.full_name?.split(" ")[0] ?? "Bem-vindo";
  const isAdmin = role === "admin";

  return (
    <div className="relative z-10 safe-top" style={{ background: "var(--gradient-hero)" }}>
      <header className="px-5 pt-6 pb-6" role="banner">
        {/* Top row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg" aria-hidden="true">
              <span className="text-2xl animate-float">✝️</span>
            </div>
            <div>
              <p className="text-primary-foreground/60 text-[10px] font-bold font-inter uppercase tracking-widest">Olá, {firstName}!</p>
              <h1 className="text-primary-foreground font-montserrat font-extrabold text-sm leading-tight text-balance">
                {profile?.community ?? "Confirmatório Boa Nova"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Area switcher for admins */}
            {isAdmin && (
              <div className="relative group">
                <label htmlFor="area-switcher" className="sr-only">Selecionar área</label>
                <select
                  id="area-switcher"
                  value={effectiveArea}
                  onChange={e => setEffectiveArea(e.target.value)}
                  aria-label="Selecionar área de visualização"
                  className="appearance-none bg-white/10 backdrop-blur-md border border-white/20 text-primary-foreground rounded-xl pl-3.5 pr-8 py-2 text-[11px] font-bold font-inter uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer hover:bg-white/15 transition-all"
                >
                  <option value="Área 1" className="text-foreground">Área 1</option>
                  <option value="Área 2" className="text-foreground">Área 2</option>
                </select>
                <ArrowLeftRight className="w-3.5 h-3.5 text-primary-foreground/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary-foreground transition-colors" aria-hidden="true" />
              </div>
            )}
            <button
              onClick={signOut}
              aria-label="Sair da conta"
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 hover:bg-destructive/20 hover:border-destructive/30 hover:text-destructive transition-all active:scale-95 shadow-lg group"
            >
              <LogOut className="w-4.5 h-4.5 text-primary-foreground group-hover:text-destructive-foreground transition-colors" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Area override indicator */}
        {isOverriding && (
          <div className="mb-4 bg-secondary/20 backdrop-blur-md border border-secondary/30 rounded-2xl px-4 py-2.5 flex items-center gap-3 animate-tab-slide" role="status" aria-live="polite">
            <ArrowLeftRight className="w-4 h-4 text-secondary animate-pulse" aria-hidden="true" />
            <span className="text-primary-foreground text-xs font-inter font-medium">
              Modo visualização: <strong>{effectiveArea}</strong>
            </span>
          </div>
        )}

        {/* Stats row — Bento Style */}
        <div className="grid grid-cols-3 gap-3" role="group" aria-label="Estatísticas de progresso">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex flex-col items-center gap-1.5 transition-all hover:bg-white/15 hover:shadow-lg group" aria-label={`${streakDays} dias seguidos`}>
            <div className="flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-secondary transition-transform group-hover:scale-110" style={{ fill: "hsl(var(--secondary))" }} aria-hidden="true" />
              <span className="font-montserrat font-black text-primary-foreground text-2xl tabular-nums">{streakDays}</span>
            </div>
            <span className="text-primary-foreground/60 text-[9px] font-bold font-inter uppercase tracking-widest text-center">Dias seguidos</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex flex-col items-center gap-1.5 transition-all hover:bg-white/15 hover:shadow-lg group" aria-label={`${faithPoints} pontos da fé`}>
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 text-accent transition-transform group-hover:rotate-12" style={{ fill: "hsl(var(--accent))" }} aria-hidden="true" />
              <span className="font-montserrat font-black text-primary-foreground text-2xl tabular-nums">{faithPoints}</span>
            </div>
            <span className="text-primary-foreground/60 text-[9px] font-bold font-inter uppercase tracking-widest text-center">Pontos da fé</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex flex-col items-center gap-1.5 transition-all hover:bg-white/15 hover:shadow-lg group" aria-label={`Nível da fé: ${faithLevel}`}>
            <div className="flex items-center gap-1.5">
              <Heart className="w-5 h-5 transition-transform group-hover:scale-110" style={{ fill: "hsl(0 84% 65%)", color: "hsl(0 84% 65%)" }} aria-hidden="true" />
              <span className="font-montserrat font-black text-primary-foreground text-2xl tabular-nums">{faithLevel}</span>
            </div>
            <span className="text-primary-foreground/60 text-[9px] font-bold font-inter uppercase tracking-widest text-center">Nível da fé</span>
          </div>
        </div>

        {/* Spiritual energy — flame icons */}
        <div className="mt-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-inner" role="meter" aria-label="Energia espiritual" aria-valuenow={faithEnergy} aria-valuemin={0} aria-valuemax={5}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-primary-foreground font-inter text-[10px] font-bold uppercase tracking-widest">Energia espiritual</span>
            <span className="text-primary-foreground/60 text-xs font-montserrat font-black">{faithEnergy}/5</span>
          </div>
          <div className="flex gap-4 justify-center" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-3xl transition-all duration-500 ease-spring ${i < faithEnergy ? "drop-shadow-[0_0_8px_hsl(var(--secondary)_/_0.6)]" : "opacity-20 grayscale scale-90"}`}
                style={{ 
                  filter: i < faithEnergy ? "drop-shadow(0 0 5px hsl(var(--secondary) / 0.8))" : undefined,
                  transitionDelay: `${i * 100}ms`
                }}
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
