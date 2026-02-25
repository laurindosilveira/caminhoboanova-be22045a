import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, GraduationCap, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Turma = {
  id: string;
  name: string;
  area: string | null;
  year: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  member_count?: number;
};

type Props = {
  onSelectTurma?: (turma: Turma) => void;
};

export default function TurmasManagement({ onSelectTurma }: Props) {
  const { toast } = useToast();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", area: "", year: new Date().getFullYear(), description: "" });

  useEffect(() => { fetchTurmas(); }, []);

  async function fetchTurmas() {
    setLoading(true);
    const { data } = await supabase.from("turmas").select("*").order("year", { ascending: false }).order("name");
    
    // Count members per turma
    const { data: profiles } = await supabase.from("profiles").select("turma_id");
    const countMap: Record<string, number> = {};
    (profiles ?? []).forEach(p => {
      if (p.turma_id) countMap[p.turma_id] = (countMap[p.turma_id] ?? 0) + 1;
    });

    setTurmas((data ?? []).map(t => ({ ...t, member_count: countMap[t.id] ?? 0 })));
    setLoading(false);
  }

  async function handleCreate() {
    if (!form.name.trim()) return;
    setCreating(true);

    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from("turmas").insert({
      name: form.name.trim(),
      area: form.area || null,
      year: form.year,
      description: form.description.trim() || null,
      created_by: user.user?.id,
    });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "✅ Turma criada", description: `"${form.name}" foi adicionada.` });
      setForm({ name: "", area: "", year: new Date().getFullYear(), description: "" });
      setShowCreate(false);
      fetchTurmas();
    }
    setCreating(false);
  }

  async function handleDelete(turma: Turma) {
    if (turma.member_count && turma.member_count > 0) {
      toast({ title: "Não é possível excluir", description: `A turma "${turma.name}" possui ${turma.member_count} membro(s). Remova-os antes.`, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("turmas").delete().eq("id", turma.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "🗑️ Turma removida", description: `"${turma.name}" foi excluída.` });
      fetchTurmas();
    }
  }

  const currentYear = new Date().getFullYear();
  const AREAS = ["Área 1", "Área 2"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-montserrat font-black text-foreground text-lg">Turmas</h2>
            <p className="text-muted-foreground text-xs font-inter">Gerencie as turmas de ensino</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-montserrat font-bold text-primary-foreground transition-all active:scale-95"
          style={{ background: "var(--gradient-hero)" }}>
          <Plus className="w-4 h-4" /> Nova turma
        </button>
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-montserrat font-bold text-foreground text-base">Criar nova turma</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-inter font-medium text-muted-foreground mb-1 block">Nome da turma</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Confirmatório 2026/1" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-inter font-medium text-muted-foreground mb-1 block">Área (opcional)</label>
              <div className="flex gap-2">
                <button onClick={() => setForm(f => ({ ...f, area: "" }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-montserrat font-bold transition-all border ${!form.area ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>
                  Todas
                </button>
                {AREAS.map(area => (
                  <button key={area} onClick={() => setForm(f => ({ ...f, area }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-montserrat font-bold transition-all border ${form.area === area ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>
                    {area}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-inter font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Ano
              </label>
              <Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) || currentYear }))} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-inter font-medium text-muted-foreground mb-1 block">Descrição (opcional)</label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Breve descrição..." className="rounded-xl" />
            </div>
            <button onClick={handleCreate} disabled={creating || !form.name.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-montserrat font-bold text-primary-foreground disabled:opacity-50"
              style={{ background: "var(--gradient-hero)" }}>
              {creating ? "Criando..." : "Criar turma"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Turmas list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="bg-muted rounded-2xl h-20 animate-pulse" />)}
        </div>
      ) : turmas.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-3">
            <GraduationCap className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-inter text-sm">Nenhuma turma criada ainda.</p>
          <p className="text-muted-foreground font-inter text-xs mt-1">Clique em "Nova turma" para começar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {turmas.map(turma => (
            <div key={turma.id}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => onSelectTurma?.(turma)}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-montserrat font-bold text-foreground text-sm truncate">{turma.name}</p>
                <p className="text-muted-foreground text-xs font-inter mt-0.5">
                  {turma.year} · {turma.area || "Todas as áreas"} · {turma.member_count ?? 0} membro{(turma.member_count ?? 0) !== 1 ? "s" : ""}
                </p>
                {turma.description && (
                  <p className="text-muted-foreground text-xs font-inter mt-0.5 truncate">{turma.description}</p>
                )}
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(turma); }}
                className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 flex-shrink-0" title="Excluir turma">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
