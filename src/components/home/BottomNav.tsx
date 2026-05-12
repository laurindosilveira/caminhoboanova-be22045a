import { Home, Trophy, Calendar, Users, User, Heart, Music } from "lucide-react";

export type Tab = "jornada" | "conquistas" | "agenda" | "comunidade" | "perfil" | "discipulado" | "adoracao";

interface BottomNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

const tabs = [
  { tab: "jornada" as Tab, icon: Home, label: "Jornada" },
  { tab: "discipulado" as Tab, icon: Heart, label: "Caminho" },
  { tab: "adoracao" as Tab, icon: Music, label: "Adoração" },
  { tab: "conquistas" as Tab, icon: Trophy, label: "Ranking" },
  { tab: "comunidade" as Tab, icon: Users, label: "Comunidade" },
  { tab: "agenda" as Tab, icon: Calendar, label: "Agenda" },
  { tab: "perfil" as Tab, icon: User, label: "Perfil" },
];

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border shadow-xl"
      aria-label="Navegação principal"
      role="tablist"
    >
      <div className="grid grid-cols-7 py-1.5">
        {tabs.map(({ tab, icon: Icon, label }) => {
          const isActive = activeTab === tab;
          const isPrimary = tab === "discipulado" || tab === "adoracao" || tab === "conquistas";
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => onChange(tab)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-0.5 rounded-xl transition-all active:scale-95 ${
                isActive ? (isPrimary ? "text-primary" : "text-secondary") : "text-muted-foreground"
              }`}
            >
              <div className={`relative w-7 h-7 flex items-center justify-center rounded-xl transition-all ${
                isActive ? (isPrimary ? "bg-primary/10" : "bg-secondary/10") : ""
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? (isPrimary ? "text-primary" : "text-secondary") : "text-muted-foreground"}`} aria-hidden="true" />
              </div>
              <span className={`text-[8px] font-inter leading-none ${isActive ? (isPrimary ? "font-bold text-primary" : "font-bold text-secondary") : "font-medium"}`}>
                {label}
              </span>
              {isActive && <div className={`w-1 h-1 rounded-full ${isPrimary ? "bg-primary" : "bg-secondary"}`} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
