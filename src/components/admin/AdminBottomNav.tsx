import { BarChart3, Users, BookOpen, CalendarDays, MessageSquare, Heart, GraduationCap, UserCheck, Shield, ClipboardList, BookMarked } from "lucide-react";

export type AdminTab = "overview" | "participants" | "courses" | "agenda" | "messages" | "discipleship" | "sala" | "attendance" | "users" | "meetings" | "devotionals";

const TABS = [
  { id: "overview" as AdminTab, label: "Visão", icon: BarChart3 },
  { id: "participants" as AdminTab, label: "Pessoas", icon: Users },
  { id: "attendance" as AdminTab, label: "Presença", icon: UserCheck },
  { id: "discipleship" as AdminTab, label: "Discipu.", icon: Heart },
  { id: "courses" as AdminTab, label: "Cursos", icon: BookOpen },
  { id: "devotionals" as AdminTab, label: "Devoc.", icon: BookMarked },
  { id: "agenda" as AdminTab, label: "Agenda", icon: CalendarDays },
  { id: "messages" as AdminTab, label: "Msgs", icon: MessageSquare },
  { id: "meetings" as AdminTab, label: "Encontros", icon: ClipboardList },
  { id: "sala" as AdminTab, label: "Sala", icon: GraduationCap },
  { id: "users" as AdminTab, label: "Usuários", icon: Shield },
];

type Props = { active: AdminTab; onChange: (tab: AdminTab) => void };

export default function AdminBottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border overflow-x-auto">
      <div className="max-w-2xl mx-auto flex min-w-max">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors px-3 min-w-[60px]"
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`text-[9px] font-inter font-medium leading-none ${
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
