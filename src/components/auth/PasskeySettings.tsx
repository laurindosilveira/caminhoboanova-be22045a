import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Fingerprint, Plus, Trash2, Edit2, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Passkey {
  id: string;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
}

type PasskeyAuthClient = typeof supabase.auth & {
  passkey: {
    list: () => Promise<{ data: Passkey[] | null; error: Error | null }>;
    delete: (params: { passkeyId: string }) => Promise<{ error: Error | null }>;
    update: (params: { passkeyId: string; friendlyName: string }) => Promise<{ error: Error | null }>;
  };
  registerPasskey: () => Promise<{ data: unknown; error: Error | null }>;
};

const passkeyAuth = supabase.auth as unknown as PasskeyAuthClient;

export default function PasskeySettings() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchPasskeys();
  }, []);

  async function fetchPasskeys() {
    try {
      setLoading(true);
      const { data, error } = await passkeyAuth.passkey.list();
      if (error) throw error;
      setPasskeys(data || []);
    } catch (err: any) {
      console.error("Error fetching passkeys:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPasskey() {
    try {
      setRegistering(true);
      const { error } = await passkeyAuth.registerPasskey();
      
      if (error) throw error;
      
      toast.success("Biometria cadastrada com sucesso!");
      fetchPasskeys();
    } catch (err: any) {
      console.error("Error registering passkey:", err);
      toast.error("Erro ao cadastrar biometria: " + err.message);
    } finally {
      setRegistering(false);
    }
  }

  async function handleDeletePasskey(id: string) {
    if (!confirm("Tem certeza que deseja remover esta biometria?")) return;
    
    try {
      const { error } = await passkeyAuth.passkey.delete({ passkeyId: id });
      if (error) throw error;
      
      toast.success("Biometria removida.");
      fetchPasskeys();
    } catch (err: any) {
      toast.error("Erro ao remover: " + err.message);
    }
  }

  async function handleUpdateName(id: string) {
    if (!newName.trim()) return;
    
    try {
      const { error } = await passkeyAuth.passkey.update({
        passkeyId: id,
        friendlyName: newName.trim()
      });
      if (error) throw error;
      
      toast.success("Nome atualizado.");
      setEditingId(null);
      fetchPasskeys();
    } catch (err: any) {
      toast.error("Erro ao atualizar nome: " + err.message);
    }
  }


  if (loading && passkeys.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-montserrat font-bold text-foreground text-sm flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-primary" />
            Acesso por Biometria
          </h3>
          <p className="text-muted-foreground text-xs font-inter mt-0.5">
            Use sua digital ou reconhecimento facial para entrar mais rápido.
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={handleAddPasskey}
          disabled={registering}
          className="rounded-xl h-9"
        >
          {registering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          Cadastrar
        </Button>
      </div>

      <div className="space-y-2">
        {passkeys.length === 0 ? (
          <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-6 text-center">
            <Fingerprint className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-inter">Nenhuma biometria cadastrada neste dispositivo.</p>
          </div>
        ) : (
          passkeys.map((pk) => (
            <div key={pk.id} className="bg-muted/50 border border-border rounded-2xl p-4 flex items-center justify-between group">
              <div className="flex-1 min-w-0 mr-3">
                {editingId === pk.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-background border border-primary/30 rounded-lg px-2 py-1 text-sm font-inter w-full focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateName(pk.id)}
                    />
                    <button onClick={() => handleUpdateName(pk.id)} className="text-brand-green p-1">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-muted-foreground p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-inter text-sm font-semibold truncate text-foreground">
                        {pk.friendly_name || "Biometria"}
                      </span>
                      <Badge variant="secondary" className="text-[9px] h-4 font-bold bg-primary/5 text-primary border-primary/10">PASSKEY</Badge>
                    </div>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <p className="text-[10px] text-muted-foreground font-inter">
                        Adicionado em {new Date(pk.created_at).toLocaleDateString()}
                      </p>
                      {pk.last_used_at && (
                        <p className="text-[10px] text-brand-green font-inter font-medium">
                          Último uso: {new Date(pk.last_used_at).toLocaleDateString()} às {new Date(pk.last_used_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingId(pk.id);
                    setNewName(pk.friendly_name || "");
                  }}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                  title="Editar nome"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePasskey(pk.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
