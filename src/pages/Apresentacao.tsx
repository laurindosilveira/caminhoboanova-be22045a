import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_PLANS } from "@/lib/stripePlans";
import { toast } from "@/hooks/use-toast";
import {
  BookOpen, Users, Calendar, Bell, BarChart3, Shield, MessageCircle,
  Trophy, Heart, ChevronDown, Check, Star, Smartphone,
  TrendingUp, Clock, Globe, ArrowRight, Church, Sparkles
} from "lucide-react";
import heroPhone from "@/assets/landing-hero-phone.png";
import communityImg from "@/assets/landing-community.png";
import dashboardImg from "@/assets/landing-dashboard.png";

// ─── SEO: JSON-LD structured data ────────────────────────
function JsonLdScript() {
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Caminho — Plataforma de Discipulado Digital",
      applicationCategory: "ReligiousApp",
      operatingSystem: "Web",
      description:
        "Plataforma completa para engajar membros, acompanhar crescimento espiritual e simplificar a gestão pastoral da sua igreja.",
      url: "https://caminhoboanova.lovable.app/apresentacao",
      offers: [
        {
          "@type": "Offer",
          name: "Comunidade",
          price: "79.00",
          priceCurrency: "BRL",
          description: "Ideal para igrejas menores ou grupos iniciantes — até 100 membros",
        },
        {
          "@type": "Offer",
          name: "Crescimento",
          price: "129.00",
          priceCurrency: "BRL",
          description: "Para igrejas em desenvolvimento — até 250 membros",
        },
        {
          "@type": "Offer",
          name: "Pastoral",
          price: "199.00",
          priceCurrency: "BRL",
          description: "Para igrejas maiores ou com múltiplas comunidades — membros ilimitados",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: "200",
      },
    };

    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    };

    const orgJsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Caminho",
      url: "https://caminhoboanova.lovable.app",
      logo: "https://caminhoboanova.lovable.app/pwa-512x512.png",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        url: WHATSAPP_LINK,
        availableLanguage: "pt-BR",
      },
    };

    const scripts = [jsonLd, faqJsonLd, orgJsonLd].map((data) => {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.textContent = JSON.stringify(data);
      document.head.appendChild(el);
      return el;
    });

    // SEO meta tags
    document.title = "Caminho — Plataforma de Discipulado Digital para Igrejas";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Transforme o discipulado da sua igreja com devocionais, gamificação, gestão pastoral e comunidade digital. Teste grátis por 30 dias."
    );

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", "https://caminhoboanova.lovable.app/apresentacao");

    return () => {
      scripts.forEach((s) => s.remove());
    };
  }, []);

  return null;
}

// ─── Fade-in animation helper ────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const WHATSAPP_LINK = "https://wa.me/5551999999999?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20Caminho.";

const FEATURES = [
  { icon: BookOpen, title: "Trilha de Discipulado", desc: "Cursos estruturados com lições, devocionais diários e acompanhamento espiritual progressivo.", color: "bg-gradient-to-br from-[hsl(var(--brand-green))] to-[hsl(160,60%,35%)]" },
  { icon: Calendar, title: "Agenda Integrada", desc: "Calendário de eventos, encontros e cultos com lembretes automáticos e controle de presença.", color: "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(250,55%,45%)]" },
  { icon: MessageCircle, title: "Comunidade Digital", desc: "Chat, enquetes, pedidos de oração, testemunhos e duplas de oração semanais.", color: "bg-gradient-to-br from-[hsl(270,60%,55%)] to-[hsl(280,55%,45%)]" },
  { icon: Trophy, title: "Gamificação", desc: "Pontos de fé, ranking, conquistas e desafios que incentivam o engajamento diário.", color: "bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--accent))]" },
  { icon: BarChart3, title: "Painel Administrativo", desc: "Dashboard completo com relatórios, métricas de engajamento e gestão de turmas.", color: "bg-gradient-to-br from-[hsl(350,70%,55%)] to-[hsl(340,60%,50%)]" },
  { icon: Bell, title: "Notificações Push", desc: "Lembretes inteligentes segmentados por comunidade, área ou turma.", color: "bg-gradient-to-br from-[hsl(190,70%,50%)] to-[hsl(var(--primary))]" },
  { icon: Heart, title: "Cuidado Pastoral", desc: "Termômetro espiritual, autoavaliações mensais e planos de crescimento individuais.", color: "bg-gradient-to-br from-[hsl(0,70%,55%)] to-[hsl(350,65%,50%)]" },
  { icon: Shield, title: "Segurança & Privacidade", desc: "Dados protegidos, acesso por papéis (admin, líder, membro) e controle total.", color: "bg-gradient-to-br from-[hsl(var(--muted-foreground))] to-[hsl(var(--brand-gray))]" },
];

