import { LogOut, ChevronLeft, RefreshCw, Zap, Church, AlertTriangle, BellOff, Users, CircleCheck, CircleAlert } from "lucide-react";
import { isUnlimitedChurch } from "@/lib/planFeatures";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TurmaReportPDF from "./TurmaReportPDF";
import { useAuth } from "@/contexts/AuthContext";
import CircularProgressBar from "@/components/ui/CircularProgressBar";

type Stats = {
  total: number;
  avancados: number;
  semAtividade: number;
  mediaProgresso: number;
  totalLabel?: string;
  memberLimit?: number | null;
};

type ReportParticipant = {
  area: string;
  birth_date: string;
  community: string;
  completed_activity_ids: string[];
  completed_count: number;
  full_name: string;
  phone: string;
  user_id: string;
};

type ReportActivity = {
  id: string;
  order_num: number;
  points: number;
  subtitle: string | null;
  title: string;
  type: string;
};

type Props = {
  areaName: string;
  subtitle?: string | null;
  stats: Stats;
  onSignOut: () => void;
  onBackToUser: () => void;
  selectedCommunity?: string | null;
  onChangeCommunity?: () => void;
  participants?: ReportParticipant[];
  activities?: ReportActivity[];
  turmaLabel?: string;
};

export default function AdminHeader({ areaName, subtitle, stats, onSignOut, onBackToUser, selectedCommunity, onChangeCommunity, participants, activities, turmaLabel }: Props) {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [churchId, setChurchId] = useState<string | null>(null);
  const [isSnoozed, setIsSnoozed] = useState(false);

  useEffect(() => {
    async function checkTrial() {
      if (!user) return;
      const isUnlimited = isUnlimitedChurch(null, user.email);
      if (isUnlimited) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('church_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.church_id) {
        setChurchId(profile.church_id);
        const { data: sub } = await supabase.from('church_subscriptions')
          .select('subscription_status, trial_ends_at, trial_alert_snoozed_until')
          .eq('church_id', profile.church_id)
          .single();
        
        if (sub && (sub.subscription_status === 'trial' || sub.subscription_status === 'pending_checkout')) {
          // Check if snoozed
          if (sub.trial_alert_snoozed_until && new Date(sub.trial_alert_snoozed_until) > new Date()) {
            setIsSnoozed(true);
          }

          if (sub.trial_ends_at) {
            const days = Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            setTrialDaysLeft(days);

          }
        }
      }
    }
    void checkTrial();
  }, [user]);
  
  const handleSnooze = async () => {
    if (!churchId) return;
    const snoozeUntil = new Date();
    snoozeUntil.setHours(snoozeUntil.getHours() + 24);

    const { error } = await supabase.from('church_subscriptions')
      .update({ trial_alert_snoozed_until: snoozeUntil.toISOString() })
      .eq('church_id', churchId);

    if (!error) {
      setIsSnoozed(true);
      toast({ title: "Aviso ocultado", description: "O banner aparecerá novamente em 24h." });
    }
  };

  const handleCancelTrial = async () => {
    if (!churchId) return;
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível abrir o portal.", variant: "destructive" });
    }
  };

  const handleForceRefresh = async () => {
    if (window.confirm("Isso irá forçar a limpeza do cache e recarregar o aplicativo. Deseja continuar?")) {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
        }
      }
      
      window.location.reload();
    }
  };

  return (
    <>
      {/* Alerta de Trial */}
      {trialDaysLeft !== null && trialDaysLeft <= 5 && !isSnoozed && (
        <div className="bg-[#f59e0b] text-white px-4 py-2.5 flex items-center justify-between gap-3 sticky top-0 z-[50] animate-in fade-in slide-in-from-top duration-500 shadow-lg">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="truncate font-inter text-xs font-bold leading-tight">
              {trialDaysLeft <= 0 
                ? "Seu período de teste vence hoje!" 
                : `Teste vence em ${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia' : 'dias'}.`}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button 
              size="sm" 
              variant="secondary" 
              className="h-8 rounded-md bg-white px-3 text-xs font-bold text-[#b45309] hover:bg-white/90"
              onClick={handleCancelTrial}
            >
              Cancelar
            </Button>
            <button 
              onClick={handleSnooze}
              className="p-1 hover:bg-white/20 rounded-md transition-colors"
              title="Sonecar por 24h"
            >
              <BellOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <header className="bg-slate-950 px-4 pb-5 pt-6 sm:px-6">
        <div className="mx-auto max-w-[1440px]">
          <button
            onClick={onBackToUser}
            className="mb-3 flex items-center gap-1.5 font-inter text-xs text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Voltar para visão geral
          </button>

          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-orange-200/30 bg-orange-300/10">
                <Church className="h-5 w-5 text-orange-200" />
              </div>
              <div className="min-w-0">
                <p className="font-inter text-xs font-bold uppercase tracking-widest text-white/60">Caminho 3M</p>
                <h1 className="break-words font-montserrat text-lg font-black leading-tight text-white sm:text-xl">{areaName}</h1>
                {subtitle && <p className="mt-1 truncate font-inter text-xs text-white/60">{subtitle}</p>}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              {role === "admin" && (
                <button
                  onClick={() => navigate("/minha-igreja")}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  title="Gestão da Igreja e Assinatura"
                >
                  <Church className="w-5 h-5 text-primary-foreground" />
                </button>
              )}
              {role === "admin" && (
                <button
                  onClick={handleForceRefresh}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  title="Limpar Cache e Recarregar"
                >
                  <Zap className="w-4.5 h-4.5 text-amber-400" />
                </button>
              )}
              {participants && activities && participants.length > 0 && (
                <TurmaReportPDF
                  participants={participants}
                  activities={activities}
                  turmaName={turmaLabel || areaName}
                />
              )}
              {selectedCommunity && onChangeCommunity && (
                <button
                  onClick={onChangeCommunity}
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  title="Trocar turma"
                >
                  <RefreshCw className="w-4.5 h-4.5 text-primary-foreground" style={{ width: 18, height: 18 }} />
                </button>
              )}
              <button
                onClick={onSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                title="Sair"
              >
                <LogOut className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-y border-white/15 py-4 sm:grid-cols-3 lg:grid-cols-[1.15fr_.8fr_1.35fr]">
            {/* Total de Participantes */}
            <div className="px-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 shrink-0 text-cyan-300" />
                  <p className="font-inter text-xs font-semibold text-white/70">Ocupação da turma</p>
                </div>
                <p className="font-montserrat text-lg font-black leading-none text-white">{stats.totalLabel || stats.total}</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Ocupação da turma" aria-valuemin={0} aria-valuemax={stats.memberLimit ?? Math.max(stats.total, 1)} aria-valuenow={stats.total}>
                <div className="h-full rounded-full bg-cyan-300 transition-[width] duration-500" style={{ width: `${stats.memberLimit ? Math.min(100, (stats.total / stats.memberLimit) * 100) : stats.total > 0 ? 100 : 0}%` }} />
              </div>
              <p className="mt-1.5 font-inter text-[11px] text-white/50">
                {stats.memberLimit ? `${Math.max(stats.memberLimit - stats.total, 0)} vaga${stats.memberLimit - stats.total === 1 ? "" : "s"} disponível${stats.memberLimit - stats.total === 1 ? "" : "is"}` : `${stats.total} participante${stats.total === 1 ? "" : "s"}`}
              </p>
            </div>

            {/* Progresso Médio */}
            <div className="flex items-center justify-center gap-3 border-white/15 px-3 sm:border-x">
                <CircularProgressBar progress={stats.mediaProgresso} />
                <div><p className="font-inter text-xs font-semibold leading-tight text-white/70">Progresso médio</p><p className="mt-1 text-[11px] text-white/50">da turma</p></div>
            </div>

            {/* Status dos Participantes */}
            <div className="grid grid-cols-2 gap-2 px-3">
              <div className="flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2.5">
                <CircleCheck className="h-5 w-5 shrink-0 text-emerald-300" />
                <div><p className="font-montserrat text-lg font-black leading-none text-white">{stats.avancados}</p><p className="mt-1 text-[11px] text-emerald-100/70">Avançados</p></div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-400/10 px-3 py-2.5">
                <CircleAlert className="h-5 w-5 shrink-0 text-amber-300" />
                <div><p className="font-montserrat text-lg font-black leading-none text-white">{stats.semAtividade}</p><p className="mt-1 text-[11px] text-amber-100/70">Em alerta</p></div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
