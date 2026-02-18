const achievements = [
  { id: 1, icon: "🔥", title: "7 dias seguidos", desc: "Sequência de fé incrível!", unlocked: true },
  { id: 2, icon: "📖", title: "10 Devocionais", desc: "Palavra no coração!", unlocked: true },
  { id: 3, icon: "🎓", title: "Primeiro módulo", desc: "Completo com louvor!", unlocked: false },
  { id: 4, icon: "⭐", title: "100 pontos da fé", desc: "Crescendo sempre!", unlocked: false },
];

export default function AchievementsGrid() {
  return (
    <div className="px-5 pt-2 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-montserrat font-black text-foreground text-xl">🏆 Conquistas</h2>
        <button className="text-secondary text-sm font-inter font-medium">Ver todas</button>
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
