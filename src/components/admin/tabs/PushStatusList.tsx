import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle,
  Copy,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PushUser {
  user_id: string;
  full_name: string;
  community: string;
  area: string;
  phone: string | null;
  whatsapp_number: string | null;
  has_push: boolean;
  endpoint_count: number;
  reminder_sent: boolean;
  last_activity_at: string | null;
  last_activity_label: string;
  days_inactive: number | null;
}

interface Props {
  adminArea?: AreaName | string;
}

type Filter = "all" | "active" | "inactive" | "attention";
type AreaName = Database["public"]["Enums"]["area_name"];

type ProfileRow = {
  user_id: string;
  full_name: string;
  community: string;
  area: string;
  phone: string | null;
  whatsapp_number: string | null;
  is_active: boolean | null;
};

type PushSubscriptionRow = {
  user_id: string;
  endpoint: string;
};

type UserRoleRow = {
  user_id: string;
  role: string;
};

type ReminderRow = {
  target_user_id: string;
  dismissed_at: string | null;
  created_at: string;
};

type CompletedActivityRow = {
  user_id: string;
  completed_at: string | null;
};

type LessonActivityRow = {
  user_id: string;
  completed_at: string | null;
  updated_at: string | null;
  created_at: string | null;
  is_completed: boolean | null;
};

type AttendanceActivityRow = {
  user_id: string;
  created_at: string | null;
  user_requested_at: string | null;
  leader_confirmed_at: string | null;
};

type WorshipActivityRow = {
  user_id: string;
  created_at: string | null;
  reviewed_at: string | null;
  worship_date: string | null;
};

