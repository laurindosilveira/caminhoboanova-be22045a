import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";
import { 
  Book, 
  CheckCircle2, 
  Calendar,
  MessageSquare,
  ChevronRight,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  response?: string;
  answered_at?: string;
  created_at: string;
}

export default function PrayerDiary() {
  const { user } = useAuth();
  const { effectiveArea } = useAreaSwitch();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("prayer_diary")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setEntries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Book className="w-5 h-5 text-primary" />
        <h3 className="font-montserrat font-bold text-foreground text-lg">Meu Diário de Oração</h3>
      </div>

      <div className="grid gap-3">
        {loading ? (
          <div className="py-10 text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Carregando diário...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-muted/20 rounded-3xl p-8 text-center border border-dashed border-border">
            <Book className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground font-inter text-sm">
              Seu diário está vazio. Os pedidos respondidos aparecerão aqui automaticamente!
            </p>
          </div>
        ) : (
          entries.map(entry => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={entry.id}
              className="bg-card rounded-2xl border border-border p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-brand-green" />
                  </div>
                  <div>
                    <h4 className="font-montserrat font-bold text-xs text-foreground">{entry.title}</h4>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  TESTEMUNHO
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Heart className="w-3 h-3" /> Pedido original
                  </p>
                  <p className="text-sm font-inter text-foreground italic">
                    "{entry.content}"
                  </p>
                </div>

                {entry.answered_at && (
                  <div className="flex items-center gap-2 text-[10px] font-inter text-brand-green bg-brand-green/5 px-2 py-1 rounded-lg w-fit">
                    <CheckCircle2 className="w-3 h-3" />
                    Respondido em {new Date(entry.answered_at).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
