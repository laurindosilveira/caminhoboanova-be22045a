import { useState } from "react";
import { Home, Trophy, Calendar, User, Flame, Star, Heart, Lock, CheckCircle, Zap, Bell, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "jornada" | "conquistas" | "agenda" | "perfil";

const journeySteps = [
  { id: 1, type: "devocional", title: "Devocional 1", subtitle: "Salmo 23 — O Senhor é meu pastor", status: "done", icon: "📖", color: "brand-green" },
  { id: 2, type: "devocional", title: "Devocional 2", subtitle: "João 15 — A videira e os ramos", status: "done", icon: "📖", color: "brand-green" },
  { id: 3, type: "formacao", title: "Formação 1", subtitle: "O que é a Crisma?", status: "available", icon: "🎓", color: "brand-orange" },
  { id: 4, type: "encontro", title: "Encontro 1", subtitle: "Partilha em comunidade", status: "locked", icon: "📅", color: "brand-blue" },
  { id: 5, type: "desafio", title: "Desafio Especial", subtitle: "Oração por 3 dias seguidos", status: "locked", icon: "✨", color: "brand-gold" },
  { id: 6, type: "formacao", title: "Formação 2", subtitle: "Os dons do Espírito Santo", status: "locked", icon: "🎓", color: "brand-blue" },
];

const achievements = [
  { id: 1, icon: "🔥", title: "7 dias seguidos", desc: "Sequência de fé incrível!", unlocked: true },
  { id: 2, icon: "📖", title: "10 Devocionais", desc: "Palavra no coração!", unlocked: true },
  { id: 3, icon: "🎓", title: "Primeiro módulo", desc: "Completo com louvor!", unlocked: false },
  { id: 4, icon: "⭐", title: "100 pontos da fé", desc: "Crescendo sempre!", unlocked: false },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("jornada");
  const [missionStarted, setMissionStarted] = useState(false);
  const { profile, signOut } = useAuth();
  const streakDays = 5;
  const faithPoints = 120;
  const faithLevel = 3;
  const faithEnergy = 4; // out of 5
  const firstName = profile?.full_name?.split(" ")[0] ?? "Bem-vindo";

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {/* Status Bar Area */}
      <div className="bg-gradient-hero pt-safe">

        {/* Header */}
        <header className="px-5 pt-6 pb-4" style={{ background: "var(--gradient-hero)" }}>
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center border-2 border-secondary/40">
                <span className="text-lg">✝️</span>
              </div>
              <div>
                <p className="text-primary-foreground/70 text-xs font-inter">Olá, {firstName}!</p>
                <p className="text-primary-foreground font-montserrat font-bold text-sm">
                  {profile?.community ?? "Caminho"}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              title="Sair"
              className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
            >
              <LogOut className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Streak */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-3 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Flame className="w-5 h-5 text-secondary" style={{ fill: "hsl(var(--secondary))" }} />
                <span className="font-montserrat font-black text-primary-foreground text-xl">{streakDays}</span>
              </div>
              <span className="text-primary-foreground/60 text-xs font-inter">dias seguidos</span>
            </div>

            {/* Points */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-3 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-accent" style={{ fill: "hsl(var(--accent))" }} />
                <span className="font-montserrat font-black text-primary-foreground text-xl">{faithPoints}</span>
              </div>
              <span className="text-primary-foreground/60 text-xs font-inter">pontos da fé</span>
            </div>

            {/* Level */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-3 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Heart className="w-5 h-5 text-destructive" style={{ fill: "hsl(0 80% 70%)" }} />
                <span className="font-montserrat font-black text-primary-foreground text-xl">{faithLevel}</span>
              </div>
              <span className="text-primary-foreground/60 text-xs font-inter">nível da fé</span>
            </div>
          </div>

          {/* Faith energy bar */}
          <div className="mt-4 bg-white/10 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary-foreground/80 text-xs font-inter font-medium">Energia espiritual</span>
              <span className="text-primary-foreground/60 text-xs">{faithEnergy}/5</span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-3 rounded-full transition-all ${i < faithEnergy ? "bg-secondary shadow-md" : "bg-white/20"}`}
                />
              ))}
            </div>
          </div>
        </header>
      </div>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto pb-24">

        {/* Today's Mission Card */}
        <div className="px-5 -mt-1 pt-5">
          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="bg-gradient-orange px-5 py-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
              <span className="font-montserrat font-bold text-primary-foreground text-sm">MISSÃO DE HOJE</span>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                  📖
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs font-inter mb-1">Devocional</p>
                  <h2 className="font-montserrat font-bold text-card-foreground text-lg leading-tight">
                    "O Senhor é meu pastor"
                  </h2>
                  <p className="text-muted-foreground text-sm font-inter mt-1">Salmo 23 — 5 minutos</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-accent font-montserrat font-bold text-sm">+15 pts</span>
                </div>
                <button
                  onClick={() => setMissionStarted(true)}
                  className={`px-6 py-3 rounded-xl font-montserrat font-bold text-sm text-primary-foreground transition-all active:scale-95 ${missionStarted
                    ? "bg-brand-green shadow-md shadow-brand-green/30"
                    : "bg-gradient-orange shadow-md shadow-secondary/30 animate-pulse-glow"
                    }`}
                >
                  {missionStarted ? "✅ Iniciado!" : "COMEÇAR AGORA"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Journey Path */}
        <div className="px-5 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-black text-foreground text-xl">🛤️ Sua Jornada</h2>
            <span className="text-muted-foreground text-xs font-inter">2/6 concluídos</span>
          </div>

          <div className="relative">
            {journeySteps.map((step, index) => (
              <div key={step.id} className="flex gap-4 mb-1">
                {/* Timeline line + circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 relative transition-all
                      ${step.status === "done" ? "bg-brand-green shadow-lg shadow-brand-green/30" : ""}
                      ${step.status === "available" ? "bg-gradient-orange shadow-xl shadow-secondary/40 animate-float" : ""}
                      ${step.status === "locked" ? "bg-muted" : ""}
                    `}
                  >
                    {step.status === "done" && (
                      <CheckCircle className="w-7 h-7 text-primary-foreground fill-primary-foreground absolute" />
                    )}
                    {step.status === "available" && (
                      <span className="text-2xl">{step.icon}</span>
                    )}
                    {step.status === "locked" && (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                    {step.status === "available" && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                        <Star className="w-2.5 h-2.5 text-accent-foreground fill-accent-foreground" />
                      </span>
                    )}
                  </div>
                  {index < journeySteps.length - 1 && (
                    <div className={`w-0.5 h-8 mt-1 rounded-full ${step.status === "done" ? "bg-brand-green/40" : "bg-border"}`} />
                  )}
                </div>

                {/* Step info */}
                <div className={`flex-1 pt-3 pb-5 ${step.status === "locked" ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-montserrat font-bold uppercase tracking-wide
                      ${step.type === "devocional" ? "text-brand-green" : ""}
                      ${step.type === "formacao" ? "text-secondary" : ""}
                      ${step.type === "encontro" ? "text-primary" : ""}
                      ${step.type === "desafio" ? "text-accent" : ""}
                    `}>
                      {step.type === "devocional" && "📖 Devocional"}
                      {step.type === "formacao" && "🎓 Formação"}
                      {step.type === "encontro" && "📅 Encontro"}
                      {step.type === "desafio" && "✨ Desafio"}
                    </span>
                    {step.status === "done" && (
                      <span className="text-xs text-brand-green font-inter">✔ Concluído</span>
                    )}
                  </div>
                  <h3 className="font-montserrat font-bold text-card-foreground text-base">{step.title}</h3>
                  <p className="text-muted-foreground text-sm font-inter">{step.subtitle}</p>

                  {step.status === "available" && (
                    <button className="mt-3 px-4 py-2 bg-gradient-orange rounded-xl text-primary-foreground text-sm font-montserrat font-bold shadow-md shadow-secondary/20 active:scale-95 transition-all">
                      Iniciar →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="px-5 pt-2 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-black text-foreground text-xl">🏆 Conquistas</h2>
            <button className="text-secondary text-sm font-inter font-medium">Ver todas</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`rounded-2xl p-4 border transition-all ${achievement.unlocked
                  ? "bg-card border-accent/30 shadow-md"
                  : "bg-muted border-border opacity-50"
                  }`}
              >
                <span className="text-3xl block mb-2">
                  {achievement.unlocked ? achievement.icon : "🔒"}
                </span>
                <p className="font-montserrat font-bold text-card-foreground text-sm leading-tight">
                  {achievement.title}
                </p>
                <p className="text-muted-foreground text-xs font-inter mt-1">
                  {achievement.desc}
                </p>
                {achievement.unlocked && (
                  <div className="mt-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
                    <span className="text-brand-green text-xs font-inter">Desbloqueada</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Disciple Profile Card */}
        <div className="px-5 pb-6">
          <div className="bg-gradient-hero rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl border-2 border-white/30">
                  🧑‍🎓
                </div>
                <div>
                  <p className="text-primary-foreground/70 text-xs font-inter">Perfil do discípulo</p>
                  <h3 className="font-montserrat font-black text-primary-foreground text-lg">Discípula Nível 3</h3>
                  <p className="text-primary-foreground/70 text-sm font-inter">Comunidade Bom Pastor • Área 1</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-primary-foreground/70 text-xs font-inter">Progresso para Nível 4</span>
                  <span className="text-primary-foreground text-xs font-montserrat font-bold">120/200 pts</span>
                </div>
                <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-orange rounded-full transition-all"
                    style={{ width: "60%" }}
                  />
                </div>
              </div>
              <p className="mt-3 text-primary-foreground/80 text-xs font-inter italic">
                ✨ "Crescendo na fé, juntos."
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border shadow-xl">
        <div className="grid grid-cols-4 py-2">
          {[
            { tab: "jornada" as Tab, icon: Home, label: "Jornada", emoji: "🏠" },
            { tab: "conquistas" as Tab, icon: Trophy, label: "Conquistas", emoji: "🏆" },
            { tab: "agenda" as Tab, icon: Calendar, label: "Agenda", emoji: "📅" },
            { tab: "perfil" as Tab, icon: User, label: "Perfil", emoji: "👤" },
          ].map(({ tab, icon: Icon, label, emoji }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all active:scale-95
                ${activeTab === tab ? "text-secondary" : "text-muted-foreground"}
              `}
            >
              <div className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-all ${activeTab === tab ? "bg-secondary/10" : ""}`}>
                <Icon className={`w-5 h-5 ${activeTab === tab ? "text-secondary" : "text-muted-foreground"}`} />
                {tab === "conquistas" && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full"></span>
                )}
              </div>
              <span className={`text-xs font-inter ${activeTab === tab ? "font-bold text-secondary" : "font-medium"}`}>
                {label}
              </span>
              {activeTab === tab && (
                <div className="w-1 h-1 bg-secondary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
