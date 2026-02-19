import { BarChart3, Users, BookOpen, CalendarDays, MessageSquare, Heart, GraduationCap } from "lucide-react";

export type AdminTab = "overview" | "participants" | "courses" | "agenda" | "messages" | "discipleship" | "sala";

const TABS = [
  { id: "overview" as AdminTab, label: "Visão", icon: BarChart3 },
  { id: "participants" as AdminTab, label: "Pessoas", icon: Users },
  { id: "courses" as AdminTab, label: "Cursos", icon: BookOpen },
  { id: "discipleship" as AdminTab, label: "Discipu.", icon: Heart },
  { id: "agenda" as AdminTab, label: "Agenda", icon: CalendarDays },
  { id: "messages" as AdminTab, label: "Msgs", icon: MessageSquare },
  { id: "sala" as AdminTab, label: "Sala", icon: GraduationCap },
];

type Props = { active: AdminTab; onChange: (tab: AdminTab) => void };

export default function AdminBottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-2xl mx-auto grid grid-cols-7">
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
