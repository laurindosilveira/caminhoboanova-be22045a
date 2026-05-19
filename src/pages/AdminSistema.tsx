import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AUTOMATED_SYSTEM_UPDATES } from "@/data/systemUpdates";
import { isAuthorizedSystemAdmin } from "@/lib/systemAdminAccess";
import {
  ArrowLeft,
  CheckCircle2,
  Church,
  Clock,
  DatabaseBackup,
  Megaphone,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  XCircle,
  CalendarDays,
  Plus,
  FileDown,
  FileText,
  Database,
  Lock,
  Package,
  ListOrdered,
  FileCode,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface ChurchSubscription {
  id: string;
  church_name: string;
  church_email: string;
  pastor_name: string;
  pastor_phone: string;
  member_count: string;
  recommended_plan: string;
  subscription_status: string;
  trial_ends_at: string | null;
  created_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending_checkout: { label: "Aguardando checkout", color: "bg-warning/10 text-warning border-warning/30", icon: Clock },
  trial: { label: "Em trial (30 dias)", color: "bg-brand-green/10 text-brand-green border-brand-green/30", icon: Clock },
  active: { label: "Ativo", color: "bg-brand-green/10 text-brand-green border-brand-green/30", icon: CheckCircle2 },
  past_due: { label: "Pagamento pendente", color: "bg-destructive/10 text-destructive border-destructive/30", icon: ShieldAlert },
  unpaid: { label: "Inadimplente", color: "bg-destructive/10 text-destructive border-destructive/30", icon: ShieldAlert },
  canceled: { label: "Cancelado", color: "bg-muted text-muted-foreground border-border", icon: XCircle },
  blocked: { label: "Bloqueado", color: "bg-destructive/10 text-destructive border-destructive/30", icon: ShieldAlert },
};

const PLAN_LABELS: Record<string, { label: string; emoji: string }> = {
  comunidade: { label: "Comunidade", emoji: "Comunidade" },
  crescimento: { label: "Crescimento", emoji: "Crescimento" },
  pastoral: { label: "Pastoral", emoji: "Pastoral" },
  Premium: { label: "Premium (Ilimitado)", emoji: "Premium" },
};

const UPDATE_TYPE_OPTIONS = [
  { value: "nova_funcionalidade", label: "Nova funcionalidade", color: "bg-brand-green/10 text-brand-green border-brand-green/30" },
  { value: "melhoria", label: "Melhoria", color: "bg-primary/10 text-primary border-primary/30" },
  { value: "correcao", label: "Correcao", color: "bg-warning/10 text-warning border-warning/30" },
  { value: "comunicado", label: "Comunicado", color: "bg-muted text-muted-foreground border-border" },
];

export default function AdminSistema() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [churches, setChurches] = useState<ChurchSubscription[]>([]);
  const [churchesLoading, setChurchesLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUpdateId, setSelectedUpdateId] = useState<string | null>(null);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [systemAdminChecked, setSystemAdminChecked] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState<any[]>([]);
  const [planHistory, setPlanHistory] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    let isMounted = true;

    async function checkSystemAdmin() {
      if (!user?.email) {
        setIsSystemAdmin(false);
        setSystemAdminChecked(true);
        setChurchesLoading(false);
        return;
      }

      setSystemAdminChecked(false);
      const allowed = await isAuthorizedSystemAdmin();
      if (!isMounted) return;

      setIsSystemAdmin(allowed);
      setSystemAdminChecked(true);
      if (allowed) {
        fetchChurches();
        fetchWebhookLogs();
        fetchAdminAuditLogs();
        fetchErrorLogs();
      } else {
        setChurches([]);
        setChurchesLoading(false);
      }
    }

    if (!authLoading) checkSystemAdmin();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user?.email]);

  async function fetchChurches() {
    setChurchesLoading(true);
    const { data, error } = await supabase
      .from("church_subscriptions" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast({ title: "Erro ao carregar igrejas", variant: "destructive" });
    } else {
      setChurches((data as any) ?? []);
    }

    setChurchesLoading(false);
  }

  async function fetchWebhookLogs() {
    setLogsLoading(true);
    const { data, error } = await supabase
      .from("stripe_webhook_logs")
      .select("*, church_subscriptions(church_name)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);
    } else {
      setWebhookLogs(data || []);
    }
    setLogsLoading(false);
  }

  async function fetchAdminAuditLogs() {
    const { data } = await supabase
      .from("system_admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setAdminAuditLogs(data || []);
  }

  async function fetchErrorLogs() {
    const { data } = await supabase
      .from("frontend_error_logs")
      .select("*, churches(name)")
      .order("created_at", { ascending: false })
      .limit(50);
    setErrorLogs(data || []);
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from("church_subscriptions" as any)
      .update({ subscription_status: newStatus, updated_at: new Date().toISOString() } as any)
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
      return;
    }

    toast({ title: `Status atualizado para "${STATUS_MAP[newStatus]?.label ?? newStatus}"` });
    fetchChurches();
  }

  async function extendTrial(id: string, days: number) {
    try {
      const { data, error } = await supabase.rpc('secure_extend_trial', {
        p_church_subscription_id: id,
        p_days: days
      });

      if (error) {
        if (error.message.includes('MFA_REQUIRED')) {
          toast({ title: "Segurança", description: "Sua sessão expirou ou o MFA foi desativado. Refaça o login.", variant: "destructive" });
          navigate("/login");
          return;
        }
        throw error;
      }

      toast({ title: `Trial estendido por ${days} dias` });
      fetchChurches();
    } catch (err) {
      toast({ title: "Erro ao estender trial", variant: "destructive" });
    }
  }

  const filteredChurches = churches.filter((church) => {
    const matchesSearch =
      church.church_name.toLowerCase().includes(search.toLowerCase()) ||
      church.pastor_name.toLowerCase().includes(search.toLowerCase()) ||
      church.church_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || church.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const churchStats = {
    total: churches.length,
    trial: churches.filter((church) => church.subscription_status === "trial" || church.subscription_status === "pending_checkout").length,
    active: churches.filter((church) => church.subscription_status === "active").length,
    canceled: churches.filter((church) => church.subscription_status === "canceled" || church.subscription_status === "blocked").length,
    failed: churches.filter((church) => church.subscription_status === "past_due" || church.subscription_status === "unpaid").length,
    revenue: churches
      .filter((church) => church.subscription_status === "active")
      .reduce((acc, church) => {
        const price = church.recommended_plan === "comunidade" ? 79 : church.recommended_plan === "crescimento" ? 129 : 199;
        return acc + price;
      }, 0),
  };

  const latestAutomatedUpdate = AUTOMATED_SYSTEM_UPDATES[0] ?? null;
  const selectedUpdate = AUTOMATED_SYSTEM_UPDATES.find((item) => item.id === selectedUpdateId) ?? null;

  if (authLoading) return null;
  if (!systemAdminChecked) return null;
  if (!isSystemAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <CardTitle className="font-montserrat text-xl font-black text-foreground">Acesso restrito</CardTitle>
            <CardDescription>Seu usuario nao esta autorizado a acessar esta area.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full rounded-xl" onClick={() => navigate("/")}>Voltar para o app</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--gradient-hero)" }}>
            <Church className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-montserrat text-lg font-black text-foreground">Administracao do Sistema</h1>
            <p className="text-xs text-muted-foreground">Gestao de igrejas, assinaturas e atualizacoes automaticas do app</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <Tabs defaultValue="igrejas" className="space-y-6">
          <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-2xl bg-muted/60 p-2">
            <TabsTrigger value="igrejas" className="rounded-xl px-4 py-2">Igrejas</TabsTrigger>
            <TabsTrigger value="atualizacoes" className="rounded-xl px-4 py-2">Atualizacoes do app</TabsTrigger>
            <TabsTrigger value="audit-logs" className="rounded-xl px-4 py-2">Seguranca</TabsTrigger>
            <TabsTrigger value="webhook-logs" className="rounded-xl px-4 py-2">Webhook Logs</TabsTrigger>
            <TabsTrigger value="error-logs" className="rounded-xl px-4 py-2">Monitoramento de Erros</TabsTrigger>
            <TabsTrigger value="backup" className="rounded-xl px-4 py-2">Backup</TabsTrigger>
            <TabsTrigger value="migration" className="rounded-xl px-4 py-2">Migração</TabsTrigger>
          </TabsList>

          <TabsContent value="igrejas" className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {[
                { label: "Total", value: churchStats.total, icon: Church, color: "text-primary" },
                { label: "Ativos", value: churchStats.active, icon: CheckCircle2, color: "text-brand-green" },
                { label: "Receita (Est.)", value: `R$ ${churchStats.revenue}`, icon: Sparkles, color: "text-yellow-500" },
                { label: "Falhas", value: churchStats.failed, icon: ShieldAlert, color: "text-destructive" },
                { label: "Em trial", value: churchStats.trial, icon: Clock, color: "text-warning" },
              ].map((stat) => (
                <Card key={stat.label} className="border-border">
                  <CardContent className="flex items-center gap-3 p-4">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <div>
                      <p className="font-montserrat text-xl font-black text-foreground">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, pastor ou email..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="rounded-xl pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", "pending_checkout", "trial", "active", "canceled", "blocked"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="rounded-xl text-xs"
                  >
                    {status === "all" ? "Todos" : STATUS_MAP[status]?.label ?? status}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="icon" onClick={fetchChurches} className="rounded-xl">
                <RefreshCw className={`h-4 w-4 ${churchesLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {churchesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-28 animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : filteredChurches.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <Church className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-montserrat font-bold text-foreground">Nenhuma igreja encontrada</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {search ? "Tente buscar com outros termos." : "As igrejas aparecerao aqui apos o cadastro via onboarding."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredChurches.map((church) => {
                  const status = STATUS_MAP[church.subscription_status] ?? STATUS_MAP.pending_checkout;
                  const plan = PLAN_LABELS[church.recommended_plan] ?? { label: church.recommended_plan, emoji: "Plano" };
                  const StatusIcon = status.icon;
                  const trialDaysLeft = church.trial_ends_at
                    ? Math.max(0, Math.ceil((new Date(church.trial_ends_at).getTime() - Date.now()) / 86400000))
                    : null;

                  return (
                    <Card key={church.id} className="border-border transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <h3 className="truncate font-montserrat font-bold text-foreground">{church.church_name}</h3>
                              <Badge variant="outline" className={`border text-[10px] ${status.color}`}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {status.label}
                              </Badge>
                            </div>

                            <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-muted-foreground md:grid-cols-4">
                              <span>Pastor: {church.pastor_name}</span>
                              <span>Email: {church.church_email}</span>
                              <span>Membros: {church.member_count || "-"}</span>
                              <span>{plan.emoji} {plan.label}</span>
                            </div>

                            {trialDaysLeft !== null && church.subscription_status !== "active" && (
                              <p className={`mt-1.5 text-xs ${trialDaysLeft <= 5 ? "font-bold text-destructive" : "text-muted-foreground"}`}>
                                {trialDaysLeft > 0 ? `${trialDaysLeft} dias restantes no trial` : "Trial expirado"}
                              </p>
                            )}

                            <p className="mt-1 text-[10px] text-muted-foreground">
                              Cadastrado em {new Date(church.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-lg border-primary/30 text-[10px] text-primary hover:bg-primary/10 flex-1"
                                onClick={async () => {
                                  const { data, error } = await supabase.rpc('test_stripe_webhook', {
                                    p_church_subscription_id: church.id,
                                    p_event_type: 'manual_reprocess',
                                    p_stripe_status: 'active'
                                  });
                                  if (error) toast({ title: "Erro ao reprocessar", variant: "destructive" });
                                  else {
                                    toast({ title: "Webhook reprocessado com sucesso" });
                                    fetchChurches();
                                    fetchWebhookLogs();
                                  }
                                }}
                              >
                                Reprocessar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-lg border-warning/30 text-[10px] text-warning hover:bg-warning/10 flex-1"
                                onClick={() => extendTrial(church.id, 7)}
                                title="Adicionar 7 dias de teste"
                              >
                                <Plus className="w-3 h-3 mr-1" /> 7 dias
                              </Button>
                            </div>
                            
                            {church.stripe_customer_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-lg border-border text-[10px] hover:bg-muted"
                                onClick={() => window.open(`https://dashboard.stripe.com/customers/${church.stripe_customer_id}`, "_blank")}
                              >
                                Ver no Stripe
                              </Button>
                            )}
                            <div className="flex gap-1">
                              {church.subscription_status !== "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-lg border-brand-green/30 text-[10px] text-brand-green hover:bg-brand-green/10 flex-1"
                                  onClick={() => updateStatus(church.id, "active")}
                                >
                                  Ativar
                                </Button>
                              )}
                              {church.subscription_status !== "blocked" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 rounded-lg border-destructive/30 text-[10px] text-destructive hover:bg-destructive/10 flex-1"
                                  onClick={() => updateStatus(church.id, "blocked")}
                                >
                                  Bloquear
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="audit-logs" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-montserrat text-lg font-black">Log de Auditoria do Sistema</CardTitle>
                <CardDescription>Acompanhe tentativas de acesso e acoes administrativas criticas.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted text-muted-foreground uppercase font-bold text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3">IP</th>
                        <th className="px-4 py-3">Acao</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-inter">
                      {adminAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 font-mono">{log.ip_address || '—'}</td>
                          <td className="px-4 py-3 font-medium">{log.action}</td>
                          <td className="px-4 py-3">
                            <Badge className={log.status === 'success' ? 'bg-brand-green/10 text-brand-green border-brand-green/30' : 'bg-destructive/10 text-destructive border-destructive/30'}>
                              {log.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="atualizacoes" className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-montserrat text-xl font-black">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Preenchimento automatico
                  </CardTitle>
                  <CardDescription>
                    Esta area agora recebe as informacoes das atualizacoes automaticamente a partir do proprio projeto.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-foreground">Como funciona agora</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      O painel mostra a versao atual publicada no build e o historico versionado das entregas sem depender de formulario manual no app.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Versao atual</p>
                      <p className="mt-1 font-montserrat text-2xl font-black text-foreground">
                        {latestAutomatedUpdate?.version ?? "Sem versao"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Build atual</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {latestAutomatedUpdate ? new Date(latestAutomatedUpdate.createdAt).toLocaleString("pt-BR") : "Nao disponivel"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="text-sm font-semibold text-foreground">Origem das informacoes</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      O historico desta aba e lido diretamente do projeto e exibido automaticamente no admin do sistema sempre que houver novo deploy.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-montserrat text-xl font-black">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Visao geral
                  </CardTitle>
                  <CardDescription>Resumo rapido do historico automatico desta versao do app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
                      <p className="mt-1 font-montserrat text-3xl font-black text-foreground">{AUTOMATED_SYSTEM_UPDATES.length}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Ultima publicacao</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {latestAutomatedUpdate ? new Date(latestAutomatedUpdate.createdAt).toLocaleDateString("pt-BR") : "Nenhuma ainda"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-foreground">Beneficio principal</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Voce nao precisa mais abrir o app para cadastrar a atualizacao manualmente. O painel recebe esse conteudo sozinho a partir do codigo publicado.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-montserrat text-xl font-black text-foreground">Historico de atualizacoes</h2>
                <p className="text-sm text-muted-foreground">Entradas automaticas exibidas pelo admin do sistema.</p>
              </div>
              <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl">
                <RefreshCw className="mr-2 h-4 w-4" />
                Recarregar painel
              </Button>
            </div>

            {AUTOMATED_SYSTEM_UPDATES.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center">
                  <Megaphone className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-montserrat font-bold text-foreground">Nenhuma atualizacao automatica encontrada</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Assim que houver uma nova versao publicada, ela aparecera automaticamente aqui.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {AUTOMATED_SYSTEM_UPDATES.map((item) => {
                  const typeConfig = UPDATE_TYPE_OPTIONS.find((option) => option.value === item.updateType) ?? UPDATE_TYPE_OPTIONS[1];

                  return (
                    <Card
                      key={item.id}
                      className="cursor-pointer border-border transition-all hover:-translate-y-0.5 hover:shadow-md"
                      onClick={() => setSelectedUpdateId(item.id)}
                    >
                      <CardContent className="p-5">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-montserrat text-lg font-black text-foreground">{item.title}</h3>
                            <Badge variant="outline" className={`border ${typeConfig.color}`}>
                              {typeConfig.label}
                            </Badge>
                            {item.version && (
                              <Badge variant="secondary" className="rounded-full">
                                {item.version}
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>

                          {item.details && (
                            <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-6 text-foreground">
                              {item.details}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span>Registrado em {new Date(item.createdAt).toLocaleString("pt-BR")}</span>
                            <span>Por {item.authorName || "Sistema"}</span>
                          </div>

                          <p className="text-xs font-medium text-primary">
                            Clique para ver o que foi modificado no codigo
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="webhook-logs" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="font-montserrat text-xl font-black">Logs do Stripe Webhook</CardTitle>
                  <CardDescription>Auditoria de eventos recebidos e processados pelo Stripe.</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={fetchWebhookLogs} className="rounded-xl">
                  <RefreshCw className={`h-4 w-4 ${logsLoading ? "animate-spin" : ""}`} />
                </Button>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
                  </div>
                ) : webhookLogs.length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground">Nenhum evento registrado ainda.</p>
                ) : (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Evento</th>
                          <th className="px-4 py-2 text-left font-semibold">Igreja</th>
                          <th className="px-4 py-2 text-left font-semibold">Status</th>
                          <th className="px-4 py-2 text-left font-semibold">Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {webhookLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-[10px] truncate max-w-[150px]">
                              {log.event_type}
                            </td>
                            <td className="px-4 py-3 truncate max-w-[150px]">
                              {log.church_subscriptions?.church_name || "-"}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={log.status === "processed" ? "outline" : "destructive"} className="text-[10px] py-0">
                                {log.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-[10px]">
                              {new Date(log.created_at).toLocaleString("pt-BR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="error-logs" className="space-y-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="font-montserrat text-xl font-black">Monitoramento de Erros</CardTitle>
                  <CardDescription>Erros capturados automaticamente no frontend em tempo real.</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={fetchErrorLogs} className="rounded-xl">
                  <RefreshCw className={`h-4 w-4 ${logsLoading ? "animate-spin" : ""}`} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {errorLogs.length === 0 ? (
                    <p className="text-center py-10 text-muted-foreground">Nenhum erro registrado.</p>
                  ) : (
                    errorLogs.map((log) => (
                      <Card key={log.id} className="border-border bg-muted/20">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="text-[10px]">ERROR</Badge>
                              <span className="text-xs font-bold font-mono">{log.churches?.name || "Global"}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
                          </div>
                          <p className="text-sm font-bold text-foreground mb-1">{log.error_message}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">{log.url}</p>
                          {log.stack_trace && (
                            <details className="mt-2">
                              <summary className="text-[10px] cursor-pointer text-primary font-bold">Ver Stack Trace</summary>
                              <pre className="mt-2 p-2 bg-black text-white text-[9px] overflow-auto max-h-40 rounded-lg">
                                {log.stack_trace}
                              </pre>
                            </details>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-montserrat text-xl font-black">
                  <DatabaseBackup className="h-5 w-5 text-primary" />
                  Backup completo do sistema
                </CardTitle>
                <CardDescription>
                  Gere pacotes de migracao com estrutura, dados, manifesto de storage e checklist para troca futura de banco.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-sm font-semibold text-foreground">Escopo do backup</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    A exportacao inclui igrejas, usuarios, turmas, progresso, agenda, mensagens, trilhas, push, auditoria e demais tabelas operacionais conhecidas.
                  </p>
                </div>
                <Button onClick={() => navigate("/exportar-dados")} className="rounded-xl">
                  Abrir exportacao e migracao
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="migration" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-montserrat text-xl font-black">
                  <Database className="h-5 w-5 text-primary" />
                  Arquivos de Migração Consolidada
                </CardTitle>
                <CardDescription>
                  Baixe os arquivos gerados para realizar a migração manual para um novo projeto Supabase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "schema.sql", label: "Estrutura (Schema)", icon: FileCode, color: "text-blue-500", description: "Tabelas, funções, triggers e policies." },
                    { name: "auth_data.sql", label: "Usuários (Auth)", icon: Lock, color: "text-orange-500", description: "Dados de usuários e perfis." },
                    { name: "public_data.sql", label: "Dados Públicos", icon: Database, color: "text-green-500", description: "Conteúdo das tabelas do schema public." },
                    { name: "storage_metadata.sql", label: "Metadados Storage", icon: Package, color: "text-purple-500", description: "Registro de arquivos nos buckets." },
                    { name: "storage_files.zip", label: "Arquivos Storage", icon: Package, color: "text-purple-500", description: "ZIP com os arquivos físicos dos buckets." },
                    { name: "edge_functions.zip", label: "Edge Functions", icon: FileCode, color: "text-cyan-500", description: "Código das funções personalizadas." },
                    { name: "secrets_required.txt", label: "Secrets", icon: ShieldCheck, color: "text-red-500", description: "Lista de chaves e variáveis necessárias." },
                    { name: "migration_order.txt", label: "Roteiro de Migração", icon: ListOrdered, color: "text-yellow-500", description: "Passo a passo da execução." },
                    { name: "validation_queries.sql", label: "Validação", icon: CheckCircle2, color: "text-emerald-500", description: "Queries para conferir a integridade." },
                  ].map((file) => (
                    <Card key={file.name} className="border-border hover:shadow-md transition-shadow group">
                      <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors ${file.color}`}>
                            <file.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-montserrat font-bold text-sm text-foreground">{file.label}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{file.name}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground flex-grow mb-4">
                          {file.description}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full rounded-xl gap-2 mt-auto"
                          asChild
                        >
                          <a href={`/migration-export/${file.name}`} download>
                            <FileDown className="h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedUpdate} onOpenChange={(open) => setSelectedUpdateId(open ? selectedUpdateId : null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          {selectedUpdate && (
            <>
              <DialogHeader>
                <DialogTitle className="font-montserrat text-2xl font-black text-foreground">
                  {selectedUpdate.title}
                </DialogTitle>
                <DialogDescription>
                  Detalhamento tecnico do que foi alterado no codigo nesta atualizacao.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`border ${UPDATE_TYPE_OPTIONS.find((option) => option.value === selectedUpdate.updateType)?.color ?? ""}`}>
                    {UPDATE_TYPE_OPTIONS.find((option) => option.value === selectedUpdate.updateType)?.label ?? selectedUpdate.updateType}
                  </Badge>
                  {selectedUpdate.version && (
                    <Badge variant="secondary" className="rounded-full">
                      {selectedUpdate.version}
                    </Badge>
                  )}
                </div>

                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="text-sm font-semibold text-foreground">Resumo</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{selectedUpdate.summary}</p>
                </div>

                {selectedUpdate.details && (
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="text-sm font-semibold text-foreground">Contexto</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{selectedUpdate.details}</p>
                  </div>
                )}

                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">O que foi modificado no codigo</p>
                  <div className="mt-3 space-y-3">
                    {selectedUpdate.codeChanges.map((change) => (
                      <div key={`${selectedUpdate.id}-${change.area}`} className="rounded-xl border border-border bg-muted/30 p-3">
                        <p className="font-mono text-xs font-semibold text-foreground">{change.area}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{change.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Registrado em {new Date(selectedUpdate.createdAt).toLocaleString("pt-BR")}</span>
                  <span>Por {selectedUpdate.authorName || "Sistema"}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
