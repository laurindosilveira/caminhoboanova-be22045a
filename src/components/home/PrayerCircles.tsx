import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAreaSwitch } from "@/contexts/AreaSwitchContext";
import { 
  Heart, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  CheckCircle2, 
  Archive, 
  AlertTriangle,
  User,
  EyeOff,
  Users,
  ShieldCheck
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PrayerRequest {
  id: string;
  user_id: string;
  content: string;
  visibility: 'public' | 'leaders_only' | 'anonymous';
  status: 'open' | 'answered' | 'archived';
  is_sensitive: boolean;
  prayers_count: number;
  created_at: string;
  user_name?: string;
  is_praying?: boolean;
}

export default function PrayerCircles() {
  const { profile, role, user } = useAuth();
  const { effectiveArea } = useAreaSwitch();
  const currentArea = effectiveArea || profile?.area || "";
  const isLeader = role === 'admin' || role === 'lider';

  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [newRequest, setNewTestimony] = useState("");
  const [visibility, setVisibility] = useState<PrayerRequest['visibility']>('public');
  const [isSensitive, setIsSensitive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("prayer_requests")
      .select(`
        *,
        profiles:user_id (full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar pedidos de oração");
    } else {
      // Fetch current user interactions to mark "is_praying"
      const { data: interactions } = await supabase
        .from("prayer_interactions")
        .select("request_id")
        .eq("user_id", user?.id);
      
      const prayingIds = new Set(interactions?.map(i => i.request_id) || []);

      const mapped = (data || []).map((r: any) => ({
        ...r,
        user_name: r.profiles?.full_name,
        is_praying: prayingIds.has(r.id)
      }));
      setRequests(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user, currentArea]);

  const handleSubmit = async () => {
    if (!newRequest.trim() || !user) return;
    setSubmitting(true);
    
    const { error } = await supabase.from("prayer_requests").insert({
      user_id: user.id,
      content: newRequest.trim(),
      visibility,
      is_sensitive: isSensitive,
      area: currentArea,
      community: profile?.community,
      turma_id: profile?.turma_id
    });

    if (error) {
      toast.error("Erro ao enviar pedido");
    } else {
      toast.success("Pedido enviado com sucesso!");
      setNewTestimony("");
      setShowForm(false);
      setIsSensitive(false);
      fetchRequests();
    }
    setSubmitting(false);
  };

  const togglePraying = async (request: PrayerRequest) => {
    if (!user) return;

    if (request.is_praying) {
      const { error } = await supabase
        .from("prayer_interactions")
        .delete()
        .eq("request_id", request.id)
        .eq("user_id", user.id);
      
      if (!error) {
        setRequests(prev => prev.map(r => 
          r.id === request.id 
            ? { ...r, is_praying: false, prayers_count: r.prayers_count - 1 } 
            : r
        ));
      }
    } else {
      const { error } = await supabase
        .from("prayer_interactions")
        .insert({ request_id: request.id, user_id: user.id });
      
      if (!error) {
        setRequests(prev => prev.map(r => 
          r.id === request.id 
            ? { ...r, is_praying: true, prayers_count: r.prayers_count + 1 } 
            : r
        ));
        toast.success("Você se uniu em oração!");
      }
    }
  };

  const updateStatus = async (id: string, status: PrayerRequest['status'], content: string) => {
    const { error } = await supabase
      .from("prayer_requests")
      .update({ status })
      .eq("id", id);
    
    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      if (status === 'answered') {
        toast.success("Glória a Deus pela resposta!");
        // Automatically add to diary when answered
        await supabase.from("prayer_diary").insert({
          user_id: user?.id,
          request_id: id,
          title: "Pedido Respondido",
          content: content,
          answered_at: new Date().toISOString(),
          area: currentArea,
          turma_id: profile?.turma_id
        });
        toast.info("Testemunho registrado no seu Diário de Oração!");
      } else {
        toast.success("Pedido arquivado");
      }
      fetchRequests();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          <h3 className="font-montserrat font-bold text-foreground text-lg">Círculos de Oração</h3>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-montserrat font-black shadow-sm hover:scale-105 transition-transform"
        >
          {showForm ? "Cancelar" : "Pedir oração"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-4"
          >
            <textarea
              value={newRequest}
              onChange={e => setNewTestimony(e.target.value)}
              placeholder="No que podemos orar por você?"
              className="w-full rounded-xl border border-border bg-muted/30 px-3 py-3 text-sm font-inter text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={3}
            />
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <select 
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="bg-muted text-foreground text-xs rounded-lg px-2 py-1.5 border-none focus:ring-1 focus:ring-primary"
                >
                  <option value="public">Visível para a turma</option>
                  <option value="anonymous">Anônimo para a turma</option>
                  <option value="leaders_only">Apenas para líderes</option>
                </select>

                <button
                  onClick={() => setIsSensitive(!isSensitive)}
                  className={`p-1.5 rounded-lg border transition-colors ${isSensitive ? 'bg-destructive/10 border-destructive text-destructive' : 'bg-muted border-transparent text-muted-foreground'}`}
                  title="Assunto sensível"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!newRequest.trim() || submitting}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-montserrat font-black disabled:opacity-50 transition-all hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Enviando..." : "Compartilhar"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {loading ? (
          <div className="py-10 text-center space-y-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground font-inter">Carregando pedidos...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-muted/30 rounded-3xl p-10 text-center border border-dashed border-border">
            <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-inter text-sm italic">
              Este é um espaço para caminharmos juntos em oração.
            </p>
          </div>
        ) : (
          requests.map(request => (
            <motion.div 
              layout
              key={request.id}
              className={`bg-card rounded-2xl border border-border p-4 shadow-sm relative overflow-hidden ${request.status === 'answered' ? 'border-brand-green/30 bg-brand-green/5' : ''}`}
            >
              {request.is_sensitive && (
                <div className="absolute top-0 left-0 w-1 h-full bg-destructive/50" />
              )}
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${request.visibility === 'anonymous' ? 'bg-muted' : 'bg-primary/10'}`}>
                    {request.visibility === 'anonymous' ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <User className="w-4 h-4 text-primary" />}
                  </div>
                  <div>
                    <p className="font-montserrat font-bold text-xs">
                      {request.visibility === 'anonymous' ? 'Anônimo' : request.user_name}
                      {request.visibility === 'leaders_only' && <span className="ml-1.5 text-[10px] text-primary">(Apenas líderes)</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-inter">
                      {new Date(request.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {request.status === 'answered' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-green/20 text-brand-green text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> RESPONDIDO
                    </span>
                  )}
                  
                  { (user?.id === request.user_id || isLeader) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1 hover:bg-muted rounded-lg">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        {user?.id === request.user_id && request.status === 'open' && (
                          <DropdownMenuItem onClick={() => updateStatus(request.id, 'answered', request.content)} className="gap-2 text-brand-green">
                            <CheckCircle2 className="w-4 h-4" /> Deus respondeu!
                          </DropdownMenuItem>
                        )}
                        {user?.id === request.user_id && request.status !== 'archived' && (
                          <DropdownMenuItem onClick={() => updateStatus(request.id, 'archived', request.content)} className="gap-2 text-muted-foreground">
                            <Archive className="w-4 h-4" /> Arquivar
                          </DropdownMenuItem>
                        )}
                        {isLeader && (
                          <DropdownMenuItem className="gap-2">
                            <ShieldCheck className="w-4 h-4" /> Registrar acompanhamento
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) }
                </div>
              </div>

              <p className="text-foreground font-inter text-sm leading-relaxed mb-4">
                {request.content}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-muted-foreground font-inter text-[10px]">
                  <Users className="w-3 h-3" />
                  {request.prayers_count > 0 
                    ? `${request.prayers_count} ${request.prayers_count === 1 ? 'pessoa orando' : 'pessoas orando'}` 
                    : "Seja o primeiro a orar"}
                </div>

                <button
                  onClick={() => togglePraying(request)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-montserrat font-black transition-all ${
                    request.is_praying 
                      ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${request.is_praying ? 'fill-current' : ''}`} />
                  {request.is_praying ? "Estou orando" : "Vou orar"}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      {isLeader && requests.some(r => r.is_sensitive) && (
        <div className="p-3 rounded-2xl bg-destructive/5 border border-destructive/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-montserrat font-bold text-destructive text-xs">Atenção Líder</p>
            <p className="text-[10px] text-muted-foreground font-inter">
              Existem pedidos sensíveis marcados em vermelho que requerem atenção pastoral especial.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
