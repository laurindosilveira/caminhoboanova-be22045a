import { useState, useEffect } from "react";
import { Bell, BellOff, BookOpen, CalendarDays, Flame, ChevronDown, ChevronUp, MessageSquare, AlertCircle, Send, Wifi } from "lucide-react";
import { requestNotificationPermission, isNotificationEnabled, sendNotification } from "@/lib/notifications";
import { subscribeToWebPush, unsubscribeFromWebPush, isWebPushSubscribed } from "@/lib/webPush";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type NotifPrefs = {
  devocional: boolean;
  eventos: boolean;
  streak: boolean;
  mensagens: boolean;
};

const defaultPrefs: NotifPrefs = {
  devocional: true,
  eventos: true,
  streak: true,
  mensagens: true,
};

const NOTIF_OPTIONS = [
  { key: "devocional" as const, label: "Devocional diário", desc: "Lembrete às 7h para o devocional", icon: BookOpen, color: "text-brand-green" },
  { key: "eventos" as const, label: "Eventos e encontros", desc: "Avisos de eventos próximos", icon: CalendarDays, color: "text-primary" },
  { key: "streak" as const, label: "Risco de perder sequência", desc: "Alerta quando sua sequência está em risco", icon: Flame, color: "text-secondary" },
  { key: "mensagens" as const, label: "Mensagens do pastor", desc: "Novas mensagens e comunicados", icon: MessageSquare, color: "text-accent-foreground" },
];

