import { Flame, Star, Heart, LogOut, ArrowLeftRight } from "lucide-react";
import { AREAS, formatGrowthGroupName } from "@/config/areas";
import { useAuth } from "@/contexts/AuthContext";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";
import { toast } from "sonner";
import BrandLogo from "@/components/BrandLogo";

interface HeroHeaderProps {
  streakDays: number;
  streakFrozen: boolean;
  streakAtRisk: boolean;
  faithPoints: number;
  faithLevel: number;
  faithEnergy: number;
}

export default function HeroHeader({ streakDays, streakFrozen, streakAtRisk, faithPoints, faithLevel, faithEnergy }: HeroHeaderProps) {
  const { profile, role, signOut } = useAuth();
  const { effectiveArea, setEffectiveArea, isOverriding } = useAreaSwitch();
  const firstName = profile?.full_name?.split(" ")[0] ?? "Bem-vindo";
  const isAdmin = role === "admin";

  return (
    <div style={{ background: "var(--gradient-hero)" }}>
      <header className="px-5 pt-6 pb-5" role="banner">
        {/* Top row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BrandLogo inverse compact markClassName="h-11 w-11" />
            <div>
              <p className="text-primary-foreground/70 text-xs font-inter uppercase tracking-[0.15em] leading-none mb-1.5 font-bold">
                {profile?.churches?.name || profile?.community || "Boa Nova"}
              </p>
              <h1 className="text-primary-foreground font-montserrat font-black text-2xl leading-tight">
                {profile?.full_name || "Participante"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Area switcher for admins */}
            {isAdmin && (
              <div className="relative">
                <label htmlFor="area-switcher" className="sr-only">Selecionar Grupo de Crescimento</label>
                <select
                  id="area-switcher"
                  value={effectiveArea}
                  onChange={async (e) => {
                    try {
                      await setEffectiveArea(e.target.value);
                    } catch {
                      toast.error("Não foi possível trocar o Grupo de Crescimento agora.");
                    }
                  }}
                  aria-label="Selecionar Grupo de Crescimento para visualização"
                  className="appearance-none bg-white/15 backdrop-blur border border-white/30 text-primary-foreground rounded-full pl-3 pr-7 py-1.5 text-xs font-inter font-semibold focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
                >
                  {AREAS.map(a => <option key={a} value={a} className="text-foreground">{formatGrowthGroupName(a)}</option>)}
                </select>
                <ArrowLeftRight className="w-3 h-3 text-primary-foreground/70 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              </div>
            )}
            <button
              onClick={signOut}
              aria-label="Sair da conta"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <LogOut className="w-4 h-4 text-primary-foreground" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Area override indicator */}
        {isOverriding && (
          <div className="mb-3 bg-white/15 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2" role="status" aria-live="polite">
            <ArrowLeftRight className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
            <span className="text-primary-foreground/90 text-xs font-inter">
              Visualizando como <strong>{formatGrowthGroupName(effectiveArea)}</strong>
            </span>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5" role="group" aria-label="Estatísticas de progresso">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 flex flex-col items-center gap-1" aria-label={`${streakDays} dias de sequência${streakFrozen ? ", pausada até o próximo devocional" : streakAtRisk ? ", em risco hoje" : ""}`}>
            <div className="flex items-center gap-1">
              <Flame className="w-5 h-5 text-secondary" style={{ fill: "hsl(var(--secondary))" }} aria-hidden="true" />
              <span className="font-montserrat font-black text-primary-foreground text-xl">{streakDays}</span>
            </div>
            <span className="text-primary-foreground/60 text-[11px] font-inter text-center leading-tight">
              {streakFrozen ? "sequência pausada" : streakAtRisk ? "faça o de hoje" : "dias de sequência"}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 flex flex-col items-center gap-1" aria-label={`${faithPoints} pontos da fé`}>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-accent" style={{ fill: "hsl(var(--accent))" }} aria-hidden="true" />
              <span className="font-montserrat font-black text-primary-foreground text-xl">{faithPoints}</span>
            </div>
            <span className="text-primary-foreground/60 text-xs font-inter">pontos da fé</span>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 flex flex-col items-center gap-1" aria-label={`Nível da fé: ${faithLevel}`}>
            <div className="flex items-center gap-1">
              <Heart className="w-5 h-5" style={{ fill: "hsl(0 80% 70%)", color: "hsl(0 80% 70%)" }} aria-hidden="true" />
              <span className="font-montserrat font-black text-primary-foreground text-xl">{faithLevel}</span>
            </div>
            <span className="text-primary-foreground/60 text-xs font-inter">nível da fé</span>
          </div>
        </div>

        {/* Spiritual energy — simple progress bar */}
        <div className="mt-3 bg-white/10 rounded-2xl p-3" role="meter" aria-label="Energia espiritual" aria-valuenow={faithEnergy} aria-valuemin={0} aria-valuemax={5}>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-primary-foreground/80 text-[10px] uppercase font-inter font-bold tracking-wider">Energia Espiritual</span>
            <span className="text-primary-foreground/90 text-[10px] font-bold font-mono">{faithEnergy}/5</span>
          </div>
          <div className="flex gap-1.5 h-1.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-500 ${
                  i < faithEnergy 
                    ? "bg-secondary shadow-[0_0_8px_rgba(249,115,22,0.6)]" 
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </header>
    </div>
  );
}
