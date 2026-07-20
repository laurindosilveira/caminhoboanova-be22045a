import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Bell, HelpCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { requestNotificationPermission } from "@/lib/notifications";
import { subscribeToWebPush, isWebPushSubscribed } from "@/lib/webPush";
import PushTroubleshootHelp from "@/components/home/PushTroubleshootHelp";

type BannerMode = "leader" | "automatic" | "blocked";

/**
 * Banner shown on the Jornada tab when the current device still does not
 * receive push notifications. Leader reminders always show immediately;
 * otherwise the banner appears periodically as an activation nudge.
 */
export default function PushActivationBanner() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<BannerMode>("automatic");
  const [reminderId, setReminderId] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const checkReminder = useCallback(async () => {
    setError("");
    if (!user || !isPushSupported()) {
      setVisible(false);
      return;
    }

    setPermission(Notification.permission);

    const alreadySubscribed = await isWebPushSubscribed();
    if (alreadySubscribed) {
      setVisible(false);
      return;
    }

    const { data } = await supabase
      .from("push_activation_reminders")
      .select("id")
      .eq("target_user_id", user.id)
      .is("dismissed_at", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setReminderId(data[0].id);
      setMode(Notification.permission === "denied" ? "blocked" : "leader");
      setVisible(true);
      return;
    }

    setReminderId(null);
    const snoozedUntil = Number(localStorage.getItem(getSnoozeKey(user.id)) || "0");
    if (Date.now() < snoozedUntil) {
      setVisible(false);
      return;
    }

    setMode(Notification.permission === "denied" ? "blocked" : "automatic");
    setVisible(true);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void checkReminder();
  }, [checkReminder, user]);

  async function handleActivate() {
    if (!user) return;
    if (Notification.permission === "denied") {
      setMode("blocked");
      setShowHelp(true);
      return;
    }

    setActivating(true);
    setError("");
    try {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setPermission(Notification.permission);
        setMode(Notification.permission === "denied" ? "blocked" : mode);
        setError(Notification.permission === "denied"
          ? "As notificacoes estao bloqueadas neste navegador."
          : "Voce ainda precisa permitir as notificacoes para este dispositivo.");
        return;
      }

      const { data: vapidData } = await supabase.functions.invoke("get-vapid-key");
      if (!vapidData?.publicKey) {
        setError("Nao foi possivel carregar a chave de notificacoes do servidor.");
        return;
      }

      const subscribed = await subscribeToWebPush(vapidData.publicKey);
      if (!subscribed) {
        setError("Nao foi possivel salvar a inscricao push deste dispositivo.");
        return;
      }

      await supabase.from("notification_preferences").upsert({
        user_id: user.id,
        master_enabled: true,
        devocional: true,
        eventos: true,
        streak: true,
        mensagens: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo",
      }, { onConflict: "user_id" });

      if (reminderId) {
        await supabase
          .from("push_activation_reminders")
          .update({ dismissed_at: new Date().toISOString() })
          .eq("id", reminderId);
      }

      localStorage.removeItem(getSnoozeKey(user.id));
      setPermission("granted");
      setVisible(false);
    } catch (err) {
      console.error("Failed to activate push:", err);
      setError("Nao foi possivel ativar agora. Tente novamente em instantes.");
    } finally {
      setActivating(false);
    }
  }

  async function handleDismiss() {
    if (reminderId) {
      await supabase
        .from("push_activation_reminders")
        .update({ dismissed_at: new Date().toISOString() })
        .eq("id", reminderId);
    } else if (user) {
      localStorage.setItem(getSnoozeKey(user.id), String(Date.now() + 3 * 24 * 60 * 60 * 1000));
    }
    setVisible(false);
  }

  if (!visible) {
    return <PushTroubleshootHelp open={showHelp} onClose={() => setShowHelp(false)} />;
  }

  const isBlocked = mode === "blocked" || permission === "denied";
  const title = isBlocked
    ? "Notificacoes bloqueadas"
    : mode === "leader"
      ? "Ative suas notificacoes"
      : "Receba lembretes da jornada";
  const message = isBlocked
    ? "Este navegador bloqueou as notificacoes. Veja como liberar e depois volte para ativar."
    : mode === "leader"
      ? "Seu lider pediu para voce ativar os avisos deste dispositivo para nao perder nada da jornada."
      : "Ative avisos de devocional, turma, eventos e mensagens importantes neste dispositivo.";

  return (
    <>
      <div className="mx-5 mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isBlocked ? "bg-destructive/10" : "bg-primary/10"
          }`}>
            {isBlocked ? (
              <AlertCircle className="w-5 h-5 text-destructive" />
            ) : (
              <Bell className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-montserrat font-black text-foreground text-sm uppercase tracking-tight">
                {title}
              </p>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar lembrete de notificacoes"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-muted-foreground font-inter text-xs mt-1 leading-relaxed">
              {message}
            </p>
            {error && (
              <p className="mt-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-[11px] font-inter text-destructive">
                {error}
              </p>
            )}
            <div className="mt-4">
              <button
                onClick={isBlocked ? () => setShowHelp(true) : handleActivate}
                disabled={activating}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-montserrat font-black disabled:opacity-50 transition-all shadow-md active:scale-95 ${
                  isBlocked ? "bg-destructive text-destructive-foreground" : "text-primary-foreground"
                }`}
                style={isBlocked ? undefined : { background: "var(--gradient-hero)" }}
              >
                {isBlocked ? <HelpCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                {isBlocked ? "VER COMO DESBLOQUEAR" : activating ? "ATIVANDO..." : "ATIVAR AGORA"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <PushTroubleshootHelp open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}

function isPushSupported() {
  return typeof window !== "undefined"
    && "Notification" in window
    && "serviceWorker" in navigator
    && "PushManager" in window;
}

function getSnoozeKey(userId: string) {
  return `caminho_push_activation_snoozed_until_${userId}`;
}