export default function NotificationSettings() {
  const { user } = useAuth();
  const [masterOn, setMasterOn] = useState(false);
  const [prefs, setPrefs] = useState<NotifPrefs>(defaultPrefs);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  // Load prefs from DB
  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (data) {
        setMasterOn(data.master_enabled);
        setPrefs({
          devocional: data.devocional,
          eventos: data.eventos,
          streak: data.streak,
          mensagens: data.mensagens,
        });
      } else {
        // Check localStorage for existing state and use browser permission
        setMasterOn(isNotificationEnabled());
      }
      // Check Web Push status
      const isPushSub = await isWebPushSubscribed();
      setPushSubscribed(isPushSub);
      setLoading(false);
    }
    load();
  }, [user]);

  if (!("Notification" in window) || loading) return null;

  const activeCount = masterOn ? Object.values(prefs).filter(Boolean).length : 0;

  async function saveToDb(master: boolean, newPrefs: NotifPrefs) {
    if (!user) return;
    const payload = {
      user_id: user.id,
      master_enabled: master,
      devocional: newPrefs.devocional,
      eventos: newPrefs.eventos,
      streak: newPrefs.streak,
      mensagens: newPrefs.mensagens,
    };
    await supabase
      .from("notification_preferences")
      .upsert(payload, { onConflict: "user_id" });
  }

  async function handleToggleMaster() {
    if (masterOn) {
      setMasterOn(false);
      localStorage.setItem("caminho_notifications_enabled", "false");
      setExpanded(false);
      setPermissionError(false);
      await saveToDb(false, prefs);
    } else {
      setPermissionError(false);
      setMasterOn(true);
      localStorage.setItem("caminho_notifications_enabled", "true");
      setExpanded(true);
      await saveToDb(true, prefs);
      try {
        const granted = await requestNotificationPermission();
        if (granted) {
          // Subscribe to Web Push for background notifications
          await trySubscribeWebPush();
        } else if (Notification.permission === "denied") {
          setPermissionError(true);
        }
      } catch {
        setPermissionError(true);
      }
    }
  }

  async function trySubscribeWebPush() {
    try {
      const { data } = await supabase.functions.invoke("get-vapid-key");
      if (data?.publicKey) {
        const success = await subscribeToWebPush(data.publicKey);
        setPushSubscribed(success);
      }
    } catch (err) {
      console.warn("Web Push subscription failed:", err);
    }
  }

  async function handleTestNotification() {
    await sendNotification(
      "🔔 Teste de Notificação",
      "Se você está vendo isso, as notificações estão funcionando! 🎉"
    );
  }

  async function handleTogglePref(key: keyof NotifPrefs) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    await saveToDb(masterOn, updated);
  }

  return (
    <div className="px-5 mt-3">
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <button
          onClick={() => {
            if (!masterOn) {
              handleToggleMaster();
            } else {
              setExpanded(!expanded);
            }
          }}
          className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${masterOn ? "bg-brand-green/15" : "bg-muted"}`}>
            {masterOn ? (
              <Bell className="w-5 h-5 text-brand-green" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="text-left flex-1">
            <p className="font-montserrat font-bold text-foreground text-sm">
              {masterOn ? "Notificações" : "Ativar notificações"}
            </p>
            <p className="text-muted-foreground text-xs font-inter">
              {masterOn
                ? `${activeCount} de ${NOTIF_OPTIONS.length} ativas`
                : "Receba lembretes e avisos importantes"}
            </p>
          </div>
          {masterOn ? (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full text-[10px] font-inter font-bold bg-brand-green/15 text-brand-green">
                ON
              </span>
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          ) : (
            <span className="px-2 py-1 rounded-full text-[10px] font-inter font-bold bg-muted text-muted-foreground">
              OFF
            </span>
          )}
        </button>

        {masterOn && expanded && (
          <div className="border-t border-border animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Permission error banner */}
            {permissionError && (
              <div className="mx-4 mt-3 mb-1 p-3 rounded-xl bg-accent/20 border border-accent/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-inter text-xs font-bold text-foreground mb-1">Não foi possível ativar as notificações</p>
                    <p className="font-inter text-[11px] text-muted-foreground leading-relaxed">
                      O Android bloqueia permissões quando há sobreposições de outros apps. Para resolver:
                    </p>
                    <ul className="font-inter text-[11px] text-muted-foreground mt-1.5 space-y-1 list-none">
                      <li>📱 Feche <strong>bolhas flutuantes</strong> (Messenger, WhatsApp)</li>
                      <li>🌙 Desative <strong>filtros de tela</strong> (modo noturno, Twilight)</li>
                      <li>🎥 Feche <strong>gravadores de tela</strong></li>
                      <li>🔄 Depois, tente ativar novamente</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {NOTIF_OPTIONS.map(({ key, label, desc, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => handleTogglePref(key)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border last:border-b-0"
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${prefs[key] ? color : "text-muted-foreground"}`} />
                <div className="text-left flex-1">
                  <p className={`font-inter text-sm ${prefs[key] ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
                  <p className="text-muted-foreground text-[10px] font-inter">{desc}</p>
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-colors ${prefs[key] ? "bg-brand-green" : "bg-muted"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${prefs[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </button>
            ))}

            {/* Web Push status */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Wifi className={`w-4 h-4 flex-shrink-0 ${pushSubscribed ? "text-brand-green" : "text-muted-foreground"}`} />
              <div className="text-left flex-1">
                <p className={`font-inter text-sm ${pushSubscribed ? "text-foreground" : "text-muted-foreground"}`}>
                  Notificações em segundo plano
                </p>
                <p className="text-muted-foreground text-[10px] font-inter">
                  {pushSubscribed
                    ? "✅ Ativo — você receberá avisos mesmo com o app fechado"
                    : "Ative para receber avisos com o app fechado"}
                </p>
              </div>
              {!pushSubscribed && (
                <button
                  onClick={trySubscribeWebPush}
                  className="px-3 py-1 rounded-full text-[10px] font-inter font-bold bg-brand-green/15 text-brand-green hover:bg-brand-green/25 transition-colors"
                >
                  Ativar
                </button>
              )}
            </div>

            {/* Test notification button */}
            <button
              onClick={handleTestNotification}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-inter font-bold text-brand-green hover:bg-brand-green/5 transition-colors border-b border-border"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar notificação de teste
            </button>

            <button
              onClick={handleToggleMaster}
              className="w-full py-2.5 text-center text-xs font-inter text-destructive hover:bg-destructive/5 transition-colors"
            >
              Desativar todas as notificações
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
