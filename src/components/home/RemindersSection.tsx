import { useState, useEffect, useRef } from "react";
import { ChevronDown, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DevotionalReminder from "./DevotionalReminder";
import UpcomingEventReminder from "./UpcomingEventReminder";
import StreakRiskReminder from "./StreakRiskReminder";
import ConversationReminderBanner from "./ConversationReminderBanner";

type Props = {
  onNavigateToDiscipulado: () => void;
  onNavigateToAgenda: () => void;
};

export default function RemindersSection({ onNavigateToDiscipulado, onNavigateToAgenda }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasContent, setHasContent] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if inner content rendered anything
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentRef.current) {
        const childElements = contentRef.current.querySelectorAll('[data-reminder]');
        setHasContent(childElements.length > 0);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!hasContent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-5 mt-2"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="reminders-content"
        className="w-full flex items-center justify-between gap-3 rounded-[1.5rem] bg-muted/40 border border-border/50 px-5 py-4 hover:bg-muted/60 transition-all active:scale-[0.98] group min-h-[56px]"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center transition-transform group-hover:scale-110">
            <Bell className="w-5 h-5 text-secondary" />
          </div>
          <div className="text-left">
            <h3 className="font-montserrat font-bold text-foreground text-sm">Lembretes</h3>
            <p className="font-inter text-[10px] font-medium text-muted-foreground/80">
              {isOpen ? "Toque para recolher" : "Toque para ver seus avisos"}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>


      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div ref={contentRef} className="pt-2 space-y-0">
              <div data-reminder>
                <ConversationReminderBanner />
              </div>
              <div data-reminder>
                <DevotionalReminder onNavigateToDiscipulado={onNavigateToDiscipulado} />
              </div>
              <div data-reminder>
                <UpcomingEventReminder onNavigateToAgenda={onNavigateToAgenda} />
              </div>
              <div data-reminder>
                <StreakRiskReminder onNavigateToJornada={onNavigateToDiscipulado} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