const STATS = [
  { value: "+70%", label: "Engajamento diário", icon: TrendingUp },
  { value: "100%", label: "Visibilidade pastoral", icon: Users },
  { value: "-80%", label: "Tempo de gestão", icon: Clock },
  { value: "24/7", label: "Acesso multiplataforma", icon: Globe },
];

const PLANS = [
  {
    name: "Comunidade",
    emoji: "🟢",
    price: "R$ 79",
    period: "/mês",
    desc: "Ideal para igrejas menores ou grupos iniciantes",
    members: "Até 100 membros",
    features: ["Trilhas de discipulado", "Devocionais diários", "Agenda da igreja", "Chat comunitário", "Pedidos de oração", "Controle de presença"],
    highlight: false,
    priceId: STRIPE_PLANS.comunidade.price_id,
  },
  {
    name: "Crescimento",
    emoji: "🔵",
    price: "R$ 129",
    period: "/mês",
    desc: "Para igrejas em desenvolvimento e com múltiplos grupos",
    members: "Até 250 membros",
    features: ["Tudo do plano Comunidade", "Gamificação (pontos, conquistas, desafios)", "Relatórios de engajamento", "Gestão de turmas e grupos", "Notificações segmentadas"],
    highlight: true,
    priceId: STRIPE_PLANS.crescimento.price_id,
  },
  {
    name: "Pastoral",
    emoji: "🟣",
    price: "R$ 199",
    period: "/mês",
    desc: "Para igrejas maiores ou com múltiplas comunidades",
    members: "Membros ilimitados",
    features: ["Tudo do plano Crescimento", "Termômetro espiritual", "Plano de crescimento individual", "Multi-comunidades / multi-áreas", "Relatórios pastorais completos", "Suporte prioritário"],
    highlight: false,
    priceId: STRIPE_PLANS.pastoral.price_id,
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
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Show toast on checkout return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast({ title: "🎉 Assinatura realizada!", description: "Bem-vindo ao Caminho Boa Nova! Você receberá um email de confirmação." });
      window.history.replaceState({}, "", "/apresentacao");
    } else if (params.get("checkout") === "cancel") {
      toast({ title: "Checkout cancelado", description: "Você pode assinar a qualquer momento." });
      window.history.replaceState({}, "", "/apresentacao");
    }
  }, []);

  const handleCheckout = useCallback(async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Erro", description: "Não foi possível iniciar o checkout. Tente novamente.", variant: "destructive" });
    } finally {
      setCheckoutLoading(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* JSON-LD structured data for SEO */}
      <JsonLdScript />

      {/* ─── NAVBAR ─────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
              <Church className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-montserrat font-bold text-lg tracking-tight text-foreground">Caminho</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-inter font-medium text-muted-foreground">
            <a href="#funcionalidades" className="hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#beneficios" className="hover:text-primary transition-colors">Benefícios</a>
            <a href="#planos" className="hover:text-primary transition-colors">Planos</a>
          </div>
          <a href="#planos" className="px-5 py-2.5 rounded-full text-primary-foreground text-sm font-semibold hover:shadow-lg transition-all" style={{ background: "var(--gradient-hero)" }}>
            Começar agora
          </a>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" className="space-y-8">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-inter font-medium">
                <Sparkles className="w-4 h-4" /> Plataforma #1 para igrejas digitais
              </motion.div>
              <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-montserrat font-black tracking-tight leading-[1.1] text-foreground">
                Transforme o{" "}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>
                  discipulado
                </span>{" "}
                da sua igreja
              </motion.h1>
              <motion.p variants={fadeUp} custom={2} className="text-lg sm:text-xl text-muted-foreground font-inter max-w-lg leading-relaxed">
                A plataforma completa para engajar membros, acompanhar o crescimento espiritual e simplificar a gestão pastoral — tudo em um só lugar.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4">
                <a href="#planos" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-primary-foreground font-montserrat font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ background: "var(--gradient-hero)" }}>
                  Teste grátis por 30 dias <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#funcionalidades" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-border text-foreground font-semibold text-lg hover:border-primary/40 hover:text-primary transition-all">
                  Ver funcionalidades
                </a>
              </motion.div>
              <motion.div variants={fadeUp} custom={4} className="flex items-center gap-6 pt-2">
                <div className="flex gap-0.5 text-accent text-sm" aria-label="5 estrelas">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-2xl scale-110" />
                <img
                  src={heroPhone}
                  alt="App Caminho em smartphone mostrando trilha de discipulado"
                  loading="eager"
                  className="relative w-[320px] sm:w-[380px] drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS ──────────────────────────────────────── */}
      <section className="py-16" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="text-center text-primary-foreground">
                <s.icon className="w-8 h-8 mx-auto mb-3 opacity-80" />
                <p className="text-3xl sm:text-4xl font-montserrat font-black">{s.value}</p>
                <p className="text-primary-foreground/60 text-sm font-inter mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────── */}
      <section id="funcionalidades" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-primary font-inter font-semibold text-sm uppercase tracking-wider mb-3">Funcionalidades</p>
            <h2 className="text-3xl sm:text-4xl font-montserrat font-black tracking-tight mb-4 text-foreground">Tudo que sua igreja precisa em um só app</h2>
            <p className="text-muted-foreground text-lg font-inter">Ferramentas poderosas para discipulado, comunidade e gestão pastoral.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="group p-6 rounded-2xl border border-border bg-card hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-montserrat font-bold text-lg mb-2 text-foreground">{f.title}</h3>
                <p className="text-muted-foreground text-sm font-inter leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ───────────────────────────────────── */}
      <section id="beneficios" className="py-20 lg:py-28 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.p variants={fadeUp} custom={0} className="text-primary font-inter font-semibold text-sm uppercase tracking-wider mb-3">Benefícios</motion.p>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-montserrat font-black tracking-tight mb-6 text-foreground">
                Por que escolher o <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>Caminho</span>?
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
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-montserrat font-bold text-base text-foreground">{b.title}</h4>
                      <p className="text-muted-foreground text-sm font-inter mt-1">{b.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <img
                src={communityImg}
                alt="Comunidade conectada através do app Caminho"
                loading="lazy"
                className="w-full max-w-md mx-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── DASHBOARD SHOWCASE ─────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-primary font-inter font-semibold text-sm uppercase tracking-wider mb-3">Painel de controle</p>
            <h2 className="text-3xl sm:text-4xl font-montserrat font-black tracking-tight mb-4 text-foreground">Gestão inteligente na palma da mão</h2>
            <p className="text-muted-foreground text-lg font-inter">Dashboard completo com métricas de engajamento, relatórios pastorais e gestão de turmas.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border">
              <img
                src={dashboardImg}
                alt="Dashboard administrativo do Caminho com métricas de engajamento"
                loading="lazy"
                className="w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─────────────────────────────── */}
      <section id="como-funciona" className="py-20 lg:py-28 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-primary font-inter font-semibold text-sm uppercase tracking-wider mb-3">Como funciona</p>
            <h2 className="text-3xl sm:text-4xl font-montserrat font-black tracking-tight text-foreground">Comece em 4 passos simples</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Cadastre sua igreja", desc: "Crie sua conta e configure as comunidades, áreas e turmas da sua igreja.", icon: Church },
              { step: 2, title: "Convide os membros", desc: "Compartilhe o link de cadastro com líderes e jovens da sua comunidade.", icon: Users },
              { step: 3, title: "Configure o conteúdo", desc: "Adicione cursos, lições, devocionais e eventos no painel administrativo.", icon: BookOpen },
              { step: 4, title: "Acompanhe o crescimento", desc: "Monitore o engajamento, presença e saúde espiritual em tempo real.", icon: TrendingUp },
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="relative bg-card rounded-2xl p-8 shadow-lg shadow-primary/5 border border-border text-center">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full text-primary-foreground font-bold text-sm flex items-center justify-center shadow-md" style={{ background: "var(--gradient-hero)" }}>
                  {item.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 mt-2">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-montserrat font-bold text-lg mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm font-inter leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────── */}
      <section id="planos" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-primary font-inter font-semibold text-sm uppercase tracking-wider mb-3">💰 Planos e Investimento</p>
            <h2 className="text-3xl sm:text-4xl font-montserrat font-black tracking-tight mb-4 text-foreground">Simples, acessível e pensado para a realidade das igrejas</h2>
            <p className="text-muted-foreground text-lg font-inter">O Caminho Boa Nova foi desenvolvido para servir igrejas de diferentes tamanhos, com um modelo de investimento justo e sustentável.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((p, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className={`relative rounded-3xl p-8 transition-all ${
                  p.highlight
                    ? "text-primary-foreground shadow-2xl shadow-primary/30 scale-105 border-0"
                    : "bg-card border-2 border-border hover:border-primary/30 hover:shadow-xl"
                }`}
                style={p.highlight ? { background: "var(--gradient-hero)" } : undefined}
              >
                {p.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wide">
                    Mais popular
                  </div>
                )}
                <p className={`font-montserrat font-bold text-lg ${p.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{p.emoji} {p.name}</p>
                <div className="flex items-baseline gap-1 mt-3 mb-1">
                  <span className={`text-4xl font-montserrat font-black ${p.highlight ? "text-primary-foreground" : "text-foreground"}`}>{p.price}</span>
                  <span className={`text-sm font-inter ${p.highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{p.period}</span>
                </div>
                <p className={`text-sm font-inter mb-2 ${p.highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{p.desc}</p>
                <p className={`text-xs font-inter font-semibold mb-6 ${p.highlight ? "text-primary-foreground/80" : "text-primary"}`}>{p.members}</p>

                <ul className="space-y-3 mb-8">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2.5 text-sm font-inter">
                      <Check className={`w-4 h-4 flex-shrink-0 ${p.highlight ? "text-primary-foreground/70" : "text-primary"}`} />
                      <span className={p.highlight ? "text-primary-foreground/90" : "text-muted-foreground"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full block py-3.5 rounded-2xl font-montserrat font-bold text-sm text-center transition-all ${
                    p.highlight
                      ? "bg-card text-primary hover:bg-card/90 hover:shadow-lg"
                      : "text-primary-foreground hover:shadow-lg hover:shadow-primary/25"
                  }`}
                  style={!p.highlight ? { background: "var(--gradient-hero)" } : undefined}
                >
                  Começar teste grátis
                </a>
              </motion.div>
            ))}
          </div>

          {/* ─── BONUS + TRIAL + VALUE ───────────────────── */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
            {/* Bônus */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="bg-card rounded-2xl border border-border p-8">
              <p className="text-2xl mb-2">🎁</p>
              <h3 className="font-montserrat font-bold text-lg text-foreground mb-3">Bônus para novas comunidades</h3>
              <ul className="space-y-2.5">
                {["Implantação assistida gratuita", "Apoio na organização da primeira turma", "Treinamento de líderes", "Acompanhamento inicial próximo"].map((b, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm font-inter text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Teste */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              className="bg-card rounded-2xl border border-border p-8">
              <p className="text-2xl mb-2">🧪</p>
              <h3 className="font-montserrat font-bold text-lg text-foreground mb-3">Teste sem compromisso</h3>
              <p className="text-sm text-muted-foreground font-inter mb-4">Experimente o Caminho Boa Nova com sua comunidade:</p>
              <ul className="space-y-2.5">
                {["30 dias gratuitos", "Sem taxa de adesão", "Cancelamento simples a qualquer momento"].map((b, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm font-inter text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Valor */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
              className="bg-card rounded-2xl border border-border p-8">
              <p className="text-2xl mb-2">💡</p>
              <h3 className="font-montserrat font-bold text-lg text-foreground mb-3">Um investimento acessível</h3>
              <p className="text-sm text-muted-foreground font-inter mb-2">Na prática, o valor representa:</p>
              <p className="text-primary font-montserrat font-bold text-lg mb-4">👉 menos de R$1 por membro/mês</p>
              <p className="text-sm text-muted-foreground font-inter mb-2">Um investimento pequeno para fortalecer:</p>
              <ul className="space-y-2.5">
                {["O discipulado", "O cuidado pastoral", "A vida espiritual da igreja"].map((b, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm font-inter text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-muted/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <p className="text-primary font-inter font-semibold text-sm uppercase tracking-wider mb-3">Dúvidas frequentes</p>
            <h2 className="text-3xl sm:text-4xl font-montserrat font-black tracking-tight text-foreground">Perguntas & Respostas</h2>
          </motion.div>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="bg-card rounded-2xl border border-border overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors">
                  <span className="font-inter font-semibold text-sm text-foreground pr-4">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-muted-foreground text-sm font-inter leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHATSAPP CONTACT SECTION ───────────────────── */}
      <section className="py-16 bg-[hsl(var(--brand-green))]/10 border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp} custom={0} className="w-16 h-16 rounded-2xl bg-[hsl(var(--brand-green))]/15 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-[hsl(var(--brand-green))]" />
            </motion.div>
            <motion.h3 variants={fadeUp} custom={1} className="text-2xl font-montserrat font-black text-foreground mb-2">
              Tem dúvidas? Fale conosco!
            </motion.h3>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground font-inter mb-6">
              Tire suas dúvidas sobre a plataforma diretamente pelo WhatsApp. Resposta em até 24h!
            </motion.p>
            <motion.a
              variants={fadeUp}
              custom={3}
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[hsl(var(--brand-green))] text-white font-montserrat font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Smartphone className="w-5 h-5" />
              Conversar no WhatsApp
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA FINAL ──────────────────────────────────── */}
      <section className="py-20 lg:py-28 relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary-foreground/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl lg:text-5xl font-montserrat font-black text-primary-foreground tracking-tight mb-6">
              🚀 Comece com sua comunidade
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-primary-foreground/60 font-inter text-lg mb-10 max-w-xl mx-auto">
              Agende uma demonstração ou inicie um período de teste e veja, na prática, como o Caminho Boa Nova pode ajudar sua igreja a crescer em fé, comunhão e cuidado.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#planos" className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-card text-primary font-montserrat font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all">
                Comece grátis agora <ArrowRight className="w-5 h-5" />
              </a>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl border-2 border-primary-foreground/30 text-primary-foreground font-inter font-semibold text-lg hover:bg-primary-foreground/10 transition-all">
                Falar com um consultor
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────── */}
      <footer className="py-12 bg-foreground text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
                <Church className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-background font-montserrat font-bold">Caminho</span>
            </div>
            <p className="text-sm font-inter">© {new Date().getFullYear()} Caminho — Plataforma de discipulado digital para igrejas.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
