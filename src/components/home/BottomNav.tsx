import { Home, Trophy, Calendar, Users, User, Heart, Music, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type Tab = "jornada" | "conquistas" | "agenda" | "comunidade" | "perfil" | "discipulado" | "adoracao";

interface BottomNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

const tabs = [
  { tab: "jornada" as Tab, icon: Home, label: "Jornada" },
  { tab: "discipulado" as Tab, icon: Heart, label: "CAMINHO" },
  { tab: "adoracao" as Tab, icon: Music, label: "Adoração" },
  { tab: "agenda" as Tab, icon: Calendar, label: "Agenda" },
  { tab: "conquistas" as Tab, icon: Trophy, label: "Ranking" },
  { tab: "comunidade" as Tab, icon: Users, label: "Comunidade" },
  { tab: "perfil" as Tab, icon: User, label: "Perfil" },
];

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabClick = (tab: Tab) => {
    onChange(tab);
    setIsMenuOpen(false);
  };

  const activeTabInfo = tabs.find((item) => item.tab === activeTab) ?? tabs[0];
  const ActiveIcon = activeTabInfo.icon;

  return (
    <>
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="fixed bottom-[92px] left-1/2 z-50 max-h-80 w-[calc(100%-32px)] max-w-md -translate-x-1/2 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-2xl"
            >
              <div className="px-2 py-2">
                <p className="font-inter text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Escolha a aba
                </p>
              </div>

              <div className="space-y-1">
                {tabs.map(({ tab, icon: Icon, label }) => {
                  const isActive = activeTab === tab;

                  return (
                    <button
                      type="button"
                      key={tab}
                      onClick={() => handleTabClick(tab)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 flex-1 font-inter text-sm font-semibold">{label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-card shadow-[0_-8px_30px_rgb(0,0,0,0.12)]"
        aria-label="Navegação principal"
      >
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-muted px-4 py-3 text-left transition-all hover:bg-muted/80 active:scale-[0.98]"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Fechar menu de abas" : "Abrir menu de abas"}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ActiveIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-inter text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Aba atual
                </p>
                <p className="truncate font-montserrat text-sm font-black text-foreground">{activeTabInfo.label}</p>
              </div>
            </div>
            {isMenuOpen ? (
              <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
