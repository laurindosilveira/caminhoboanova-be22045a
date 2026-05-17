import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_PLANS, getPlanByProductId, type PlanKey } from "@/lib/stripePlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, FileText, ExternalLink, RefreshCw, Church, Download, Calendar, CheckCircle2, XCircle, ShieldAlert, Clock, History } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  number: string | null;
  amount: number;
  currency: string;
  status: string;
  created: string;
  pdf: string | null;
  hosted_url: string | null;
}

interface SubData {
  subscribed: boolean;
  product_id: string | null;
  subscription_status: string | null;
  subscription_end: string | null;
  cancel_at_period_end: boolean;
  invoices: Invoice[];
}

interface AuditLog {
  id: string;
  action: string;
  created_at: string;
  details: any;
}

export default function MinhaIgreja() {
  const { user, profile, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [subData, setSubData] = useState<SubData | null>(null);
  const [memberStats, setMemberStats] = useState<{ current: number; limit: number | null } | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [
        { data: sData, error: sError }, 
        { data: mCount, error: mError },
        { data: aLogs, error: aError }
      ] = await Promise.all([
        supabase.functions.invoke("check-subscription"),
        supabase.rpc("get_church_member_count", { p_church_id: profile?.church_id as any }),
        supabase.from('church_audit_logs').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      if (sError) throw sError;
      setSubData(sData);
      setAuditLogs((aLogs as AuditLog[]) || []);

      // Get limit from subscription data or church_subscriptions
      const { data: churchSub } = await supabase
        .from("church_subscriptions")
        .select("member_limit")
        .eq("church_id", profile?.church_id)
        .single();
      
      setMemberStats({
        current: mCount || 0,
        limit: churchSub?.member_limit || null
      });
    } catch (err: any) {
      console.error("Error checking subscription:", err);
      toast({ title: "Erro", description: "Não foi possível verificar a assinatura.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, profile?.church_id]);

  // Real-time updates for subscription
  useEffect(() => {
    if (!profile?.church_id) return;

    // Real-time listener
    const channel = supabase
      .channel(`church_subscription_${profile.church_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'church_subscriptions',
          filter: `church_id=eq.${profile.church_id}`
        },
        () => {
          console.log("Subscription updated via real-time");
          fetchSubscription();
        }
      )
      .subscribe();

    // Fallback polling every 30 seconds
    const interval = setInterval(() => {
      console.log("Subscription re-fetch via polling");
      fetchSubscription();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [profile?.church_id, fetchSubscription]);

  const isMembro = useMemo(() => role !== "admin" && role !== "lider", [role]);

  useEffect(() => {
    if (!authLoading && user) {
      // Allow admin, lider and user (membro) to see the page
      // But we will handle restrictions inside the UI
      fetchSubscription();
    }
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, role, fetchSubscription, navigate]);

  const planKey = subData?.product_id ? getPlanByProductId(subData.product_id) : null;
  const planInfo = planKey ? STRIPE_PLANS[planKey] : null;

  const handleManageSubscription = async (action: string = 'portal_opened') => {
    if (isMembro) {
      toast({ title: "Acesso negado", description: "Somente administradores ou líderes podem gerenciar a assinatura.", variant: "destructive" });
      return;
    }
    
    setPortalLoading(true);
    try {
      if (profile?.church_id) {
        await supabase.rpc('log_church_audit', { 
          p_church_id: profile.church_id, 
          p_action: action 
        });
      }

      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Erro", description: "Não foi possível abrir o portal de pagamentos.", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-white/15 backdrop-blur border-2 border-white/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Church className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-primary-foreground font-inter text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-2xl mx-auto pb-10">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Voltar" className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-montserrat font-black text-xl text-foreground">⛪ {(profile as any)?.churches?.name || profile?.community || "Minha Igreja"}</h1>
          <p className="text-muted-foreground text-[10px] font-inter uppercase font-bold tracking-wider">{role === 'admin' ? 'Administrador' : role === 'lider' ? 'Líder de Área' : 'Membro'}</p>
        </div>
        <button onClick={fetchSubscription} aria-label="Atualizar status da assinatura" className="ml-auto w-10 h-10 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Subscription Status */}
      <div className="px-5 mb-6 space-y-4">
        {subData?.subscribed && subData.subscription_status === 'trial' && subData.subscription_end && (
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1">
               <Badge variant="outline" className="text-[8px] border-primary/20 bg-primary/5">TRIAL</Badge>
            </div>
            <Clock className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-montserrat font-bold text-sm text-primary">Período de Experiência</p>
                  <p className="text-xs text-muted-foreground font-inter max-w-[200px]">
                    Sua igreja está no modo demonstração até {formatDate(subData.subscription_end)}.
                  </p>
                </div>
                <div className="text-right bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-primary/10">
                  <span className="text-xl font-black text-primary block leading-none">
                    {Math.max(0, Math.ceil((new Date(subData.subscription_end).getTime() - Date.now()) / 86400000))}
                  </span>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">dias rest.</p>
                </div>
              </div>
              {!isMembro && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => handleManageSubscription('portal_opened_for_cancel')} 
                    disabled={portalLoading}
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[10px] font-bold border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all px-4"
                  >
                    Cancelar Trial
                  </Button>
                  <Button 
                    onClick={() => {
                      const expiry = new Date();
                      expiry.setHours(expiry.getHours() + 24);
                      localStorage.setItem(`snooze_trial_${profile?.church_id}`, expiry.toISOString());
                      toast({ title: "Aviso ocultado", description: "Lembrete adiado por 24 horas." });
                      fetchSubscription();
                    }} 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-[10px] font-bold text-muted-foreground hover:bg-muted"
                  >
                    Sonecar por 24h
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {subData?.subscribed && subData.subscription_status === 'past_due' && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-montserrat font-bold text-sm text-destructive">Pagamento Pendente</p>
              <div className="mt-2 space-y-2">
                <p className="text-xs text-muted-foreground font-inter">Sua assinatura está com pagamento atrasado. Checklist para regularizar:</p>
                <ul className="text-[11px] space-y-1 text-muted-foreground list-disc pl-4">
                  <li>Verificar limite do cartão de crédito</li>
                  <li>Confirmar se o cartão não está expirado</li>
                  <li>Acessar o Portal para atualizar forma de pagamento</li>
                </ul>
              </div>
              {!isMembro && (
                <Button onClick={() => handleManageSubscription('portal_opened_from_alert')} variant="link" className="p-0 h-auto text-xs text-destructive font-bold mt-2">Regularizar agora →</Button>
              )}
            </div>
          </div>
        )}

        {subData?.subscribed && subData.subscription_status === 'blocked' && (
          <div className="bg-destructive border border-destructive rounded-2xl p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-white mt-0.5" />
            <div className="flex-1">
              <p className="font-montserrat font-bold text-sm text-white">Acesso Bloqueado</p>
              <div className="mt-2 space-y-2">
                <p className="text-xs text-white/80 font-inter">Sua conta foi bloqueada devido à falta de pagamento. Passos para desbloqueio:</p>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 text-[10px] text-white/90 bg-white/10 p-2 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" /> Abrir portal de pagamento
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/90 bg-white/10 p-2 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" /> Atualizar dados do cartão
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/90 bg-white/10 p-2 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" /> Aguardar processamento (até 2h)
                  </div>
                </div>
              </div>
              {!isMembro && (
                <Button onClick={() => handleManageSubscription('portal_opened_from_block')} variant="secondary" size="sm" className="mt-3 font-bold w-full">Abrir Portal de Pagamento</Button>
              )}
            </div>
          </div>
        )}

        <Card className="border-2" style={subData?.subscribed ? { borderColor: "hsl(var(--brand-green))" } : undefined}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-montserrat text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Assinatura
              </CardTitle>
              {subData?.subscribed ? (
                <div className="flex flex-col items-end gap-1">
                  <Badge className={`${subData.subscription_status === 'active' ? 'bg-[hsl(var(--brand-green))]/15 text-[hsl(var(--brand-green))] border-[hsl(var(--brand-green))]/30' : 'bg-warning/15 text-warning border-warning/30'} font-semibold`}>
                    {subData.subscription_status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <Clock className="w-3.5 h-3.5 mr-1" />}
                    {subData.subscription_status === 'active' ? 'Ativa' : 'Pendente'}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground font-inter">{subData.cancel_at_period_end ? 'Cancela em:' : 'Renova em:'} {formatDate(subData.subscription_end || "")}</p>
                </div>
              ) : (
                <Badge variant="destructive" className="font-semibold">
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Inativa
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subData?.subscribed ? (
              <>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Church className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold leading-none mb-1">Plano Atual</p>
                      <p className="font-montserrat font-bold text-base text-foreground">
                        {planInfo?.name || "Personalizado"}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">{subData.subscription_status?.toUpperCase()}</Badge>
                </div>

                {memberStats && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-inter">
                      <span className="text-muted-foreground">Membros utilizados</span>
                      <span className="font-bold">{memberStats.current} / {memberStats.limit || '∞'}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${memberStats.limit && memberStats.current / memberStats.limit > 0.9 ? 'bg-destructive' : 'bg-primary'}`}
                        style={{ width: `${memberStats.limit ? Math.min(100, (memberStats.current / memberStats.limit) * 100) : 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  {subData.subscription_end && (
                    <p className="text-muted-foreground text-[11px] font-inter flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {subData.cancel_at_period_end ? 'Encerra em:' : 'Próxima renovação:'} {formatDate(subData.subscription_end)}
                    </p>
                  )}
                  {!isMembro && (
                    <Button onClick={() => handleManageSubscription()} disabled={portalLoading} variant="outline" className="w-full h-11 rounded-xl">
                      {portalLoading ? "Abrindo..." : "Gerenciar Assinatura"}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground font-inter text-sm mb-4">Você ainda não possui uma assinatura ativa.</p>
                <Button onClick={() => navigate("/apresentacao#planos")} style={{ background: "var(--gradient-hero)" }} className="w-full h-12 rounded-xl text-primary-foreground font-bold">
                  Conhecer Planos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit History */}
      <div className="px-5 mb-8">
        <h2 className="font-montserrat font-bold text-base text-foreground mb-3 flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Histórico de Atividades
        </h2>
        <Card className="border-border">
          <CardContent className="p-0 overflow-hidden">
            {auditLogs.length > 0 ? (
              <div className="divide-y divide-border">
                {auditLogs.map((log) => (
                  <div key={log.id} className="px-4 py-3 flex items-start justify-between gap-3 bg-card/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-foreground uppercase tracking-wider truncate">
                        {log.action === 'trial_alert_shown' && 'Aviso de vencimento exibido'}
                        {log.action === 'portal_opened' && 'Portal do cliente acessado'}
                        {log.action === 'portal_opened_for_cancel' && 'Portal acessado para cancelar'}
                        {log.action === 'alert_snoozed' && 'Banner sonecado por 24h'}
                        {log.action === 'subscription_created' && 'Assinatura criada'}
                        {log.action === 'subscription_updated' && 'Assinatura atualizada'}
                        {log.action === 'plan_changed' && 'Plano Alterado'}
                        {log.action === 'invoice_paid' && 'Fatura paga com sucesso'}
                        {log.action === 'payment_failed' && 'Falha no pagamento'}
                        {!['trial_alert_shown', 'portal_opened', 'portal_opened_for_cancel', 'alert_snoozed', 'subscription_created', 'subscription_updated', 'plan_changed', 'invoice_paid', 'payment_failed'].includes(log.action) && log.action}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-inter">
                        {new Date(log.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {log.action === 'plan_changed' && log.details?.unlocked?.length > 0 && (
                        <p className="text-[9px] text-brand-green font-medium mt-1">
                          Libera: {log.details.unlocked.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-[8px] bg-muted/30 px-1.5 h-4">AUDITORIA</Badge>
                      {log.details?.plan && <span className="text-[9px] text-primary font-bold">{log.details.plan}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground font-inter text-xs">Nenhuma atividade registrada.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoices / Receipts */}
      <div className="px-5">
        <h2 className="font-montserrat font-bold text-base text-foreground mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Recibos e Faturas
        </h2>

        {subData?.invoices && subData.invoices.length > 0 ? (
          <div className="space-y-2">
            {subData.invoices.map((inv) => (
              <Card key={inv.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    inv.status === "paid" ? "bg-[hsl(var(--brand-green))]/15" : "bg-muted"
                  }`}>
                    <FileText className={`w-5 h-5 ${inv.status === "paid" ? "text-[hsl(var(--brand-green))]" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter font-semibold text-sm text-foreground truncate">
                      {inv.number || inv.id.slice(0, 12)}
                    </p>
                    <p className="text-muted-foreground text-xs font-inter">{formatDate(inv.created)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-montserrat font-bold text-sm text-foreground">{formatCurrency(inv.amount, inv.currency)}</p>
                    <Badge variant={inv.status === "paid" ? "default" : "secondary"} className="text-[10px]">
                      {inv.status === "paid" ? "Pago" : inv.status === "open" ? "Aberto" : inv.status}
                    </Badge>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {inv.pdf && (
                      <a href={inv.pdf} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors" title="Baixar PDF">
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </a>
                    )}
                    {inv.hosted_url && (
                      <a href={inv.hosted_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors" title="Ver online">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-muted-foreground font-inter text-sm">Nenhuma fatura encontrada.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
