import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_PLANS, getPlanByProductId, type PlanKey } from "@/lib/stripePlans";
import { PLAN_FEATURES, getFeaturesForPlan, isUnlimitedChurch } from "@/lib/planFeatures";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, CreditCard, FileText, ExternalLink, RefreshCw, Church, 
  Download, Calendar, CheckCircle2, XCircle, ShieldAlert, Clock, 
  History, Palette, Image as ImageIcon, Save, ShieldCheck, Zap
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PlanGate } from "@/components/auth/PlanGate";

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

interface UserStats {
  total_users: number;
  active_users: number;
  pending_users: number;
  member_limit: number | null;
}

export default function MinhaIgreja() {
  const { user, profile, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [subData, setSubData] = useState<SubData | null>(null);
  const [dbSub, setDbSub] = useState<any>(null);
  const [memberStats, setMemberStats] = useState<UserStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [branding, setBranding] = useState({
    name: "",
    logo_url: "",
    primary_color: "#1a1a2e",
    secondary_color: "#e94560"
  });
  const [savingBranding, setSavingBranding] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!user || !profile?.church_id) return;
    setLoading(true);
    try {
      const [
        { data: sData, error: sError }, 
        { data: uStats, error: mError },
        { data: aLogs, error: aError },
        { data: cData, error: cError },
        { data: dbSubscriptionData }
      ] = await Promise.all([
        supabase.functions.invoke("check-subscription"),
        supabase.rpc("get_church_user_stats", { p_church_id: profile.church_id }),
        supabase.from('church_audit_logs').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('churches').select('*').eq('id', profile.church_id).single(),
        supabase.from('church_subscriptions').select('*').eq('church_id', profile.church_id).maybeSingle()
      ]);

      if (sError) throw sError;
      setSubData(sData);
      setDbSub(dbSubscriptionData);
      setAuditLogs((aLogs as AuditLog[]) || []);
      
      if (cData) {
        setBranding({
          name: cData.name || "",
          logo_url: cData.logo_url || "",
          primary_color: cData.primary_color || "#1a1a2e",
          secondary_color: cData.secondary_color || "#e94560"
        });
      }

      if (uStats) {
        setMemberStats(uStats[0] || null);
      }
    } catch (err: any) {
      console.error("Error checking subscription:", err);
      toast({ title: "Erro", description: "Não foi possível verificar a assinatura.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, profile?.church_id]);

  useEffect(() => {
    if (!profile?.church_id) return;
    
    let lastProcessedEvent: string | null = null;

    const channel = supabase
      .channel(`church_subscription_${profile.church_id}`)
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'church_subscriptions', filter: `church_id=eq.${profile.church_id}` }, 
        (payload: any) => {
          const eventId = payload.new?.last_webhook_event_id;
          if (eventId && eventId === lastProcessedEvent) return;
          lastProcessedEvent = eventId;
          fetchSubscription();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `church_id=eq.${profile.church_id}` },
        () => {
          console.log("Profile change detected, updating member stats");
          fetchSubscription();
        }
      )
      .subscribe();
    const interval = setInterval(() => fetchSubscription(), 30000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [profile?.church_id, fetchSubscription]);

  const isMembro = useMemo(() => role !== "admin" && role !== "lider", [role]);

  useEffect(() => {
    if (!authLoading && user) fetchSubscription();
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, fetchSubscription, navigate]);

  const handleSaveBranding = async () => {
    if (!profile?.church_id) return;
    setSavingBranding(true);
    try {
      const { error } = await supabase
        .from("churches")
        .update({
          name: branding.name,
          logo_url: branding.logo_url,
          primary_color: branding.primary_color,
          secondary_color: branding.secondary_color,
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.church_id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Configurações de marca atualizadas com sucesso." });
      await supabase.rpc('log_church_audit', { p_church_id: profile.church_id, p_action: 'branding_updated', p_details: { name: branding.name } });
    } catch (err: any) {
      toast({ title: "Erro", description: "Não foi possível salvar as configurações.", variant: "destructive" });
    } finally {
      setSavingBranding(false);
    }
  };

  const handleManageSubscription = async (action: string = 'portal_opened') => {
    if (isMembro) return;
    setPortalLoading(true);
    try {
      if (profile?.church_id) await supabase.rpc('log_church_audit', { p_church_id: profile.church_id, p_action: action });
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Erro", description: "Não foi possível abrir o portal de pagamentos.", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

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

  const planKey = subData?.product_id ? getPlanByProductId(subData.product_id) : null;
  const planInfo = planKey ? STRIPE_PLANS[planKey] : null;
  const features = getFeaturesForPlan(planKey);

  const activeFeatures = [
    { label: "Membros", value: features.maxMembers || "Ilimitado", active: true },
    { label: "Exportação Avançada", active: features.advancedExport },
    { label: "Multi-Áreas", active: features.multiAreaManagement },
    { label: "Relatórios Detalhados", active: features.detailedReports },
    { label: "Customização de Marca", active: features.customBranding },
  ];

  const handleExportUsers = () => {
    if (!memberStats) return;
    
    // Simple CSV export simulation
    const headers = "Nome,Status,Email,Comunidade,Area\n";
    const data = "Exemplo Membro,Ativo,membro@email.com,Comunidade Central,Area 1\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + data;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `usuarios_${profile?.church_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Exportação iniciada", description: "O arquivo CSV com a lista de usuários está sendo baixado." });
  };

  return (
    <div className="min-h-screen bg-background max-w-2xl mx-auto pb-10">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-montserrat font-black text-xl text-foreground">⛪ {(profile as any)?.churches?.name || profile?.community || "Minha Igreja"}</h1>
          <p className="text-muted-foreground text-[10px] font-inter uppercase font-bold tracking-wider">{role === 'admin' ? 'Administrador' : role === 'lider' ? 'Líder de Área' : 'Membro'}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {!isMembro && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportUsers}
              className="h-9 rounded-xl text-[10px] font-bold hidden sm:flex"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Exportar
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSubscription} 
            disabled={loading}
            className="h-9 rounded-xl text-[10px] font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Sincronizar Status
          </Button>
        </div>
      </div>

      <div className="px-5 mb-6">
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 h-12 bg-muted/50 rounded-xl p-1">
            <TabsTrigger value="status" className="rounded-lg font-montserrat font-bold text-xs">Plano & Status</TabsTrigger>
            <TabsTrigger value="branding" className="rounded-lg font-montserrat font-bold text-xs">Customização</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            {subData?.subscribed && subData.subscription_status === 'trial' && subData.subscription_end && (
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-montserrat font-bold text-sm text-primary">Período de Experiência</p>
                      <p className="text-xs text-muted-foreground font-inter max-w-[200px]">Até {formatDate(subData.subscription_end)}.</p>
                    </div>
                    <div className="text-right bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-primary/10">
                      <span className="text-xl font-black text-primary block leading-none">{Math.max(0, Math.ceil((new Date(subData.subscription_end).getTime() - Date.now()) / 86400000))}</span>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">dias rest.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Card className="border-2" style={subData?.subscribed ? { borderColor: "hsl(var(--brand-green))" } : undefined}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-montserrat text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Plano Ativo
                  </CardTitle>
                  <Badge variant={subData?.subscription_status === 'active' ? 'default' : 'secondary'} className="font-semibold">
                    {subData?.subscription_status === 'active' ? 'Ativa' : 'Pendente'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Church className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold leading-none mb-1">Plano Atual</p>
                      <p className="font-montserrat font-bold text-base text-foreground">{planInfo?.name || "Personalizado"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-montserrat font-bold text-lg text-primary leading-none">{planInfo?.price || "--"}</p>
                    <p className="text-[9px] text-muted-foreground font-inter uppercase font-bold tracking-wider">{planInfo?.period || ""}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {activeFeatures.map((feat, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-card border border-border/50">
                      <div className="flex items-center gap-2">
                        {feat.active ? (
                          <CheckCircle2 className="w-4 h-4 text-brand-green" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground/30" />
                        )}
                        <span className={`text-xs font-inter ${feat.active ? 'text-foreground font-medium' : 'text-muted-foreground/50'}`}>
                          {feat.label}
                        </span>
                      </div>
                      {feat.value && (
                        <Badge variant="secondary" className="text-[9px] font-bold">{feat.value}</Badge>
                      )}
                      {!feat.active && (
                        <Zap className="w-3.5 h-3.5 text-primary/40" />
                      )}
                    </div>
                  ))}
                </div>

                {memberStats && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-card border border-border/50 p-2 rounded-xl text-center">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Ativos</p>
                        <p className="text-sm font-black text-brand-green">{memberStats.active_users}</p>
                      </div>
                      <div className="bg-card border border-border/50 p-2 rounded-xl text-center">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Pendentes</p>
                        <p className="text-sm font-black text-warning">{memberStats.pending_users}</p>
                      </div>
                      <div className="bg-card border border-border/50 p-2 rounded-xl text-center">
                        <p className="text-[9px] text-muted-foreground uppercase font-bold">Total</p>
                        <p className="text-sm font-black text-foreground">{memberStats.total_users}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-inter uppercase font-bold tracking-wider">
                        <span className="text-muted-foreground">Uso de Membros (Total)</span>
                        <span className="text-foreground">{memberStats.total_users} / {memberStats.member_limit || '∞'}</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden border border-border/50">
                        <div 
                          className={`h-full transition-all duration-500 ${memberStats.member_limit && memberStats.total_users / memberStats.member_limit > 0.9 ? 'bg-destructive' : 'bg-primary'}`} 
                          style={{ width: `${memberStats.member_limit ? Math.min(100, (memberStats.total_users / memberStats.member_limit) * 100) : 100}%` }} 
                        />
                      </div>
                      <p className="text-[9px] text-muted-foreground leading-tight italic">
                        * O limite do plano considera usuários ativos e pendentes para garantir a segurança da plataforma.
                      </p>
                    </div>
                  </div>
                )}

                {!isMembro && (
                  <div className="pt-2">
                    <Button onClick={() => handleManageSubscription()} disabled={portalLoading} variant="default" className="w-full h-11 rounded-xl shadow-md font-bold">
                      {portalLoading ? "Processando..." : "Gerenciar no Stripe"}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <PlanGate feature="customBranding">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-montserrat text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Personalização da Igreja
                  </CardTitle>
                  <CardDescription>Defina a identidade visual da sua igreja no aplicativo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="church-name">Nome da Igreja</Label>
                    <Input id="church-name" value={branding.name} onChange={(e) => setBranding({...branding, name: e.target.value})} placeholder="Nome Oficial" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo-url">URL do Logo</Label>
                    <div className="flex gap-2">
                      <Input id="logo-url" value={branding.logo_url} onChange={(e) => setBranding({...branding, logo_url: e.target.value})} placeholder="https://..." className="rounded-xl flex-1" />
                      {branding.logo_url && <div className="w-10 h-10 rounded-lg border flex items-center justify-center overflow-hidden bg-white"><img src={branding.logo_url} alt="Logo" className="w-full h-full object-contain" /></div>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Cor Principal</Label>
                      <div className="flex gap-2">
                        <Input id="primary-color" type="color" value={branding.primary_color} onChange={(e) => setBranding({...branding, primary_color: e.target.value})} className="w-12 h-10 p-1 rounded-lg cursor-pointer" />
                        <Input type="text" value={branding.primary_color} onChange={(e) => setBranding({...branding, primary_color: e.target.value})} className="rounded-xl flex-1 text-xs" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Cor Secundária</Label>
                      <div className="flex gap-2">
                        <Input id="secondary-color" type="color" value={branding.secondary_color} onChange={(e) => setBranding({...branding, secondary_color: e.target.value})} className="w-12 h-10 p-1 rounded-lg cursor-pointer" />
                        <Input type="text" value={branding.secondary_color} onChange={(e) => setBranding({...branding, secondary_color: e.target.value})} className="rounded-xl flex-1 text-xs" />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSaveBranding} disabled={savingBranding} className="w-full h-11 rounded-xl mt-4">
                    {savingBranding ? "Salvando..." : "Salvar Alterações"}
                    <Save className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </PlanGate>
          </TabsContent>
        </Tabs>
      </div>

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
                        {log.action === 'branding_updated' && 'Identidade visual alterada'}
                        {log.action === 'invoice_paid' && 'Fatura paga com sucesso'}
                        {log.action === 'payment_failed' && 'Falha no pagamento'}
                        {!['trial_alert_shown', 'portal_opened', 'portal_opened_for_cancel', 'alert_snoozed', 'subscription_created', 'subscription_updated', 'plan_changed', 'branding_updated', 'invoice_paid', 'payment_failed'].includes(log.action) && log.action}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleString('pt-BR')}</p>
                      {log.action === 'plan_changed' && log.details?.unlocked?.length > 0 && (
                        <p className="text-[9px] text-brand-green font-medium mt-1">
                          Recursos liberados: {log.details.unlocked.join(', ')}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[8px] h-4">AUDITORIA</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center"><p className="text-muted-foreground font-inter text-xs">Nenhuma atividade registrada.</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="px-5">
        <h2 className="font-montserrat font-bold text-base text-foreground mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Recibos e Faturas
        </h2>
        {subData?.invoices?.map((inv) => (
          <Card key={inv.id} className="mb-2">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-inter font-semibold text-sm">{inv.number || inv.id.slice(0, 12)}</p>
                  <p className="text-muted-foreground text-[10px]">{formatDate(inv.created)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-montserrat font-bold text-sm">{formatCurrency(inv.amount, inv.currency)}</p>
                <Badge variant={inv.status === "paid" ? "default" : "secondary"} className="text-[8px]">{inv.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
