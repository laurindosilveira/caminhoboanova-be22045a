import { BarChart3, BookOpen, UserCheck, Shield, ClipboardList, Megaphone } from "lucide-react";

export type AdminTab = "attendance" | "courses" | "guide" | "users" | "push";

type TabDef = { id: AdminTab; label: string; icon: typeof BarChart3 };

const ALL_TABS: TabDef[] = [
  { id: "attendance", label: "Encontros", icon: UserCheck },
  { id: "courses", label: "Cursos", icon: BookOpen },
  { id: "push", label: "Push", icon: Megaphone },
  { id: "guide", label: "Líder", icon: ClipboardList },
  { id: "users", label: "Usuários", icon: Shield },
];

const LIDER_TABS: AdminTab[] = ["courses", "guide", "push", "users"];

type Props = { active: AdminTab; onChange: (tab: AdminTab) => void; userRole?: "admin" | "lider" | null };

export default function AdminBottomNav({ active, onChange, userRole }: Props) {
  const tabs = userRole === "lider" ? ALL_TABS.filter(t => LIDER_TABS.includes(t.id)) : ALL_TABS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map((tab) => {
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
