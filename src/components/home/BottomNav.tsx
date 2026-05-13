import { Home, Trophy, Calendar, Users, User, Heart, Music, Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type Tab = "jornada" | "conquistas" | "agenda" | "comunidade" | "perfil" | "discipulado" | "adoracao";

interface BottomNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

const mainTabs = [
  { tab: "jornada" as Tab, icon: Home, label: "Jornada" },
  { tab: "discipulado" as Tab, icon: Heart, label: "Minha Sala" },
  { tab: "adoracao" as Tab, icon: Music, label: "Adoração" },
  { tab: "perfil" as Tab, icon: User, label: "Perfil" },
];

const menuTabs = [
  { tab: "conquistas" as Tab, icon: Trophy, label: "Ranking" },
  { tab: "comunidade" as Tab, icon: Users, label: "Comunidade" },
  { tab: "agenda" as Tab, icon: Calendar, label: "Agenda" },
];

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabClick = (tab: Tab) => {
    onChange(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-full max-w-md bg-card border border-border rounded-t-3xl shadow-2xl z-50 p-4"
            >
              <div className="grid grid-cols-3 gap-4">
                {menuTabs.map(({ tab, icon: Icon, label }) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => handleTabClick(tab)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95 ${
                        isActive ? "bg-secondary/10 text-secondary" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${
                        isActive ? "bg-secondary/20" : "bg-muted"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? "text-secondary" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border shadow-[0_-8px_30px_rgb(0,0,0,0.12)] z-50"
        aria-label="Navegação principal"
      >
        <div className="flex items-center justify-between px-2 py-2">
          {mainTabs.map(({ tab, icon: Icon, label }) => {
            const isActive = activeTab === tab;
            const isPrimary = tab === "discipulado" || tab === "adoracao";
            return (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-all active:scale-95 ${
                  isActive ? (isPrimary ? "text-primary" : "text-secondary") : "text-muted-foreground"
                }`}
              >
                <div className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                  isActive ? (isPrimary ? "bg-primary/10" : "bg-secondary/10") : ""
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? (isPrimary ? "text-primary" : "text-secondary") : "text-muted-foreground"}`} />
                </div>
                <span className={`text-[9px] font-bold tracking-tight ${isActive ? "" : "font-medium"}`}>
                  {label}
                </span>
              </button>
            );
          })}

          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-all active:scale-95 ${
              isMenuOpen ? "text-secondary" : "text-muted-foreground"
            }`}
          >
            <div className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
              isMenuOpen ? "bg-secondary/10" : ""
            }`}>
              <Menu className={`w-5 h-5 ${isMenuOpen ? "text-secondary" : "text-muted-foreground"}`} />
            </div>
            <span className={`text-[9px] font-bold tracking-tight ${isMenuOpen ? "" : "font-medium"}`}>
              Mais
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
