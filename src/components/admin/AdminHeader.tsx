import { LogOut, ChevronLeft, RefreshCw, Zap, Church, AlertTriangle, CreditCard, BellOff, X } from "lucide-react";
import { isUnlimitedChurch } from "@/lib/planFeatures";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TurmaReportPDF from "./TurmaReportPDF";
import { useAuth } from "@/contexts/AuthContext";

type Stats = {
  total: number;
  avancados: number;
  semAtividade: number;
  mediaProgresso: number;
  totalLabel?: string;
};

type Props = {
  areaName: string;
  subtitle?: string | null;
  stats: Stats;
  onSignOut: () => void;
  onBackToUser: () => void;
  selectedCommunity?: string | null;
  onChangeCommunity?: () => void;
  participants?: any[];
  activities?: any[];
  turmaLabel?: string;
};

export default function AdminHeader({ areaName, subtitle, stats, onSignOut, onBackToUser, selectedCommunity, onChangeCommunity, participants, activities, turmaLabel }: Props) {
  const { role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [churchId, setChurchId] = useState<string | null>(null);
  const [isSnoozed, setIsSnoozed] = useState(false);

  useEffect(() => {
    async function checkTrial() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('church_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.church_id) {
        setChurchId(profile.church_id);
        const { data: sub } = await (supabase.from as any)('church_subscriptions')
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

            // Audit: alert shown (if not snoozed)
            if (days <= 5 && (!sub.trial_alert_snoozed_until || new Date(sub.trial_alert_snoozed_until) <= new Date())) {
              await supabase.rpc('log_church_audit', { 
                p_church_id: profile.church_id, 
                p_action: 'trial_alert_shown',
                p_details: { days_left: days }
              });
            }
          }
        }
      }
    }
    checkTrial();
  }, []);
  
  const handleSnooze = async () => {
    if (!churchId) return;
    const snoozeUntil = new Date();
    snoozeUntil.setHours(snoozeUntil.getHours() + 24);

    const { error } = await (supabase.from as any)('church_subscriptions')
      .update({ trial_alert_snoozed_until: snoozeUntil.toISOString() })
      .eq('church_id', churchId);

    if (!error) {
      setIsSnoozed(true);
      await supabase.rpc('log_church_audit', { 
        p_church_id: churchId, 
        p_action: 'alert_snoozed',
        p_details: { until: snoozeUntil.toISOString() }
      });
      toast({ title: "Aviso ocultado", description: "O banner aparecerá novamente em 24h." });
    }
  };

  const handleCancelTrial = async () => {
    if (!churchId) return;
    try {
      await supabase.rpc('log_church_audit', { 
        p_church_id: churchId, 
        p_action: 'portal_opened_for_cancel'
      });
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
            <p className="text-xs font-inter font-bold leading-tight truncate">
              {trialDaysLeft <= 0 
                ? "Seu período de teste vence hoje!" 
                : `Teste vence em ${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia' : 'dias'}.`}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button 
              size="sm" 
              variant="secondary" 
              className="h-7 px-2 text-[10px] font-bold rounded-lg bg-white text-[#f59e0b] hover:bg-white/90"
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

      <header className="px-4 pt-8 pb-5" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onBackToUser}
            className="flex items-center gap-1.5 text-primary-foreground/70 font-inter text-xs mb-3 hover:text-primary-foreground transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Voltar para área geral
          </button>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center">
                <span className="text-xl">✝️</span>
              </div>
              <div>
                <p className="text-primary-foreground/60 font-inter text-xs font-bold uppercase tracking-widest">CAMINHO DO DISCIPULADO</p>
                <h1 className="font-montserrat font-black text-primary-foreground text-lg">{areaName}</h1>
                {subtitle && <p className="text-primary-foreground/60 font-inter text-xs mt-0.5">📍 {subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {role === "admin" && (
                <button
                  onClick={() => navigate("/minha-igreja")}
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20"
                  title="Gestão da Igreja e Assinatura"
                >
                  <Church className="w-5 h-5 text-primary-foreground" />
                </button>
              )}
              {role === "admin" && (
                <button
                  onClick={handleForceRefresh}
                  className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30"
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
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
                  title="Trocar turma"
                >
                  <RefreshCw className="w-4.5 h-4.5 text-primary-foreground" style={{ width: 18, height: 18 }} />
                </button>
              )}
              <button
                onClick={onSignOut}
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
                title="Sair"
              >
                <LogOut className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Participantes", value: stats.totalLabel || stats.total, icon: "👥" },
              { label: "Avançados", value: stats.avancados, icon: "🏆" },
              { label: "Sem atividade", value: stats.semAtividade, icon: "⚠️" },
              { label: "Progresso médio", value: `${stats.mediaProgresso}%`, icon: "📊" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-2.5 text-center">
                <span className="text-lg">{s.icon}</span>
                <p className="font-montserrat font-black text-primary-foreground text-lg leading-none mt-1">{s.value}</p>
                <p className="text-primary-foreground/50 text-[10px] font-inter mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}