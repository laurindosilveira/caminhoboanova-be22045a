import { useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getQueuedStudentActions, syncStudentOfflineQueue } from "@/lib/studentOffline";

export default function StudentOfflineSync() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

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
    <div
      className="fixed left-1/2 top-11 z-[9998] flex -translate-x-1/2 items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg"
      role="status"
      aria-live="polite"
    >
      {syncing ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" /> : <CloudOff className="h-3.5 w-3.5 text-primary" />}
      <span>{pendingCount} alteracao{pendingCount === 1 ? "" : "es"} para sincronizar</span>
    </div>
  );
}
