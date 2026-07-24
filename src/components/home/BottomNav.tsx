import { Home, Trophy, Calendar, Users, User, Heart, Music, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
  const { user } = useAuth();
  const navigate = useNavigate();
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
            {/* Overlay escuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Bottom sheet deslizando de baixo */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="fixed bottom-0 left-1/2 z-[45] w-full max-w-md -translate-x-1/2 rounded-t-3xl border-t border-border bg-card shadow-2xl"
            >
              {/* Handle de arrasto */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-border" />
              </div>

              <div className="px-4 pb-2 pt-1">
                <p className="font-inter text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Escolha a aba
                </p>
              </div>

              <div className="flex flex-col gap-2 px-3 pb-2">
                {tabs.map(({ tab, icon: Icon, label }) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      type="button"
                      key={tab}
                      onClick={() => handleTabClick(tab)}
                      className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-left transition-colors active:scale-95 ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground hover:bg-muted/70"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="truncate font-inter text-sm font-semibold">{label}</span>
                    </button>
                  );
                })}
              </div>

              {user?.email?.toLowerCase() === 'laurindosilveira@gmail.com' && (
                <div className="mt-2 border-t border-border px-3 pt-2">
                  <button
                    onClick={() => {
                      navigate("/admin-sistema");
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-primary transition-colors hover:bg-primary/5"
                  >
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    <span className="font-inter text-sm font-black uppercase tracking-wider">Painel do Sistema</span>
                  </button>
                </div>
              )}

              {/* Espaço para a barra de nav ficar por cima */}
              <div className="h-[72px]" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Barra inferior compacta — sempre visível no topo */}
      <nav
        className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-border bg-card shadow-[0_-4px_20px_rgb(0,0,0,0.10)]"
        aria-label="Navegação principal"
      >
        <div className="px-4 py-2">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-muted px-4 py-2.5 text-left transition-all hover:bg-muted/80 active:scale-[0.98]"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Fechar menu de abas" : "Abrir menu de abas"}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ActiveIcon className="h-4 w-4" />
              </div>
              <span className="font-montserrat text-sm font-black text-foreground">
                {activeTabInfo.label}
              </span>
            </div>
            {isMenuOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
