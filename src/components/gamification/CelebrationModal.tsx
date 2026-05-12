import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Star, Sparkles, Trophy, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";

export type CelebrationType = "devotional" | "lesson" | "streak_3" | "streak_7" | "streak_30";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: CelebrationType;
  points?: number;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({ isOpen, onClose, type, points }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Trigger confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  const getContent = () => {
    switch (type) {
      case "devotional":
        return {
          icon: <Sparkles className="w-12 h-12 text-yellow-400" />,
          title: "Devocional Concluído!",
          description: "Que alegria! Você dedicou um tempo para ouvir a voz de Deus hoje.",
          color: "brand-green"
        };
      case "lesson":
        return {
          icon: <Trophy className="w-12 h-12 text-primary" />,
          title: "Lição Finalizada!",
          description: "Parabéns por avançar em sua jornada de conhecimento e fé.",
          color: "secondary"
        };
      case "streak_3":
        return {
          icon: <Star className="w-12 h-12 text-orange-400" />,
          title: "3 Dias Seguidos!",
          description: "Você está criando um novo ritmo com Deus.",
          color: "orange-500"
        };
      case "streak_7":
        return {
          icon: <Heart className="w-12 h-12 text-red-400" />,
          title: "7 Dias de Constância!",
          description: "Uma semana caminhando com Deus!",
          color: "brand-green"
        };
      case "streak_30":
        return {
          icon: <Trophy className="w-12 h-12 text-yellow-500" />,
          title: "30 Dias no Caminho!",
          description: "Um mês de constância espiritual. Continue firme!",
          color: "primary"
        };
      default:
        return {
          icon: <CheckCircle2 className="w-12 h-12 text-brand-green" />,
          title: "Parabéns!",
          description: "Você completou mais uma etapa da sua jornada.",
          color: "brand-green"
        };
    }
  };

  const content = getContent();

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-card w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-border flex flex-col items-center text-center p-8 relative"
          >
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-brand-green" />
            
            <motion.div
              initial={{ rotate: -10, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1 
              }}
              className="mb-6 p-4 rounded-3xl bg-muted/50"
            >
              {content.icon}
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-montserrat font-black text-2xl text-foreground mb-3"
            >
              {content.title}
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground font-inter text-sm mb-8 leading-relaxed"
            >
              {content.description}
            </motion.p>

            {points && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-brand-green/10 text-brand-green px-4 py-2 rounded-full font-montserrat font-bold text-sm mb-8 flex items-center gap-2"
              >
                <Star className="w-4 h-4 fill-brand-green" />
                +{points} Pontos de Fé
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full"
            >
              <Button 
                onClick={onClose}
                className="w-full py-6 rounded-2xl font-montserrat font-black text-base shadow-lg hover:scale-[1.02] transition-transform active:scale-95"
                style={{ background: `var(--gradient-hero)` }}
              >
                Continuar
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationModal;
