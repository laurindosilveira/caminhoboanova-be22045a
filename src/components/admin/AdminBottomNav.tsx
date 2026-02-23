import { BarChart3, BookOpen, UserCheck, Shield } from "lucide-react";

export type AdminTab = "overview" | "attendance" | "courses" | "users";

const TABS = [
  { id: "overview" as AdminTab, label: "Visão", icon: BarChart3 },
  { id: "attendance" as AdminTab, label: "Encontros", icon: UserCheck },
  { id: "courses" as AdminTab, label: "Cursos", icon: BookOpen },
  { id: "users" as AdminTab, label: "Usuários", icon: Shield },
];

type Props = { active: AdminTab; onChange: (tab: AdminTab) => void };

export default function AdminBottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-2xl mx-auto flex">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors"
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
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
