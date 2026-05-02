import { Home, Trophy, Calendar, Users, User, Heart } from "lucide-react";

export type Tab = "jornada" | "conquistas" | "agenda" | "comunidade" | "perfil" | "discipulado";

interface BottomNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

const tabs = [
  { tab: "jornada" as Tab, icon: Home, label: "Jornada" },
  { tab: "conquistas" as Tab, icon: Trophy, label: "Conquistas", badge: true },
  { tab: "agenda" as Tab, icon: Calendar, label: "Agenda" },
  { tab: "comunidade" as Tab, icon: Users, label: "Comunidade" },
  { tab: "discipulado" as Tab, icon: Heart, label: "Discipulado" },
  { tab: "perfil" as Tab, icon: User, label: "Perfil" },
];

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-[calc(448px-1rem)] bg-card/80 backdrop-blur-xl border border-border/50 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] rounded-[2rem] mb-3 z-50 transition-all duration-300"
      aria-label="Navegação principal"
      role="tablist"
    >
      <div className="grid grid-cols-6 py-1.5">
        {tabs.map(({ tab, icon: Icon, label, badge }) => {
          const isActive = activeTab === tab;
          const isDiscipulado = tab === "discipulado";
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab}`}
              aria-label={badge ? `${label} (novo)` : label}
              onClick={() => onChange(tab)}
              className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-2xl transition-all active:scale-95 group min-h-[56px] min-w-[56px] focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:outline-none ${
                isActive ? (isDiscipulado ? "text-primary" : "text-secondary") : "text-muted-foreground hover:text-foreground/80"
              }`}
            >

              <div className={`relative w-7 h-7 flex items-center justify-center rounded-xl transition-all ${
                isActive ? (isDiscipulado ? "bg-primary/10" : "bg-secondary/10") : ""
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? (isDiscipulado ? "text-primary" : "text-secondary") : "text-muted-foreground"}`} aria-hidden="true" />
                {badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full" aria-hidden="true" />
                )}
              </div>
              <span className={`text-[9px] font-inter leading-none ${isActive ? (isDiscipulado ? "font-bold text-primary" : "font-bold text-secondary") : "font-medium"}`}>
                {label}
              </span>
              {isActive && <div className={`w-1 h-1 rounded-full ${isDiscipulado ? "bg-primary" : "bg-secondary"}`} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