export default function PushStatusList({ adminArea }: Props) {
  const [users, setUsers] = useState<PushUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("attention");
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const profilesQuery = supabase
        .from("profiles")
        .select("user_id, full_name, community, area, phone, whatsapp_number, created_at, updated_at, is_active");

      if (adminArea) {
        profilesQuery.eq("area", adminArea as AreaName);
      }

      const [
        profiles,
        subs,
        roles,
        reminders,
        userProgress,
        devotionalProgress,
        lessonProgress,
        attendance,
        worshipAttendance,
      ] = await Promise.all([
        fetchRows<ProfileRow>("profiles", profilesQuery),
        fetchRows<PushSubscriptionRow>("push_subscriptions", supabase.from("push_subscriptions").select("user_id, endpoint")),
        fetchRows<UserRoleRow>("user_roles", supabase.from("user_roles").select("user_id, role")),
        fetchRows<ReminderRow>(
          "push_activation_reminders",
          supabase
            .from("push_activation_reminders")
            .select("target_user_id, dismissed_at, created_at")
            .is("dismissed_at", null)
        ),
        fetchRows<CompletedActivityRow>("user_progress", supabase.from("user_progress").select("user_id, completed_at")),
        fetchRows<CompletedActivityRow>("devotional_progress", supabase.from("devotional_progress").select("user_id, completed_at")),
        fetchRows<LessonActivityRow>("lesson_progress", supabase.from("lesson_progress").select("user_id, completed_at, updated_at, created_at, is_completed")),
        fetchRows<AttendanceActivityRow>("attendance", supabase.from("attendance").select("user_id, created_at, user_requested_at, leader_confirmed_at")),
        fetchRows<WorshipActivityRow>("worship_attendance", supabase.from("worship_attendance").select("user_id, created_at, reviewed_at, worship_date")),
      ]);

      const adminIds = new Set(
        roles
          .filter(r => r.role === "admin" || r.role === "lider")
          .map(r => r.user_id)
      );

      const subMap = new Map<string, number>();
      subs.forEach(s => {
        subMap.set(s.user_id, (subMap.get(s.user_id) ?? 0) + 1);
      });

      const activityMap = new Map<string, { at: string; label: string }>();
      const rememberActivity = (userId: string, at: string | null | undefined, label: string) => {
        if (!userId || !at || Number.isNaN(new Date(at).getTime())) return;
        const current = activityMap.get(userId);
        if (!current || new Date(at).getTime() > new Date(current.at).getTime()) {
          activityMap.set(userId, { at, label });
        }
      };

      userProgress.forEach(row => rememberActivity(row.user_id, row.completed_at, "atividade"));
      devotionalProgress.forEach(row => rememberActivity(row.user_id, row.completed_at, "devocional"));
      lessonProgress.forEach(row => {
        rememberActivity(
          row.user_id,
          row.completed_at ?? row.updated_at ?? row.created_at,
          row.is_completed ? "licao concluida" : "licao iniciada"
        );
      });
      attendance.forEach(row => {
        rememberActivity(row.user_id, row.leader_confirmed_at ?? row.user_requested_at ?? row.created_at, "presenca");
      });
      worshipAttendance.forEach(row => {
        rememberActivity(row.user_id, row.reviewed_at ?? row.created_at ?? row.worship_date, "adoracao");
      });

      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const reminderSet = new Set(
        reminders
          .filter((r) => now - new Date(r.created_at).getTime() < twentyFourHours)
          .map((r) => r.target_user_id)
      );

      const result: PushUser[] = profiles
        .filter(p => !adminIds.has(p.user_id))
        .filter(p => p.is_active !== false)
        .map(p => {
          const activity = activityMap.get(p.user_id) ?? null;
          const daysInactive = activity ? getDaysSince(activity.at) : null;
          return {
            user_id: p.user_id,
            full_name: p.full_name,
            community: p.community,
            area: p.area,
            phone: p.phone,
            whatsapp_number: p.whatsapp_number,
            has_push: subMap.has(p.user_id),
            endpoint_count: subMap.get(p.user_id) ?? 0,
            reminder_sent: reminderSet.has(p.user_id),
            last_activity_at: activity?.at ?? null,
            last_activity_label: activity ? formatActivityLabel(activity.label, daysInactive) : "Sem atividade registrada",
            days_inactive: daysInactive,
          };
        })
        .sort((a, b) => {
          const priorityDiff = getPriorityScore(b) - getPriorityScore(a);
          if (priorityDiff !== 0) return priorityDiff;
          const inactiveDiff = (b.days_inactive ?? 9999) - (a.days_inactive ?? 9999);
          if (inactiveDiff !== 0) return inactiveDiff;
          return a.full_name.localeCompare(b.full_name);
        });

      setUsers(result);
    } catch (err) {
      console.error("Failed to fetch push status:", err);
      toast({ title: "Erro", description: "Nao foi possivel carregar o status push.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [adminArea, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  async function handleSendReminder(userId: string) {
    setSendingReminder(userId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("push_activation_reminders").insert({
        target_user_id: userId,
        sent_by: user.id,
      });

      if (error) throw error;

      setUsers(prev => prev.map(u =>
        u.user_id === userId ? { ...u, reminder_sent: true } : u
      ));
      toast({ title: "Lembrete enviado", description: "O aluno vera um aviso para ativar notificacoes." });
    } catch (err: unknown) {
      toast({ title: "Erro", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSendingReminder(null);
    }
  }

  async function handleSendAllReminders() {
    const inactiveWithoutReminder = users.filter(u => !u.has_push && !u.reminder_sent);
    if (inactiveWithoutReminder.length === 0) return;

    setSendingReminder("all");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const rows = inactiveWithoutReminder.map(u => ({
        target_user_id: u.user_id,
        sent_by: user.id,
      }));

      const { error } = await supabase.from("push_activation_reminders").insert(rows);
      if (error) throw error;

      setUsers(prev => prev.map(u =>
        !u.has_push ? { ...u, reminder_sent: true } : u
      ));
      toast({ title: "Lembretes enviados", description: `${inactiveWithoutReminder.length} aluno(s) receberao o aviso no app.` });
    } catch (err: unknown) {
      toast({ title: "Erro", description: getErrorMessage(err), variant: "destructive" });
    } finally {
      setSendingReminder(null);
    }
  }

  async function handleCopyTutorial(user: PushUser) {
    try {
      await navigator.clipboard.writeText(buildActivationMessage(user));
      toast({ title: "Tutorial copiado", description: "Cole a mensagem no WhatsApp ou em outro canal." });
    } catch {
      toast({ title: "Erro", description: "Nao foi possivel copiar o tutorial.", variant: "destructive" });
    }
  }

  function handleOpenWhatsApp(user: PushUser) {
    const phone = normalizeWhatsAppNumber(user.whatsapp_number || user.phone || "");
    if (!phone) {
      toast({ title: "Sem numero", description: "Este aluno nao tem WhatsApp/telefone cadastrado.", variant: "destructive" });
      return;
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(buildActivationMessage(user))}`, "_blank", "noopener,noreferrer");
  }

  let filtered = users;
  if (filter === "active") filtered = users.filter(u => u.has_push);
  if (filter === "inactive") filtered = users.filter(u => !u.has_push);
  if (filter === "attention") filtered = users.filter(u => getPriorityScore(u) > 0);

  if (search.trim()) {
    const needle = search.toLowerCase();
    filtered = filtered.filter(u =>
      u.full_name.toLowerCase().includes(needle) ||
      (u.community ?? "").toLowerCase().includes(needle) ||
      (u.area ?? "").toLowerCase().includes(needle)
    );
  }

  const enabledCount = users.filter(u => u.has_push).length;
  const disabledCount = users.filter(u => !u.has_push).length;
  const attentionCount = users.filter(u => getPriorityScore(u) > 0).length;
  const inactiveWithoutReminder = users.filter(u => !u.has_push && !u.reminder_sent);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-montserrat font-bold text-foreground text-sm flex items-center gap-2">
          Status push dos alunos
        </h3>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
          aria-label="Atualizar status push"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="scroll-menu gap-2 pb-1" aria-label="Filtros de notificações push">
        <SummaryButton label="Todos" value={users.length} active={filter === "all"} onClick={() => setFilter("all")} />
        <SummaryButton label="Ativos" value={enabledCount} active={filter === "active"} onClick={() => setFilter(filter === "active" ? "all" : "active")} icon={<Bell className="w-3.5 h-3.5" />} />
        <SummaryButton label="Sem push" value={disabledCount} active={filter === "inactive"} onClick={() => setFilter(filter === "inactive" ? "all" : "inactive")} icon={<BellOff className="w-3.5 h-3.5" />} />
        <SummaryButton label="Prioridade" value={attentionCount} active={filter === "attention"} onClick={() => setFilter(filter === "attention" ? "all" : "attention")} icon={<AlertTriangle className="w-3.5 h-3.5" />} />
      </div>

      {inactiveWithoutReminder.length > 0 && (
        <button
          onClick={handleSendAllReminders}
          disabled={sendingReminder === "all"}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary bg-primary/5 text-primary text-xs font-inter font-bold hover:bg-primary/10 transition-colors disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          {sendingReminder === "all" ? "Enviando..." : `Pedir ativacao para ${inactiveWithoutReminder.length} aluno(s)`}
        </button>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar aluno, comunidade ou GC..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-sm font-inter text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-xs font-inter text-center py-4 animate-pulse">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-xs font-inter text-center py-4">Nenhum aluno encontrado.</p>
      ) : (
        <div className="max-h-80 overflow-y-auto space-y-1 rounded-xl border border-border bg-card p-2">
          {filtered.map(u => (
            <div
              key={u.user_id}
              className="flex items-start justify-between gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="font-inter text-xs font-semibold text-foreground truncate">{u.full_name}</p>
                <p className="font-inter text-[10px] text-muted-foreground truncate">
                  {u.area} - {u.community}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className={`text-[10px] font-inter font-bold px-2 py-0.5 rounded-full ${
                    u.has_push ? "bg-brand-green/10 text-brand-green" : "bg-destructive/10 text-destructive"
                  }`}>
                    {u.has_push ? `${u.endpoint_count} disp.` : "Sem push"}
                  </span>
                  <span className={`text-[10px] font-inter px-2 py-0.5 rounded-full ${
                    (u.days_inactive ?? 0) >= 7 || u.days_inactive === null
                      ? "bg-secondary/10 text-secondary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {u.last_activity_label}
                  </span>
                </div>
              </div>

              {u.has_push ? (
                <div className="flex items-center gap-1 text-brand-green pt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-inter font-bold">OK</span>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenWhatsApp(u)}
                      className="p-1.5 rounded-lg text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
                      title="Abrir WhatsApp com tutorial"
                      aria-label="Abrir WhatsApp com tutorial"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopyTutorial(u)}
                      className="p-1.5 rounded-lg text-muted-foreground bg-muted hover:bg-muted/80 transition-colors"
                      title="Copiar tutorial de ativacao"
                      aria-label="Copiar tutorial de ativacao"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {u.reminder_sent ? (
                      <span className="text-[10px] font-inter font-medium text-muted-foreground bg-muted px-2 py-1 rounded-lg">Enviado</span>
                    ) : (
                      <button
                        onClick={() => handleSendReminder(u.user_id)}
                        disabled={sendingReminder === u.user_id}
                        className="text-[10px] font-inter font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        {sendingReminder === u.user_id ? "..." : "Pedir"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryButton({
  label,
  value,
  active,
  onClick,
  icon,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl border transition-colors ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"
      }`}
    >
      <span className="flex items-center gap-1 font-inter font-bold text-sm text-current">
        {icon}
        {value}
      </span>
      <span className="font-inter text-[9px] leading-tight text-current">{label}</span>
    </button>
  );
}

async function fetchRows<T>(
  label: string,
  query: PromiseLike<{ data: T[] | null; error: { message?: string } | null }>
): Promise<T[]> {
  const { data, error } = await query;
  if (error) {
    console.warn(`Failed to fetch ${label}:`, error.message);
    return [];
  }
  return data ?? [];
}

function getPriorityScore(user: PushUser) {
  if (!user.has_push) return 3;
  if (user.days_inactive === null) return 2;
  if (user.days_inactive >= 7) return 2;
  if (user.days_inactive >= 2) return 1;
  return 0;
}

function getDaysSince(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activityDay = new Date(date);
  activityDay.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - activityDay.getTime()) / (24 * 60 * 60 * 1000)));
}

function formatActivityLabel(label: string, days: number | null) {
  if (days === null) return "Sem atividade registrada";
  if (days === 0) return `${label} hoje`;
  if (days === 1) return `${label} ontem`;
  return `${label} ha ${days} dias`;
}

function normalizeWhatsAppNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length >= 8) return digits;
  return "";
}

function buildActivationMessage(user: PushUser) {
  const firstName = user.full_name.split(" ")[0] || "oi";
  return [
    `Ola, ${firstName}!`,
    "Estamos ajustando os lembretes do Caminho Boa Nova para ajudar voce a nao perder devocionais, encontros e avisos da turma.",
    "Para ativar: acesse https://www.caminhoboanova.com.br, entre na sua conta, abra Perfil > Configuracoes > Notificacoes e toque em Ativar.",
    "Se o navegador mostrar a permissao de notificacoes, escolha Permitir.",
  ].join("\n\n");
}

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Erro desconhecido.";
}
