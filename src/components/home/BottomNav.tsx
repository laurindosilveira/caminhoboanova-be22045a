import { Home, Trophy, Calendar, Users, User } from "lucide-react";

export type Tab = "jornada" | "conquistas" | "agenda" | "comunidade" | "perfil";

interface BottomNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

const tabs = [
  { tab: "jornada" as Tab, icon: Home, label: "Jornada" },
  { tab: "conquistas" as Tab, icon: Trophy, label: "Conquistas", badge: true },
  { tab: "agenda" as Tab, icon: Calendar, label: "Agenda" },
  { tab: "comunidade" as Tab, icon: Users, label: "Comunidade" },
  { tab: "perfil" as Tab, icon: User, label: "Perfil" },
];

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border shadow-xl">
      <div className="grid grid-cols-5 py-1.5">
        {tabs.map(({ tab, icon: Icon, label, badge }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-xl transition-all active:scale-95 ${
                isActive ? "text-secondary" : "text-muted-foreground"
              }`}
            >
              <div className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isActive ? "bg-secondary/10" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-secondary" : "text-muted-foreground"}`} />
                {badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full" />
                )}
              </div>
              <span className={`text-xs font-inter ${isActive ? "font-bold text-secondary" : "font-medium"}`}>
                {label}
              </span>
              {isActive && <div className="w-1 h-1 bg-secondary rounded-full" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
