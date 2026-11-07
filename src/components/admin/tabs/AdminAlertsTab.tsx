import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Heart, MessageCircle, RefreshCw, TrendingDown, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type AlertRow = {
  care_reasons: string[];
  care_status: string;
  community: string | null;
  full_name: string;
  needs_pastor: boolean;
  phone: string | null;
  user_id: string;
};

type Props = {
  area: string | null;
  churchId: string | null;
  turmaId: string | null;
};

type AlertFilter = "all" | "critical" | "attention" | "pastoral";

function whatsappUrl(phone: string | null) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (!digits) return null;
  return `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`;
}

export default function AdminAlertsTab({ area, churchId, turmaId }: Props) {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AlertFilter>("all");

  const fetchAlerts = useCallback(async () => {
    if (!churchId) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const args: { p_area?: string; p_church_id?: string; p_turma_id?: string } = {
      p_church_id: churchId,
    };
    if (turmaId) args.p_turma_id = turmaId;
    if (area && !turmaId) args.p_area = area;

    const { data, error } = await supabase.rpc("get_leader_care_dashboard", args);
    if (error) {
      toast({ title: "Nao foi possivel carregar os alertas", description: error.message, variant: "destructive" });
      setAlerts([]);
    } else {
      setAlerts((data ?? []).filter((member) => member.care_status !== "healthy"));
    }
    setLoading(false);
  }, [area, churchId, toast, turmaId]);

  useEffect(() => {
    void fetchAlerts();
  }, [fetchAlerts]);

  const visibleAlerts = useMemo(() => alerts.filter((alert) => {
    if (filter === "all") return true;
    if (filter === "pastoral") return alert.needs_pastor;
    return alert.care_status === filter;
  }), [alerts, filter]);

  const criticalCount = alerts.filter((alert) => alert.care_status === "critical").length;
  const attentionCount = alerts.filter((alert) => alert.care_status === "attention").length;
  const pastoralCount = alerts.filter((alert) => alert.needs_pastor).length;

  if (loading) {
    return <div className="h-72 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-montserrat text-xl font-black text-foreground">Central de alertas</h2>
          <p className="mt-1 text-sm text-muted-foreground">Os mesmos criterios unificados do acompanhamento da turma.</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => void fetchAlerts()} title="Atualizar alertas">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 border-y border-border">
        <Summary icon={AlertTriangle} label="Criticos" value={criticalCount} iconClass="text-red-600" />
        <Summary icon={TrendingDown} label="Atencao" value={attentionCount} iconClass="text-amber-600" />
        <Summary icon={Heart} label="Pastoral" value={pastoralCount} iconClass="text-rose-600" />
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border pb-3">
        {([
          ["all", "Todos"],
          ["critical", "Criticos"],
          ["attention", "Atencao"],
          ["pastoral", "Pedido pastoral"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold ${filter === value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {visibleAlerts.length === 0 ? (
        <div className="py-14 text-center">
          <Heart className="mx-auto h-8 w-8 text-emerald-600" />
          <p className="mt-3 text-sm font-bold text-foreground">Nenhum alerta neste filtro</p>
          <p className="mt-1 text-xs text-muted-foreground">Nao ha sinais que exijam acao agora.</p>
        </div>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {visibleAlerts.map((alert) => {
            const whatsapp = whatsappUrl(alert.phone);
            return (
              <article key={alert.user_id} className="flex items-start gap-3 py-4">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${alert.care_status === "critical" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                  {alert.needs_pastor ? <Heart className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{alert.full_name}</h3>
                    <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${alert.care_status === "critical" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                      {alert.care_status === "critical" ? "Critico" : "Atencao"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{alert.community || "Sem comunidade"}</p>
                  <ul className="mt-2 space-y-1">
                    {alert.care_reasons.slice(0, 3).map((reason) => <li key={reason} className="text-sm text-foreground">{reason}</li>)}
                  </ul>
                </div>
                {whatsapp && (
                  <Button asChild variant="ghost" size="icon" className="text-emerald-700">
                    <a href={whatsapp} target="_blank" rel="noreferrer" title="Abrir WhatsApp">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Summary({ icon: Icon, iconClass, label, value }: { icon: typeof AlertTriangle; iconClass: string; label: string; value: number }) {
  return (
    <div className="flex min-h-20 items-center justify-center gap-2 border-r border-border px-2 py-3 last:border-r-0">
      <Icon className={`h-4 w-4 ${iconClass}`} />
      <div><p className="font-montserrat text-lg font-black text-foreground">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
    </div>
  );
}
