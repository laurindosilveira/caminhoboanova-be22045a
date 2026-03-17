import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Users, Calendar, Bell, BarChart3, Shield, MessageCircle,
  Trophy, Heart, ChevronDown, ChevronRight, Check, Star, Smartphone,
  Zap, TrendingUp, Clock, Globe, ArrowRight, Church, Sparkles
} from "lucide-react";
import heroPhone from "@/assets/landing-hero-phone.png";
import communityImg from "@/assets/landing-community.png";
import dashboardImg from "@/assets/landing-dashboard.png";

// ─── Fade-in animation helper ────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const FEATURES = [
  { icon: BookOpen, title: "Trilha de Discipulado", desc: "Cursos estruturados com lições, devocionais diários e acompanhamento espiritual progressivo.", color: "from-emerald-500 to-teal-600" },
  { icon: Calendar, title: "Agenda Integrada", desc: "Calendário de eventos, encontros e cultos com lembretes automáticos e controle de presença.", color: "from-blue-500 to-indigo-600" },
  { icon: MessageCircle, title: "Comunidade Digital", desc: "Chat, enquetes, pedidos de oração, testemunhos e duplas de oração semanais.", color: "from-violet-500 to-purple-600" },
  { icon: Trophy, title: "Gamificação", desc: "Pontos de fé, ranking, conquistas e desafios que incentivam o engajamento diário.", color: "from-amber-500 to-orange-600" },
  { icon: BarChart3, title: "Painel Administrativo", desc: "Dashboard completo com relatórios, métricas de engajamento e gestão de turmas.", color: "from-rose-500 to-pink-600" },
  { icon: Bell, title: "Notificações Push", desc: "Lembretes inteligentes segmentados por comunidade, área ou turma.", color: "from-cyan-500 to-blue-600" },
  { icon: Heart, title: "Cuidado Pastoral", desc: "Termômetro espiritual, autoavaliações mensais e planos de crescimento individuais.", color: "from-red-500 to-rose-600" },
  { icon: Shield, title: "Segurança & Privacidade", desc: "Dados protegidos, acesso por papéis (admin, líder, membro) e controle total.", color: "from-slate-500 to-gray-700" },
];

const STATS = [
  { value: "+70%", label: "Engajamento diário", icon: TrendingUp },
  { value: "100%", label: "Visibilidade pastoral", icon: Users },
  { value: "-80%", label: "Tempo de gestão", icon: Clock },
  { value: "24/7", label: "Acesso multiplataforma", icon: Globe },
];


const PLANS = [
  {
    name: "Essencial",
    price: "R$ 97",
    period: "/mês",
    desc: "Ideal para comunidades pequenas",
    members: "Até 50 membros",
    features: ["Devocionais diários", "Agenda de eventos", "Chat comunitário", "Controle de presença", "1 administrador", "Suporte por e-mail"],
    highlight: false,
  },
  {
    name: "Comunidade",
    price: "R$ 197",
    period: "/mês",
    desc: "Para igrejas em crescimento",
    members: "Até 200 membros",
    features: ["Tudo do Essencial", "Gamificação completa", "Desafios comunitários", "Relatórios em PDF", "Até 5 líderes", "Suporte prioritário"],
    highlight: true,
  },
  {
    name: "Pastoral",
    price: "R$ 347",
    period: "/mês",
    desc: "Para igrejas grandes ou redes",
    members: "Membros ilimitados",
    features: ["Tudo do Comunidade", "Multi-comunidades", "Termômetro espiritual", "Planos de crescimento", "Líderes ilimitados", "Onboarding dedicado"],
    highlight: false,
  },
];

const FAQ = [
  { q: "Preciso instalar pela loja de aplicativos?", a: "Não! O app funciona como PWA (Progressive Web App) — basta acessar pelo navegador e adicionar à tela inicial. Funciona em qualquer celular, tablet ou computador." },
  { q: "Como funciona a migração dos dados?", a: "Nossa equipe cuida de toda a configuração inicial, importação de membros e personalização da plataforma para sua igreja." },
  { q: "É possível personalizar com a identidade visual da minha igreja?", a: "Sim! Cores, logo e nome da igreja são totalmente personalizáveis em cada plano." },
  { q: "Os dados dos membros estão seguros?", a: "Absolutamente. Utilizamos infraestrutura de nível enterprise com criptografia e controle de acesso por papéis." },
  { q: "Posso testar antes de contratar?", a: "Sim! Oferecemos 30 dias de teste gratuito sem compromisso para sua comunidade experimentar." },
];

