import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Crown,
  Globe,
  GraduationCap,
  HeartHandshake,
  Megaphone,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Music,
  Phone,
  Settings,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AdminTab = "care" | "overview" | "alerts" | "courses" | "leaders" | "push" | "users" | "settings" | "turma" | "avisos" | "agenda" | "contatos" | "whatsapp" | "worship" | "admin_global" | "attendance";

type TabDef = { id: AdminTab; label: string; icon: typeof BarChart3 };

const ADMIN_TABS: TabDef[] = [
  { id: "care", label: "Acompanhamento", icon: HeartHandshake },
  { id: "overview", label: "Relatorios", icon: BarChart3 },
  { id: "alerts", label: "Alertas", icon: AlertTriangle },
  { id: "users", label: "Usuarios", icon: Shield },
  { id: "courses", label: "Cursos", icon: BookOpen },
  { id: "worship", label: "Louvor", icon: Music },
  { id: "leaders", label: "Lideres", icon: Crown },
  { id: "push", label: "Push", icon: Megaphone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "settings", label: "Configuracoes", icon: Settings },
];

const LEADER_TABS: TabDef[] = [
  { id: "care", label: "Hoje na turma", icon: HeartHandshake },
  { id: "attendance", label: "Presenca", icon: ClipboardList },
  { id: "agenda", label: "Encontros", icon: CalendarDays },
  { id: "turma", label: "Caminho", icon: GraduationCap },
  { id: "avisos", label: "Avisos", icon: MessageSquare },
  { id: "contatos", label: "Contatos", icon: Phone },
  { id: "courses", label: "Cursos", icon: BookOpen },
  { id: "overview", label: "Relatorios", icon: BarChart3 },
];

type Props = {
  active: AdminTab;
  isSuper?: boolean;
  onChange: (tab: AdminTab) => void;
  userRole?: "admin" | "lider" | null;
};

export default function AdminBottomNav({ active, onChange, userRole, isSuper }: Props) {
  const tabs = userRole === "lider" ? [...LEADER_TABS] : [...ADMIN_TABS];
  if (isSuper && userRole !== "lider") {
    tabs.unshift({ id: "admin_global", label: "Visao global", icon: Globe });
  }

  const primaryIds: AdminTab[] = userRole === "lider"
    ? ["care", "attendance", "agenda", "turma"]
    : ["care", "alerts", "users", "courses"];
  const primaryTabs = primaryIds
    .map((id) => tabs.find((tab) => tab.id === id))
    .filter((tab): tab is TabDef => Boolean(tab));
  const moreTabs = tabs.filter((tab) => !primaryIds.includes(tab.id));
  const isMoreActive = moreTabs.some((tab) => tab.id === active);

  return (
    <>
      <aside className="sticky top-0 hidden min-h-[calc(100vh-1rem)] w-60 shrink-0 border-r border-border px-4 py-6 lg:block">
        <p className="mb-3 px-3 text-xs font-bold uppercase text-muted-foreground">Gestao da turma</p>
        <nav className="space-y-1" aria-label="Navegacao do painel">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card lg:hidden" aria-label="Navegacao do painel">
        <div className="mx-auto grid max-w-lg grid-cols-5 px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 px-1 text-xs font-semibold transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate">{tab.label}</span>
              </button>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 px-1 text-xs font-semibold transition-colors ${
                  isMoreActive ? "text-foreground" : "text-muted-foreground"
                }`}
                aria-label="Mais opcoes"
              >
                <MoreHorizontal className="h-5 w-5" />
                <span>Mais</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="mb-2 w-56">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <DropdownMenuItem key={tab.id} onSelect={() => onChange(tab.id)} className="min-h-10 gap-3 text-sm">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {active === tab.id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
}
