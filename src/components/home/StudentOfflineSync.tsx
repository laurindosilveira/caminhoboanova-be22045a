import { useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getQueuedStudentActions, syncStudentOfflineQueue, resolveOfflineConflict, type OfflineConflict } from "@/lib/studentOffline";

export default function StudentOfflineSync() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [conflict, setConflict] = useState<OfflineConflict | null>(null);
  const [resolving, setResolving] = useState(false);

  async function chooseVersion(choice: "server" | "offline") {
    if (!conflict) return;
    const prompt = choice === "offline"
      ? "Substituir no servidor pelas respostas deste aparelho?"
      : "Descartar este rascunho e manter as respostas do servidor?";
    if (!window.confirm(prompt)) return;
    setResolving(true);
    try {
      const next = await resolveOfflineConflict(conflict, choice);
      setConflict(next);
      if (next) toast.error("As respostas do servidor mudaram. Confira novamente.");
      else { toast.success("Escolha salva."); window.dispatchEvent(new Event("online")); }
    } catch {
      toast.error("Não foi possível resolver o conflito. Tente novamente.");
    } finally { setResolving(false); }
  }

  useEffect(() => {
    let cancelled = false;

    async function refreshCount() {
      if (!user?.id) {
        setPendingCount(0);
        return;
      }
      const actions = await getQueuedStudentActions(user.id);
      if (!cancelled) setPendingCount(actions.length);
    }

    async function syncNow() {
      if (!user?.id || !navigator.onLine) return;
      setSyncing(true);
      try {
        const result = await syncStudentOfflineQueue(user.id);
        if (!cancelled) setConflict(result.conflict ?? null);
        if (result.synced > 0) {
          toast.success("Progresso offline sincronizado!");
        }
      } catch (error) {
        console.error("[offline-sync] Falha ao sincronizar", error);
      } finally {
        setSyncing(false);
        refreshCount();
      }
    }

    const onOnline = () => void syncNow();
    const onQueueChanged = () => void refreshCount();

    refreshCount();
    syncNow();
    window.addEventListener("online", onOnline);
    window.addEventListener("student-offline-queue-changed", onQueueChanged);
    window.addEventListener("student-offline-queue-synced", onQueueChanged);

    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
      window.removeEventListener("student-offline-queue-changed", onQueueChanged);
      window.removeEventListener("student-offline-queue-synced", onQueueChanged);
    };
  }, [user?.id]);

  if (!pendingCount) return null;

  return (
    <>
    {conflict && <div role="dialog" aria-modal="true" aria-labelledby="offline-conflict-title" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[85vh] w-full max-w-xl overflow-auto rounded-2xl bg-card p-5 text-foreground shadow-xl space-y-4">
        <h2 id="offline-conflict-title" className="font-bold">Respostas diferentes encontradas</h2>
        <p className="text-sm">Este aparelho e o servidor têm respostas diferentes. Compare antes de escolher. Enquanto isso, o rascunho continua guardado neste aparelho.</p>
        {Object.entries(conflict.action.payload.responses).map(([key, value]) => <div key={key} className="rounded-xl border p-3 text-sm space-y-2"><p className="font-semibold">{key}</p><p><strong>No servidor:</strong> {conflict.current[key] ?? "(sem resposta)"}</p><p><strong>Neste aparelho:</strong> {value || "(sem resposta)"}</p></div>)}
        <div className="flex flex-wrap gap-3"><button disabled={resolving} className="rounded-lg bg-primary px-3 py-2 text-primary-foreground" onClick={() => void chooseVersion("server")}>Manter servidor</button><button disabled={resolving} className="rounded-lg border px-3 py-2" onClick={() => void chooseVersion("offline")}>Usar este aparelho</button></div>
      </div>
    </div>}
    <div
      className="fixed left-1/2 top-11 z-[9998] flex -translate-x-1/2 items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg"
      role="status"
      aria-live="polite"
    >
      {syncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" /> : <CloudOff className="h-3.5 w-3.5 text-primary" />}
      <span>{pendingCount} alteracao{pendingCount === 1 ? "" : "es"} para sincronizar</span>
    </div>
    </>
  );
}