export default function Apresentacao() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // landing page v2

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* ─── NAVBAR ─────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Church className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Caminho</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#funcionalidades" className="hover:text-emerald-600 transition-colors">Funcionalidades</a>
            <a href="#beneficios" className="hover:text-emerald-600 transition-colors">Benefícios</a>
            
            <a href="#planos" className="hover:text-emerald-600 transition-colors">Planos</a>
          </div>
          <a href="#planos" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
            Começar agora
          </a>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-teal-100/30 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" className="space-y-8">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                <Sparkles className="w-4 h-4" /> Plataforma #1 para igrejas digitais
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Transforme o{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  discipulado
                </span>{" "}
                da sua igreja
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="text-lg sm:text-xl text-gray-600 max-w-lg leading-relaxed">
                A plataforma completa para engajar membros, acompanhar o crescimento espiritual e simplificar a gestão pastoral — tudo em um só lugar.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4">
                <a href="#planos" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all">
                  Teste grátis por 30 dias <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#funcionalidades" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-lg hover:border-emerald-300 hover:text-emerald-700 transition-all">
                  Ver funcionalidades
                </a>
              </motion.div>
              <motion.div variants={fadeUp} custom={4} className="flex items-center gap-6 pt-2">
                <div className="flex -space-x-3">
                  {["🧑‍💼", "👩‍🏫", "👨‍💻", "👩‍💻"].map((e, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-white flex items-center justify-center text-lg">{e}</div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 text-amber-400 text-sm">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">+200 igrejas já utilizam</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-[3rem] blur-2xl scale-110" />
                <img src={heroPhone} alt="App Caminho em smartphone" className="relative w-[320px] sm:w-[380px] drop-shadow-2xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS ──────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="text-center text-white">
                <s.icon className="w-8 h-8 mx-auto mb-3 opacity-80" />
                <p className="text-3xl sm:text-4xl font-black">{s.value}</p>
                <p className="text-emerald-100 text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────── */}
      <section id="funcionalidades" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-3">Funcionalidades</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Tudo que sua igreja precisa em um só app</h2>
            <p className="text-gray-500 text-lg">Ferramentas poderosas para discipulado, comunidade e gestão pastoral.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="group p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:shadow-gray-100/50 hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ───────────────────────────────────── */}
      <section id="beneficios" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.p variants={fadeUp} custom={0} className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-3">Benefícios</motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-black tracking-tight mb-6">
                Por que escolher o <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">Caminho</span>?
              </motion.h2>
              <div className="space-y-5">
                {[
                  { title: "Engajamento diário real", desc: "Devocionais + gamificação mantêm membros conectados à fé todos os dias, não apenas aos domingos." },
                  { title: "Visibilidade pastoral completa", desc: "Veja o progresso espiritual de cada membro em tempo real. Identifique quem precisa de atenção." },
                  { title: "Comunicação centralizada", desc: "Chat, avisos e enquetes em um só lugar. Substitua os grupos dispersos de WhatsApp." },
                  { title: "Formação estruturada", desc: "Currículo didático com 28+ lições garante crescimento consistente e mensurável." },
                  { title: "Multi-comunidade", desc: "Gerencie múltiplas comunidades e áreas com controle independente de uma só plataforma." },
                ].map((b, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i + 2} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">{b.title}</h4>
                      <p className="text-gray-500 text-sm mt-1">{b.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <img src={communityImg} alt="Comunidade conectada" className="w-full max-w-md mx-auto" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── DASHBOARD SHOWCASE ─────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-3">Painel de controle</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Gestão inteligente na palma da mão</h2>
            <p className="text-gray-500 text-lg">Dashboard completo com métricas de engajamento, relatórios pastorais e gestão de turmas.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-100">
              <img src={dashboardImg} alt="Dashboard administrativo" className="w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────── */}
      <section id="planos" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-3">Planos</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">Escolha o plano ideal para sua igreja</h2>
            <p className="text-gray-500 text-lg">Todos os planos incluem 30 dias de teste gratuito. Sem fidelidade.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((p, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className={`relative rounded-3xl p-8 transition-all ${
                  p.highlight
                    ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-2xl shadow-emerald-500/30 scale-105 border-0"
                    : "bg-white border-2 border-gray-100 hover:border-emerald-200 hover:shadow-xl"
                }`}>
                {p.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-bold uppercase tracking-wide">
                    Mais popular
                  </div>
                )}
                <p className={`font-bold text-lg ${p.highlight ? "text-emerald-100" : "text-gray-400"}`}>{p.name}</p>
                <div className="flex items-baseline gap-1 mt-3 mb-1">
                  <span className="text-4xl font-black">{p.price}</span>
                  <span className={`text-sm ${p.highlight ? "text-emerald-200" : "text-gray-400"}`}>{p.period}</span>
                </div>
                <p className={`text-sm mb-2 ${p.highlight ? "text-emerald-200" : "text-gray-500"}`}>{p.desc}</p>
                <p className={`text-xs font-semibold mb-6 ${p.highlight ? "text-emerald-100" : "text-emerald-600"}`}>{p.members}</p>

                <ul className="space-y-3 mb-8">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2.5 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${p.highlight ? "text-emerald-300" : "text-emerald-500"}`} />
                      <span className={p.highlight ? "text-emerald-50" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  p.highlight
                    ? "bg-white text-emerald-700 hover:bg-emerald-50 hover:shadow-lg"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/25"
                }`}>
                  Começar teste grátis
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-3">Dúvidas frequentes</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Perguntas & Respostas</h2>
          </motion.div>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-sm pr-4">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ──────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-6">
              Pronto para transformar o discipulado da sua igreja?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto">
              Junte-se a mais de 200 igrejas que já utilizam o Caminho para engajar, discipular e cuidar de seus membros.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#planos" className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-white text-emerald-700 font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all">
                Comece grátis agora <ArrowRight className="w-5 h-5" />
              </a>
              <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-all">
                Falar com um consultor
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────── */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Church className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">Caminho</span>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} Caminho — Plataforma de discipulado digital para igrejas.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
