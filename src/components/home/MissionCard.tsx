import { useState, useEffect } from "react";
import { Zap, Star, Clock } from "lucide-react";

export default function MissionCard() {
  const [missionStarted, setMissionStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // Calculate time remaining until midnight
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}min restantes`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="px-5 -mt-1 pt-5">
      <div className="rounded-3xl shadow-xl border border-border overflow-hidden bg-card">
        {/* Header stripe */}
        <div className="bg-gradient-orange px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
            <span className="font-montserrat font-bold text-primary-foreground text-sm tracking-wide">MISSÃO DE HOJE</span>
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
            <Clock className="w-3 h-3 text-primary-foreground" />
            <span className="text-primary-foreground text-xs font-inter">{timeLeft}</span>
          </div>
        </div>

        <div className="p-5">
          {/* Content */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-orange flex items-center justify-center text-3xl flex-shrink-0 shadow-lg shadow-secondary/30">
              📖
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground text-xs font-inter mb-1 uppercase tracking-wide">Devocional</p>
              <h2 className="font-montserrat font-black text-card-foreground text-xl leading-tight">
                "O Senhor é meu pastor"
              </h2>
              <p className="text-muted-foreground text-sm font-inter mt-1">Salmo 23 — 5 minutos</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-muted-foreground text-xs font-inter">Progresso da missão</span>
              <span className="text-xs font-montserrat font-bold text-secondary">{missionStarted ? "Em andamento" : "Não iniciado"}</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-orange rounded-full transition-all duration-700"
                style={{ width: missionStarted ? "35%" : "0%" }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-accent fill-accent" />
              </div>
              <span className="text-accent font-montserrat font-black text-base">+15 pts</span>
            </div>
            <button
              onClick={() => setMissionStarted(true)}
              className={`px-7 py-3.5 rounded-2xl font-montserrat font-black text-sm text-primary-foreground transition-all active:scale-95 ${
                missionStarted
                  ? "bg-brand-green shadow-lg shadow-brand-green/30"
                  : "bg-gradient-orange shadow-xl shadow-secondary/40 animate-pulse-glow"
              }`}
            >
              {missionStarted ? "✅ Iniciado!" : "COMEÇAR AGORA →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
