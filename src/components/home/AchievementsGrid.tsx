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
};

export default function AchievementsGrid({ faithPoints, streakDays, completedCount }: AchievementsGridProps) {
  const achievements: Achievement[] = [
    {
      id: 1,
      icon: "🔥",
      title: "7 dias seguidos",
      desc: "Sequência de fé incrível!",
      unlocked: streakDays >= 7,
    },
    {
      id: 2,
      icon: "📖",
      title: "Primeiros passos",
      desc: "Completou sua 1ª atividade!",
      unlocked: completedCount >= 1,
    },
    {
      id: 3,
      icon: "🎓",
      title: "5 atividades",
      desc: "Comprometido com a jornada!",
      unlocked: completedCount >= 5,
    },
    {
      id: 4,
      icon: "⭐",
      title: "100 pontos da fé",
      desc: "Crescendo sempre!",
      unlocked: faithPoints >= 100,
    },
    {
      id: 5,
      icon: "🏆",
      title: "10 atividades",
      desc: "Dedicação exemplar!",
      unlocked: completedCount >= 10,
    },
    {
      id: 6,
      icon: "💎",
      title: "200 pontos",
      desc: "Nível máximo de fé!",
      unlocked: faithPoints >= 200,
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="px-5 pt-2 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-montserrat font-black text-foreground text-xl">🏆 Conquistas</h2>
        <span className="text-xs font-inter text-muted-foreground bg-muted rounded-full px-3 py-1">
          {unlockedCount}/{achievements.length} desbloqueadas
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`rounded-2xl p-4 border transition-all ${
              a.unlocked
                ? "bg-card border-accent/30 shadow-md"
                : "bg-muted border-border opacity-50"
            }`}
          >
            <span className="text-3xl block mb-2">{a.unlocked ? a.icon : "🔒"}</span>
            <p className="font-montserrat font-bold text-card-foreground text-sm leading-tight">{a.title}</p>
            <p className="text-muted-foreground text-xs font-inter mt-1">{a.desc}</p>
            {a.unlocked && (
              <div className="mt-2 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                <span className="text-brand-green text-xs font-inter">Desbloqueada</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
