import { useEffect, useRef, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getQueuedStudentActions, syncStudentOfflineQueue, resolveOfflineConflict, type OfflineConflict, type AttendanceReview } from "@/lib/studentOffline";

export default function StudentOfflineSync() {
  const { user } = useAuth();
  const currentUserId = useRef(user?.id);
  currentUserId.current = user?.id;
  const [pendingCount, setPendingCount] = useState(0);
  const [countUserId, setCountUserId] = useState<string | undefined>();
  const [queueUnavailable, setQueueUnavailable] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [conflict, setConflict] = useState<OfflineConflict | null>(null);
  const [resolving, setResolving] = useState(false);
  const [reviewPending, setReviewPending] = useState(false);
  const [otherScopePending, setOtherScopePending] = useState(false);
  const [attendanceReview, setAttendanceReview] = useState<AttendanceReview | null>(null);

  async function chooseVersion(choice: "server" | "offline") {
    if (!conflict || !user?.id || conflict.action.userId !== user.id) return;
    const requestedUserId = user.id;
    const prompt = choice === "offline"
      ? "Substituir no servidor pelas respostas deste aparelho?"
      : "Descartar este rascunho e manter as respostas do servidor?";
    if (!window.confirm(prompt)) return;
    setResolving(true);
    try {
      const next = await resolveOfflineConflict(conflict, choice);
      if (currentUserId.current !== requestedUserId) return;
      setConflict(next);
      if (next) toast.error("As respostas do servidor mudaram. Confira novamente.");
      else { toast.success("Escolha salva."); window.dispatchEvent(new Event("online")); }
    } catch {
      if (currentUserId.current === requestedUserId) toast.error("Não foi possível resolver o conflito. Tente novamente.");
    } finally { if (currentUserId.current === requestedUserId) setResolving(false); }
  }

  useEffect(() => {
    let cancelled = false;

    async function refreshCount() {
      if (!user?.id) {
        setPendingCount(0);
        setCountUserId(undefined);
        setQueueUnavailable(false);
        return;
      }
      try {
        const actions = await getQueuedStudentActions(user.id, { strict: true });
        if (!cancelled) { setPendingCount(actions.length); setCountUserId(user.id); setQueueUnavailable(false); }
      } catch {
        if (!cancelled) { setPendingCount(0); setCountUserId(user.id); setQueueUnavailable(true); }
      }
    }

    async function syncNow() {
      if (!user?.id || !navigator.onLine) return;
      setSyncing(true);
      try {
        const result = await syncStudentOfflineQueue(user.id);
        if (!cancelled) { setConflict(result.conflict ?? null); setReviewPending(!!result.reviewPending); setOtherScopePending(!!result.otherScopePending); setAttendanceReview(result.attendanceReview ?? null); }
        if (!cancelled && result.synced > 0) {
          toast.success("Progresso offline sincronizado!");
        }
      } catch {
        // A failed request may include response data; leave it in the queue.
      } finally {
        if (!cancelled) { setSyncing(false); void refreshCount(); }
        else if (currentUserId.current && navigator.onLine) {
          // The next account may have attempted to sync while the previous
          // account still held the single in-flight slot. Retry after release.
          window.dispatchEvent(new Event("online"));
        }
      }
    }

    const onOnline = () => void syncNow();
    const onQueueChanged = () => void refreshCount();

    setConflict(null);
    setReviewPending(false);
    setOtherScopePending(false);
    setAttendanceReview(null);
    setResolving(false);
    void refreshCount();
    void syncNow();
    window.addEventListener("online", onOnline);
    window.addEventListener("student-offline-queue-changed", onQueueChanged);
    window.addEventListener("student-offline-queue-synced", onQueueChanged);
    window.addEventListener("legacy-recovery-changed", onOnline);

    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
      window.removeEventListener("student-offline-queue-changed", onQueueChanged);
      window.removeEventListener("student-offline-queue-synced", onQueueChanged);
      window.removeEventListener("legacy-recovery-changed", onOnline);
    };
  }, [user?.id]);

  const visibleCount = countUserId === user?.id ? pendingCount : 0;
  const visibleError = countUserId === user?.id && queueUnavailable;
  const visibleConflict = conflict?.action.userId === user?.id ? conflict : null;
  const visibleAttendanceReview = attendanceReview?.action.userId === user?.id ? attendanceReview : null;
  if (!visibleCount && !visibleError) return null;

  return (
    <>
    {visibleConflict && <div role="dialog" aria-modal="true" aria-labelledby="offline-conflict-title" className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[85vh] w-full max-w-xl overflow-auto rounded-2xl bg-card p-5 text-foreground shadow-xl space-y-4">
        <h2 id="offline-conflict-title" className="font-bold">Respostas diferentes encontradas</h2>
        <p className="text-sm">Este aparelho e o servidor têm respostas diferentes. Compare antes de escolher. Enquanto isso, o rascunho continua guardado neste aparelho.</p>
        {Object.entries(visibleConflict.action.payload.responses).map(([key, value]) => <div key={key} className="rounded-xl border p-3 text-sm space-y-2"><p className="font-semibold">{key}</p><p><strong>No servidor:</strong> {visibleConflict.current[key] ?? "(sem resposta)"}</p><p><strong>Neste aparelho:</strong> {value || "(sem resposta)"}</p></div>)}
        <div className="flex flex-wrap gap-3"><button disabled={resolving} className="rounded-lg bg-primary px-3 py-2 text-primary-foreground" onClick={() => void chooseVersion("server")}>Manter servidor</button><button disabled={resolving} className="rounded-lg border px-3 py-2" onClick={() => void chooseVersion("offline")}>Usar este aparelho</button></div>
      </div>
    </div>}
    <div
      className="fixed left-1/2 top-11 z-[9998] flex -translate-x-1/2 items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg"
      role="status"
      aria-live="polite"
    >
      {syncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" /> : <CloudOff className="h-3.5 w-3.5 text-primary" />}
      <span>{visibleError ? "Não foi possível verificar as alterações deste aparelho. Não limpe os dados." : visibleAttendanceReview ? "Uma solicitação de presença precisa de revisão. Fale com a liderança; ela continua guardada neste aparelho." : reviewPending ? "Respostas aguardam revisão. Não limpe os dados deste aparelho." : otherScopePending ? "Registros de presença aguardam revisão. Não limpe os dados deste aparelho." : `${visibleCount} alteracao${visibleCount === 1 ? "" : "es"} para sincronizar`}</span>
    </div>
    </>
  );
}
