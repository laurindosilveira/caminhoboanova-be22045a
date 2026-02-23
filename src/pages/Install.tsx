import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, Download, Share, Plus, MoreVertical, ChevronRight, CheckCircle2, ArrowLeft } from "lucide-react";

const ANDROID_STEPS = [
  {
    icon: "🌐",
    title: "Abra no Chrome",
    desc: "Acesse o app pelo navegador Google Chrome no seu celular.",
  },
  {
    icon: "⋮",
    title: "Toque no menu (⋮)",
    desc: "No canto superior direito, toque nos três pontinhos.",
  },
  {
    icon: "📲",
    title: 'Selecione "Instalar app"',
    desc: 'Ou "Adicionar à tela inicial". Confirme a instalação.',
  },
  {
    icon: "✅",
    title: "Pronto!",
    desc: "O app aparecerá na sua tela inicial como um app normal.",
  },
];

const IOS_STEPS = [
  {
    icon: "🧭",
    title: "Abra no Safari",
    desc: "Acesse o app pelo navegador Safari (obrigatório no iPhone).",
  },
  {
    icon: "📤",
    title: "Toque em Compartilhar",
    desc: "Na barra inferior, toque no ícone de compartilhar (quadrado com seta para cima).",
  },
  {
    icon: "➕",
    title: '"Adicionar à Tela de Início"',
    desc: "Role as opções e selecione esta opção.",
  },
  {
    icon: "✏️",
    title: "Confirme o nome",
    desc: 'Toque em "Adicionar" no canto superior direito.',
  },
  {
    icon: "✅",
    title: "Pronto!",
    desc: "O app aparecerá na sua tela inicial como um app real.",
  },
];

export default function Install() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<"android" | "ios" | null>(null);

  const steps = platform === "android" ? ANDROID_STEPS : IOS_STEPS;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 pt-8 pb-6" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-primary-foreground/70 font-inter text-xs mb-4 hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-montserrat font-black text-primary-foreground text-xl">Instalar o App</h1>
              <p className="text-primary-foreground/60 font-inter text-xs">
                Tenha o Caminho sempre à mão no seu celular
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Benefits */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="font-montserrat font-bold text-foreground text-sm mb-3">✨ Por que instalar?</p>
          <div className="space-y-2">
            {[
              { icon: "⚡", text: "Abre rápido, direto da tela inicial" },
              { icon: "🔔", text: "Receba notificações e lembretes" },
              { icon: "📴", text: "Funciona mesmo offline" },
              { icon: "🔄", text: "Atualiza automaticamente" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/30">
                <span className="text-lg">{b.icon}</span>
                <p className="font-inter text-sm text-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform selector */}
        {!platform ? (
          <div className="space-y-3">
            <p className="font-montserrat font-bold text-foreground text-sm text-center">
              Qual é o seu celular?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPlatform("android")}
                className="flex flex-col items-center gap-3 p-5 bg-card rounded-2xl border-2 border-border hover:border-brand-green/50 hover:bg-brand-green/5 transition-all"
              >
                <span className="text-4xl">🤖</span>
                <div className="text-center">
                  <p className="font-montserrat font-bold text-foreground text-sm">Android</p>
                  <p className="text-muted-foreground font-inter text-[10px] mt-0.5">Samsung, Motorola, Xiaomi...</p>
                </div>
              </button>
              <button
                onClick={() => setPlatform("ios")}
                className="flex flex-col items-center gap-3 p-5 bg-card rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <span className="text-4xl">🍎</span>
                <div className="text-center">
                  <p className="font-montserrat font-bold text-foreground text-sm">iPhone</p>
                  <p className="text-muted-foreground font-inter text-[10px] mt-0.5">iOS 16.4 ou superior</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Back to platform selection */}
            <button
              onClick={() => setPlatform(null)}
              className="flex items-center gap-1.5 text-primary font-inter text-xs hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Trocar plataforma
            </button>

            {/* Steps */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="font-montserrat font-bold text-foreground text-sm mb-4">
                {platform === "android" ? "🤖 Passos para Android" : "🍎 Passos para iPhone"}
              </p>
              <div className="space-y-1">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-3 pb-4 last:pb-0">
                    {/* Step number + line */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg leading-none">{step.icon}</span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border mt-1" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pt-1 pb-2">
                      <p className="font-montserrat font-bold text-foreground text-sm">{step.title}</p>
                      <p className="font-inter text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important note for iOS */}
            {platform === "ios" && (
              <div className="bg-accent/20 border border-accent/30 rounded-2xl p-4">
                <p className="font-inter text-xs text-foreground">
                  <strong>⚠️ Importante:</strong> No iPhone, as notificações push só funcionam a partir do <strong>iOS 16.4</strong> e somente quando o app é instalado na tela inicial via Safari.
                </p>
              </div>
            )}
          </>
        )}

        {/* Help */}
        <div className="text-center py-4">
          <p className="text-muted-foreground font-inter text-xs">
            Precisa de ajuda? Fale com seu líder ou pastor. 🙏
          </p>
        </div>
      </main>
    </div>
  );
}
