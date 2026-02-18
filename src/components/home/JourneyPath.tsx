import { CheckCircle, Lock, Star } from "lucide-react";

const journeySteps = [
  { id: 1, type: "devocional", title: "Devocional 1", subtitle: "Salmo 23 — O Senhor é meu pastor", status: "done", icon: "📖" },
  { id: 2, type: "devocional", title: "Devocional 2", subtitle: "João 15 — A videira e os ramos", status: "done", icon: "📖" },
  { id: 3, type: "formacao", title: "Formação 1", subtitle: "O que é a Crisma?", status: "available", icon: "🎓" },
  { id: 4, type: "encontro", title: "Encontro 1", subtitle: "Partilha em comunidade", status: "locked", icon: "📅" },
  { id: 5, type: "desafio", title: "Desafio Especial", subtitle: "Oração por 3 dias seguidos", status: "locked", icon: "✨" },
  { id: 6, type: "formacao", title: "Formação 2", subtitle: "Os dons do Espírito Santo", status: "locked", icon: "🎓" },
];

const typeColors: Record<string, string> = {
  devocional: "text-brand-green",
  formacao: "text-secondary",
  encontro: "text-primary",
  desafio: "text-accent",
};

const typeLabels: Record<string, string> = {
  devocional: "📖 Devocional",
  formacao: "🎓 Formação",
  encontro: "📅 Encontro",
  desafio: "✨ Desafio",
};

export default function JourneyPath() {
  const doneCount = journeySteps.filter((s) => s.status === "done").length;

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-montserrat font-black text-foreground text-xl">🛤️ Minha Jornada</h2>
        <span className="text-muted-foreground text-xs font-inter bg-muted rounded-full px-3 py-1">
          {doneCount}/{journeySteps.length} concluídos
        </span>
      </div>

      <div className="relative">
        {journeySteps.map((step, index) => (
          <div key={step.id} className="flex gap-4 mb-1">
            {/* Timeline */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 relative transition-all
                  ${step.status === "done" ? "bg-brand-green shadow-lg shadow-brand-green/40" : ""}
                  ${step.status === "available" ? "bg-gradient-orange shadow-2xl shadow-secondary/50 animate-float ring-4 ring-secondary/30" : ""}
                  ${step.status === "locked" ? "bg-muted opacity-50" : ""}
                `}
              >
                {step.status === "done" && (
                  <CheckCircle className="w-7 h-7 text-primary-foreground fill-primary-foreground" />
                )}
                {step.status === "available" && (
                  <>
                    <span className="text-2xl">{step.icon}</span>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-md">
                      <Star className="w-3 h-3 text-accent-foreground fill-accent-foreground" />
                    </span>
                  </>
                )}
                {step.status === "locked" && (
                  <Lock className="w-6 h-6 text-muted-foreground" />
                )}
              </div>

              {/* Connector line */}
              {index < journeySteps.length - 1 && (
                <div
                  className={`w-0.5 h-8 mt-1 rounded-full transition-all ${
                    step.status === "done"
                      ? "bg-brand-green/60"
                      : step.status === "available"
                      ? "bg-secondary/30"
                      : "bg-border"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pt-2.5 pb-5 ${step.status === "locked" ? "opacity-40" : ""}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-montserrat font-bold uppercase tracking-wide ${typeColors[step.type]}`}>
                  {typeLabels[step.type]}
                </span>
                {step.status === "done" && (
                  <span className="text-xs text-brand-green font-inter font-medium bg-brand-green/10 rounded-full px-2 py-0.5">
                    ✔ Concluído
                  </span>
                )}
              </div>
              <h3 className="font-montserrat font-bold text-card-foreground text-base">{step.title}</h3>
              <p className="text-muted-foreground text-sm font-inter">{step.subtitle}</p>

              {step.status === "available" && (
                <button className="mt-3 px-5 py-2.5 bg-gradient-orange rounded-2xl text-primary-foreground text-sm font-montserrat font-bold shadow-lg shadow-secondary/30 active:scale-95 transition-all">
                  Iniciar →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
