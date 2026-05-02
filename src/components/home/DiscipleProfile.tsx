import { Star, Flame, CheckCircle, TrendingUp } from "lucide-react";

interface DiscipleProfileProps {
  faithPoints: number;
  faithLevel: number;
  streakDays: number;
  completedCount: number;
  community?: string;
  area?: string;
}

export default function DiscipleProfile({ faithPoints, faithLevel, streakDays, completedCount, community, area }: DiscipleProfileProps) {
  const nextLevelPoints = 200;
  const progress = Math.round((faithPoints / nextLevelPoints) * 100);

  return (
    <section className="px-5 pb-6" aria-labelledby="perfil-titulo">
      <h2 id="perfil-titulo" className="sr-only">Perfil do Discípulo</h2>
      <div className="rounded-[2.5rem] overflow-hidden relative shadow-xl" style={{ background: "var(--gradient-hero)" }}>
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full translate-y-8 -translate-x-8 blur-2xl pointer-events-none" />

        <div className="relative p-6">
          {/* Growth badge */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 w-fit mb-6 shadow-sm">
            <TrendingUp className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-accent text-[10px] font-bold font-inter uppercase tracking-widest">Crescimento constante ⭐</span>
          </div>

          {/* Avatar + Info */}
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl border border-white/20 shadow-lg flex-shrink-0 animate-float">
              🧑‍🎓
            </div>
            <div className="min-w-0">
              <p className="text-primary-foreground/60 text-[10px] font-bold font-inter uppercase tracking-widest">Nível de Fé</p>
              <h3 className="font-montserrat font-black text-primary-foreground text-xl leading-tight">Discípulo Nível {faithLevel}</h3>
              <p className="text-primary-foreground/70 text-xs font-inter font-medium mt-1 truncate">{community ?? "Caminho"} • {area ?? "Área 1"}</p>
            </div>
          </div>

          {/* Summary stats — Bento Style */}
          <div className="grid grid-cols-3 gap-3 mb-6" role="group" aria-label="Estatísticas detalhadas">
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3.5 flex flex-col items-center gap-1 shadow-sm transition-transform hover:scale-[1.02]">
              <Flame className="w-5 h-5 text-secondary" style={{ fill: "hsl(var(--secondary))" }} aria-hidden="true" />
              <span className="font-montserrat font-black text-primary-foreground text-xl tabular-nums">{streakDays}</span>
              <span className="text-primary-foreground/50 text-[9px] font-bold font-inter uppercase tracking-widest">dias</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3.5 flex flex-col items-center gap-1 shadow-sm transition-transform hover:scale-[1.02]">
              <Star className="w-5 h-5 text-accent" style={{ fill: "hsl(var(--accent))" }} aria-hidden="true" />
              <span className="font-montserrat font-black text-primary-foreground text-xl tabular-nums">{faithPoints}</span>
              <span className="text-primary-foreground/50 text-[9px] font-bold font-inter uppercase tracking-widest">pts</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-3.5 flex flex-col items-center gap-1 shadow-sm transition-transform hover:scale-[1.02]">
              <CheckCircle className="w-5 h-5 text-brand-green" style={{ fill: "hsl(var(--brand-green) / 0.2)" }} aria-hidden="true" />
              <span className="font-montserrat font-black text-primary-foreground text-xl tabular-nums">{completedCount}</span>
              <span className="text-primary-foreground/50 text-[9px] font-bold font-inter uppercase tracking-widest">feito</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-3" role="meter" aria-label="Progresso de nível" aria-valuenow={faithPoints} aria-valuemin={0} aria-valuemax={nextLevelPoints}>
            <div className="flex items-center justify-between">
              <span className="text-primary-foreground/70 text-[10px] font-bold font-inter uppercase tracking-widest">Próximo Nível: {faithLevel + 1}</span>
              <span className="text-primary-foreground text-xs font-montserrat font-black tabular-nums">{faithPoints} / {nextLevelPoints}</span>
            </div>
            <div className="h-4 bg-white/10 rounded-full border border-white/10 shadow-inner p-0.5">
              <div
                className="h-full bg-gradient-orange rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              </div>
            </div>
          </div>

          <p className="mt-6 text-primary-foreground/50 text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-center">
            ✨ Crescendo na fé, juntos ✨
          </p>
        </div>
      </div>
    </section>

  );
}
