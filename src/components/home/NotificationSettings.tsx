import { useState } from "react";
import { Bell, BellOff, BookOpen, CalendarDays, Flame, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { requestNotificationPermission, isNotificationEnabled, scheduleDailyReminder } from "@/lib/notifications";

const PREF_KEY = "caminho_notification_prefs";

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

function loadPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (raw) return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {}
  return defaultPrefs;
}

function savePrefs(prefs: NotifPrefs) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

const NOTIF_OPTIONS = [
  { key: "devocional" as const, label: "Devocional diário", desc: "Lembrete às 7h para o devocional", icon: BookOpen, color: "text-brand-green" },
  { key: "eventos" as const, label: "Eventos e encontros", desc: "Avisos de eventos próximos", icon: CalendarDays, color: "text-primary" },
  { key: "streak" as const, label: "Risco de perder sequência", desc: "Alerta quando sua sequência está em risco", icon: Flame, color: "text-secondary" },
  { key: "mensagens" as const, label: "Mensagens do pastor", desc: "Novas mensagens e comunicados", icon: MessageSquare, color: "text-accent-foreground" },
];

export default function NotificationSettings() {
  const [masterOn, setMasterOn] = useState(isNotificationEnabled());
  const [prefs, setPrefs] = useState<NotifPrefs>(loadPrefs);
  const [expanded, setExpanded] = useState(false);

  if (!("Notification" in window)) return null;

  const activeCount = masterOn ? Object.values(prefs).filter(Boolean).length : 0;

  async function handleToggleMaster() {
    if (masterOn) {
      setMasterOn(false);
      localStorage.setItem("caminho_notifications_enabled", "false");
      setExpanded(false);
    } else {
      const granted = await requestNotificationPermission();
      setMasterOn(granted);
      if (granted) {
        scheduleDailyReminder();
        setExpanded(true);
      }
    }
  }

  function handleTogglePref(key: keyof NotifPrefs) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    savePrefs(updated);
  }

  return (
    <div className="px-5 mt-3">
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Master toggle header */}
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

        {/* Expanded options */}
        {masterOn && expanded && (
          <div className="border-t border-border animate-in fade-in slide-in-from-top-1 duration-200">
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

            {/* Turn off all */}
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
