import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { requestNotificationPermission } from "@/lib/notifications";
import { subscribeToWebPush, isWebPushSubscribed } from "@/lib/webPush";

/**
 * Banner shown on the Jornada tab when an admin/leader
 * has sent a push activation reminder to this user.
 * Includes a one-tap "Ativar notificacoes" button.
 */
export default function PushActivationBanner() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [reminderId, setReminderId] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkReminder();
  }, [user]);

  async function checkReminder() {
    const alreadySubscribed = await isWebPushSubscribed();
    if (alreadySubscribed) {
      setVisible(false);
      return;
    }

    const { data } = await supabase
      .from("push_activation_reminders" as any)
      .select("id")
      .eq("target_user_id", user!.id)
      .is("dismissed_at", null)
      .limit(1);

    if (data && data.length > 0) {
      setReminderId((data[0] as any).id);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }

  async function handleActivate() {
    setActivating(true);
    try {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setActivating(false);
        return;
      }

      const { data: vapidData } = await supabase.functions.invoke("get-vapid-key");
      if (vapidData?.publicKey) {
        await subscribeToWebPush(vapidData.publicKey);
      }

      await supabase.from("notification_preferences").upsert({
        user_id: user!.id,
        master_enabled: true,
        devocional: true,
        eventos: true,
        streak: true,
        mensagens: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo",
      }, { onConflict: "user_id" });

      if (reminderId) {
        await supabase
          .from("push_activation_reminders" as any)
          .update({ dismissed_at: new Date().toISOString() } as any)
          .eq("id", reminderId);
      }

      setVisible(false);
    } catch (err) {
      console.error("Failed to activate push:", err);
    } finally {
      setActivating(false);
    }
  }

  async function handleDismiss() {
    if (reminderId) {
      await supabase
        .from("push_activation_reminders" as any)
        .update({ dismissed_at: new Date().toISOString() } as any)
        .eq("id", reminderId);
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mx-5 mt-6 rounded-3xl border border-primary/20 bg-primary/5 p-5 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-montserrat font-black text-foreground text-sm uppercase tracking-tight">
              Ative suas notificações
            </p>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-muted-foreground font-inter text-xs mt-1 leading-relaxed">
            Seu líder pediu para você ativar as notificações para não perder nada da jornada.
          </p>
          <div className="mt-4">
            <button
              onClick={handleActivate}
              disabled={activating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-montserrat font-black text-primary-foreground disabled:opacity-50 transition-all shadow-md active:scale-95"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Bell className="w-4 h-4" />
              {activating ? "ATIVANDO..." : "ATIVAR AGORA"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
