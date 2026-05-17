import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_PLANS } from "@/lib/stripePlans";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Church, User, Users, ClipboardList, ArrowRight, ArrowLeft,
  CheckCircle2, Sparkles, Star, Phone, Mail, MapPin, Hash,
  Target, Heart, Zap, CreditCard
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────
interface ChurchInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface PastorInfo {
  fullName: string;
  role: string;
  phone: string;
  email: string;
}

interface CommunityInfo {
  memberCount: string;
  averageAge: string;
  activities: string;
}

interface QuestionnaireInfo {
  objectives: string;
  needs: string;
  preferences: string;
}

type StepKey = "church" | "pastor" | "community" | "questionnaire" | "plans";

const STEPS: { key: StepKey; label: string; icon: typeof Church }[] = [
  { key: "church", label: "Igreja", icon: Church },
  { key: "pastor", label: "Pastor", icon: User },
  { key: "community", label: "Comunidade", icon: Users },
  { key: "questionnaire", label: "Questionário", icon: ClipboardList },
  { key: "plans", label: "Escolher Plano", icon: CreditCard },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

function recommendPlan(community: CommunityInfo, questionnaire: QuestionnaireInfo): "comunidade" | "crescimento" | "pastoral" {
  const members = parseInt(community.memberCount) || 0;
  const needsKeywords = (questionnaire.needs + " " + questionnaire.objectives + " " + questionnaire.preferences).toLowerCase();

  const hasPastoralNeeds = ["pastoral", "acompanhamento", "individual", "múltiplas", "multiplas", "multi", "ilimitado", "termômetro", "crescimento individual"].some(k => needsKeywords.includes(k));
  const hasGrowthNeeds = ["gamificação", "gamificacao", "ranking", "desafio", "turma", "relatório", "relatorio", "engajamento", "notificação", "notificacao"].some(k => needsKeywords.includes(k));

  if (members > 250 || hasPastoralNeeds) return "pastoral";
  if (members > 100 || hasGrowthNeeds) return "crescimento";
  return "comunidade";
}

const PLAN_DETAILS: Record<string, { emoji: string; color: string; members: string; features: string[] }> = {
  comunidade: {
    emoji: "🟢",
    color: "from-[hsl(var(--brand-green))] to-[hsl(160,60%,35%)]",
    members: "Até 100 membros",
    features: ["Trilhas de discipulado", "Devocionais diários", "Agenda da igreja", "Chat comunitário", "Pedidos de oração", "Controle de presença"],
  },
  crescimento: {
    emoji: "🔵",
    color: "from-[hsl(var(--primary))] to-[hsl(250,55%,45%)]",
    members: "Até 250 membros",
    features: ["Tudo do Comunidade", "Gamificação completa", "Relatórios de engajamento", "Gestão de turmas", "Notificações segmentadas"],
  },
  pastoral: {
    emoji: "🟣",
    color: "from-[hsl(270,60%,55%)] to-[hsl(280,55%,45%)]",
    members: "Membros ilimitados",
    features: ["Tudo do Crescimento", "Termômetro espiritual", "Plano de crescimento individual", "Multi-comunidades", "Relatórios pastorais", "Suporte prioritário"],
  },
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [pendingChurchId, setPendingChurchId] = useState<string | null>(localStorage.getItem("pending_onboarding_church_id"));
  const [onboardingStatus, setOnboardingStatus] = useState<'church' | 'payment' | 'completed' | null>(null);
  const [selectedPlanKey, setSelectedPlanKey] = useState<"comunidade" | "crescimento" | "pastoral" | null>(null);
  const [showPlanSummary, setShowPlanSummary] = useState(false);

  const [church, setChurch] = useState<ChurchInfo>({ name: "", address: "", phone: "", email: "" });
  const [pastor, setPastor] = useState<PastorInfo>({ fullName: "", role: "Pastor", phone: "", email: "" });
  const [community, setCommunity] = useState<CommunityInfo>({ memberCount: "", averageAge: "", activities: "" });
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireInfo>({ objectives: "", needs: "", preferences: "" });

  // Monitor status in real-time
  useEffect(() => {
    if (!pendingChurchId) return;

    const channel = supabase
      .channel('onboarding_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'church_subscriptions',
          filter: `id=eq.${pendingChurchId}`
        },
        (payload) => {
          const status = payload.new.subscription_status;
          if (status === 'active' || status === 'trial') {
            setOnboardingStatus('completed');
            toast({ title: "🎉 Tudo pronto!", description: "Sua igreja foi provisionada com sucesso." });
            setTimeout(() => {
              localStorage.removeItem("pending_onboarding_church_id");
              navigate("/login");
            }, 3000);
          } else if (status === 'pending_checkout') {
            setOnboardingStatus('payment');
          }
        }
      )
      .subscribe();

    // Initial check
    const checkInitial = async () => {
      const { data } = await supabase.from('church_subscriptions').select('subscription_status').eq('id', pendingChurchId).single();
      if (data?.subscription_status === 'active' || data?.subscription_status === 'trial') {
        setOnboardingStatus('completed');
      } else if (data?.subscription_status === 'pending_checkout') {
        setOnboardingStatus('payment');
      }
    };
    checkInitial();

    return () => { supabase.removeChannel(channel); };
  }, [pendingChurchId, navigate]);

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const canNext = (): boolean => {
    switch (currentStep.key) {
      case "church":
        return !!(church.name.trim() && church.email.trim());
      case "pastor":
        return !!(pastor.fullName.trim() && pastor.phone.trim());
      case "community":
        return !!(community.memberCount.trim());
      case "questionnaire":
        return !!(questionnaire.objectives.trim());
      default:
        return true;
    }
  };

  const goNext = () => {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const [searchParams] = useSearchParams();
  const preselectedPlan = searchParams.get("plano") as "comunidade" | "crescimento" | "pastoral" | null;
  const validPreselected = preselectedPlan && ["comunidade", "crescimento", "pastoral"].includes(preselectedPlan) ? preselectedPlan : null;

  const recommendedPlan = validPreselected || recommendPlan(community, questionnaire);
  const planInfo = STRIPE_PLANS[recommendedPlan];
  const planDetail = PLAN_DETAILS[recommendedPlan];

  const handleConfirmPlan = (planKey: "comunidade" | "crescimento" | "pastoral") => {
    setSelectedPlanKey(planKey);
    setShowPlanSummary(true);
  };

  const handleCheckout = useCallback(async () => {
    if (!selectedPlanKey) return;
    const selectedPlan = selectedPlanKey;
    const planInfo = STRIPE_PLANS[selectedPlan];
    const priceId = planInfo.price_id;
    setCheckoutLoading(true);
    try {
      // Save church data to database before checkout
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);

      const { data: subscriptionData, error: insertError } = await supabase.from("church_subscriptions").insert({
        church_name: church.name,
        church_address: church.address,
        church_phone: church.phone,
        church_email: church.email,
        pastor_name: pastor.fullName,
        pastor_role: pastor.role,
        pastor_phone: pastor.phone,
        pastor_email: pastor.email,
        member_count: community.memberCount,
        average_age: community.averageAge,
        activities: community.activities,
        objectives: questionnaire.objectives,
        needs: questionnaire.needs,
        preferences: questionnaire.preferences,
        recommended_plan: selectedPlan,
        subscription_status: "pending_checkout",
        trial_ends_at: trialEndsAt.toISOString(),
      }).select().single();

      if (subscriptionData) {
        localStorage.setItem("pending_onboarding_church_id", (subscriptionData as any).id);
        setPendingChurchId((subscriptionData as any).id);
        setOnboardingStatus('payment');
      }

      if (insertError) {
        console.error("Erro ao salvar dados da igreja:", insertError);
        throw insertError;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { 
          priceId,
          subscriptionId: (subscriptionData as any)?.id,
          email: pastor.email
        },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast({ title: "Erro", description: "Não foi possível iniciar o checkout. Tente novamente.", variant: "destructive" });
    } finally {
      setCheckoutLoading(false);
    }
  }, [church, pastor, community, questionnaire, selectedPlanKey]);

  // ─── Field helpers ─────────────────────────────────────
  const inputClass = "bg-card border-border focus:border-primary";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Onboarding Status Overlay */}
      <AnimatePresence>
        {onboardingStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <Card className="w-full max-w-sm border-2 border-primary shadow-2xl overflow-hidden">
              <div className="h-2 bg-primary animate-pulse" />
              <CardContent className="p-8 text-center space-y-6">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {onboardingStatus === 'church' && <Church className="w-8 h-8 text-primary" />}
                    {onboardingStatus === 'payment' && <CreditCard className="w-8 h-8 text-primary" />}
                    {onboardingStatus === 'completed' && <CheckCircle2 className="w-8 h-8 text-brand-green" />}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-montserrat font-black text-xl">
                    {onboardingStatus === 'church' && "Salvando Igreja..."}
                    {onboardingStatus === 'payment' && "Aguardando Pagamento..."}
                    {onboardingStatus === 'completed' && "Tudo Pronto!"}
                  </h3>
                  <p className="text-sm text-muted-foreground font-inter">
                    {onboardingStatus === 'church' && "Estamos registrando os dados da sua comunidade."}
                    {onboardingStatus === 'payment' && "Detectamos que você está no checkout do Stripe. Assim que concluir, liberaremos seu acesso."}
                    {onboardingStatus === 'completed' && "Sua igreja foi criada. Redirecionando para o login..."}
                  </p>
                </div>

                {onboardingStatus === 'payment' && (
                  <div className="pt-2">
                    <Button variant="outline" className="text-xs" onClick={() => {
                      localStorage.removeItem("pending_onboarding_church_id");
                      setPendingChurchId(null);
                      setOnboardingStatus(null);
                    }}>
                      Cancelar e voltar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
            <Church className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-montserrat font-bold text-lg text-foreground">Caminho</h1>
            <p className="text-xs text-muted-foreground font-inter">Cadastro da sua igreja</p>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto w-full px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? "bg-primary text-primary-foreground"
                : i === step ? "bg-primary/15 text-primary ring-2 ring-primary"
                : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className="hidden sm:inline text-xs font-inter font-medium text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Step content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep.key}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {currentStep.key === "church" && (
              <StepCard icon={Church} title="Informações da Igreja" subtitle="Conte-nos sobre sua comunidade">
                <FieldGroup label="Nome da igreja *" icon={Church}>
                  <Input className={inputClass} placeholder="Ex: Igreja Comunidade da Graça" value={church.name} onChange={e => setChurch({ ...church, name: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Endereço" icon={MapPin}>
                  <Input className={inputClass} placeholder="Rua, número, cidade - UF" value={church.address} onChange={e => setChurch({ ...church, address: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Telefone de contato" icon={Phone}>
                  <Input className={inputClass} type="tel" placeholder="(51) 99999-9999" value={church.phone} onChange={e => setChurch({ ...church, phone: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="E-mail de contato *" icon={Mail}>
                  <Input className={inputClass} type="email" placeholder="contato@suaigreja.com.br" value={church.email} onChange={e => setChurch({ ...church, email: e.target.value })} />
                </FieldGroup>
              </StepCard>
            )}

            {currentStep.key === "pastor" && (
              <StepCard icon={User} title="Dados do Pastor" subtitle="Responsável principal pela conta">
                <FieldGroup label="Nome completo *" icon={User}>
                  <Input className={inputClass} placeholder="Nome do pastor ou líder" value={pastor.fullName} onChange={e => setPastor({ ...pastor, fullName: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Cargo" icon={Star}>
                  <Input className={inputClass} placeholder="Ex: Pastor, Coordenador, Líder" value={pastor.role} onChange={e => setPastor({ ...pastor, role: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Telefone *" icon={Phone}>
                  <Input className={inputClass} type="tel" placeholder="(51) 99999-9999" value={pastor.phone} onChange={e => setPastor({ ...pastor, phone: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="E-mail" icon={Mail}>
                  <Input className={inputClass} type="email" placeholder="pastor@email.com" value={pastor.email} onChange={e => setPastor({ ...pastor, email: e.target.value })} />
                </FieldGroup>
              </StepCard>
            )}

            {currentStep.key === "community" && (
              <StepCard icon={Users} title="Informações da Comunidade" subtitle="Nos ajude a entender seu contexto">
                <FieldGroup label="Número de membros ativos *" icon={Hash}>
                  <Input className={inputClass} type="number" min="1" placeholder="Ex: 80" value={community.memberCount} onChange={e => setCommunity({ ...community, memberCount: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Idade média dos membros" icon={Users}>
                  <Input className={inputClass} placeholder="Ex: 25-35 anos" value={community.averageAge} onChange={e => setCommunity({ ...community, averageAge: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Atividades e ministérios oferecidos" icon={Heart}>
                  <Textarea className={inputClass} placeholder="Ex: Culto dominical, grupo de jovens, escola bíblica, louvor..." rows={3} value={community.activities} onChange={e => setCommunity({ ...community, activities: e.target.value })} />
                </FieldGroup>
              </StepCard>
            )}

            {currentStep.key === "questionnaire" && (
              <StepCard icon={ClipboardList} title="Questionário de Recomendação" subtitle="Para indicarmos o melhor plano">
                <FieldGroup label="Quais os principais objetivos da sua igreja? *" icon={Target}>
                  <Textarea className={inputClass} placeholder="Ex: Engajar jovens, organizar grupos de estudo, acompanhar crescimento espiritual..." rows={3} value={questionnaire.objectives} onChange={e => setQuestionnaire({ ...questionnaire, objectives: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Quais as necessidades específicas da comunidade?" icon={Heart}>
                  <Textarea className={inputClass} placeholder="Ex: Gamificação para jovens, relatórios para liderança, acompanhamento pastoral individual..." rows={3} value={questionnaire.needs} onChange={e => setQuestionnaire({ ...questionnaire, needs: e.target.value })} />
                </FieldGroup>
                <FieldGroup label="Quais funcionalidades são mais importantes para vocês?" icon={Zap}>
                  <Textarea className={inputClass} placeholder="Ex: Chat comunitário, devocionais diários, controle de presença, notificações push..." rows={3} value={questionnaire.preferences} onChange={e => setQuestionnaire({ ...questionnaire, preferences: e.target.value })} />
                </FieldGroup>
              </StepCard>
            )}

            {currentStep.key === "plans" && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }} className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
                    <CreditCard className="w-8 h-8 text-primary-foreground" />
                  </motion.div>
                  <h2 className="font-montserrat font-black text-2xl text-foreground">Escolha o plano para sua igreja</h2>
                  <p className="text-muted-foreground font-inter text-sm">
                    Selecione o plano que melhor atende à <strong>{church.name || "sua comunidade"}</strong>. Todos incluem 30 dias grátis.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {(["comunidade", "crescimento", "pastoral"] as const).map((planKey) => {
                    const plan = STRIPE_PLANS[planKey];
                    const details = PLAN_DETAILS[planKey];
                    const isRecommended = planKey === recommendPlan(community, questionnaire);

                    return (
                      <Card key={planKey} className={`relative border-2 transition-all hover:shadow-lg ${isRecommended ? 'border-primary' : 'border-border'}`}>
                        {isRecommended && (
                          <div className="absolute top-0 right-0 p-2">
                            <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">RECOMENDADO</Badge>
                          </div>
                        )}
                        <div className={`h-1.5 bg-gradient-to-r ${details.color}`} />
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{details.emoji}</span>
                              <div>
                                <h3 className="font-montserrat font-black text-lg text-foreground">{plan.name}</h3>
                                <p className="text-xs text-muted-foreground font-inter">{details.members}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-montserrat font-black text-xl text-foreground">{plan.price}</p>
                              <p className="text-[10px] text-muted-foreground">{plan.period}</p>
                            </div>
                          </div>

                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                            {details.features.slice(0, 4).map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-[11px] font-inter text-foreground/80">
                                <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                                <span className="truncate">{f}</span>
                              </li>
                            ))}
                          </ul>

                          <Button
                            onClick={() => handleConfirmPlan(planKey)}
                            disabled={checkoutLoading}
                            variant={isRecommended ? "default" : "outline"}
                            className={`w-full h-11 text-sm font-montserrat font-bold rounded-xl ${isRecommended ? 'text-primary-foreground shadow-md' : ''}`}
                            style={isRecommended ? { background: "var(--gradient-hero)" } : undefined}
                          >
                            {checkoutLoading ? "Processando..." : `Selecionar ${plan.name}`}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer navigation */}
      {currentStep.key !== "plans" && (
        <div className="sticky bottom-0 bg-background border-t border-border">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" onClick={goBack} disabled={step === 0} className="gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
            <span className="text-xs text-muted-foreground font-inter">
              {step + 1} de {STEPS.length}
            </span>
            <Button
              onClick={goNext}
              disabled={!canNext()}
              className="gap-2 text-primary-foreground font-bold"
              style={{ background: "var(--gradient-hero)" }}
            >
              {step === STEPS.length - 2 ? "Escolher plano" : "Próximo"} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      {/* Plan Summary Dialog */}
      <Dialog open={showPlanSummary} onOpenChange={setShowPlanSummary}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-montserrat font-black text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Confirmar Escolha
            </DialogTitle>
            <DialogDescription className="font-inter">
              Revise os detalhes do plano selecionado para a <strong>{church.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          {selectedPlanKey && (
            <div className="bg-muted/30 rounded-2xl p-6 border border-border space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Plano</p>
                  <h4 className="font-montserrat font-black text-xl text-primary">{STRIPE_PLANS[selectedPlanKey].name}</h4>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Valor Mensal</p>
                  <p className="font-montserrat font-black text-xl">{STRIPE_PLANS[selectedPlanKey].price}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-brand-green bg-brand-green/10 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold font-inter uppercase">30 Dias de Teste Grátis</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 px-1">
                  Você não será cobrado hoje. O período de teste encerra em 30 dias. Cancele a qualquer momento.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
            <Button 
              onClick={handleCheckout} 
              disabled={checkoutLoading}
              className="w-full h-12 rounded-xl text-primary-foreground font-bold shadow-lg"
              style={{ background: "var(--gradient-hero)" }}
            >
              {checkoutLoading ? "Iniciando..." : "Confirmar e Ir para Checkout"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowPlanSummary(false)} 
              className="w-full h-11 rounded-xl text-muted-foreground"
            >
              Voltar e trocar plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Reusable sub-components ─────────────────────────────
function StepCard({ icon: Icon, title, subtitle, children }: { icon: typeof Church; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-montserrat font-bold text-xl text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground font-inter">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function FieldGroup({ label, icon: Icon, children }: { label: string; icon: typeof Church; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-sm font-inter font-medium text-foreground">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        {label}
      </Label>
      {children}
    </div>
  );
}
