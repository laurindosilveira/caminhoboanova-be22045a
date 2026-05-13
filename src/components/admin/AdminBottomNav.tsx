import { BarChart3, BookOpen, Shield, Megaphone, Settings, AlertTriangle, Crown, GraduationCap, MessageSquare, CalendarDays, Phone, MessageCircle, Music } from "lucide-react";
// Build V11: SALA DO DISCIPULADOR - Scroll Forçado e Labels Atualizados

export type AdminTab = "overview" | "alerts" | "courses" | "leaders" | "push" | "users" | "settings" | "turma" | "avisos" | "agenda" | "contatos" | "whatsapp" | "worship";

type TabDef = { id: AdminTab; label: string; icon: typeof BarChart3 };

const ALL_TABS: TabDef[] = [
  { id: "overview", label: "Painel", icon: BarChart3 },
  { id: "alerts", label: "Alertas", icon: AlertTriangle },
  { id: "courses", label: "Cursos", icon: BookOpen },
  { id: "worship", label: "Louvor", icon: Music },
  { id: "leaders", label: "Líderes", icon: Crown },
  { id: "push", label: "Push", icon: Megaphone },
  { id: "users", label: "Usuários", icon: Shield },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "settings", label: "Config", icon: Settings },
];

const LIDER_TAB_DEFS: TabDef[] = [
  { id: "overview", label: "Painel", icon: BarChart3 },
  { id: "turma", label: "Minha Sala", icon: GraduationCap },
  { id: "agenda", label: "Encontros", icon: CalendarDays },
  { id: "avisos", label: "Avisos", icon: MessageSquare },
  { id: "contatos", label: "Contatos", icon: Phone },
  { id: "courses", label: "Cursos", icon: BookOpen },
];

type Props = { active: AdminTab; onChange: (tab: AdminTab) => void; userRole?: "admin" | "lider" | null };

export default function AdminBottomNav({ active, onChange, userRole }: Props) {
  const tabs = userRole === "lider" ? LIDER_TAB_DEFS : ALL_TABS;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
      aria-label="Navegação do painel administrativo"
      role="tablist"
    >
      <div className="max-w-2xl mx-auto flex overflow-x-auto scroll-smooth whitespace-nowrap px-4 py-1 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}} />
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => onChange(tab.id)}
              className="flex-none min-w-[70px] flex flex-col items-center justify-center py-2.5 px-2 gap-1 transition-all active:scale-90"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${isActive ? "text-primary fill-primary/10" : "text-muted-foreground"}`}
                aria-hidden="true"
              />
              <span
                className={`text-[10px] font-inter font-medium leading-none ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
