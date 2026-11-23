import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getWebPushStatus, syncWebPushSubscription } from "@/lib/webPush";

const CHECK_INTERVAL_MS = 30 * 60 * 1000;

export function usePushSubscriptionHealth() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let lastCheck = 0;

    async function repairIfNeeded(force = false) {
      if (cancelled) return;
      const now = Date.now();
      if (!force && now - lastCheck < CHECK_INTERVAL_MS) return;
      lastCheck = now;

      const { data } = await supabase.functions.invoke("get-vapid-key");
      if (!data?.publicKey) return;

      const status = await getWebPushStatus(data.publicKey);
      if (!status.supported || status.permission !== "granted") return;
      if (!status.needsServerRepair && !status.needsKeyRotation && status.serverSubscribed) return;

      await syncWebPushSubscription(data.publicKey, {
        forceRefresh: status.needsKeyRotation,
      });
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void repairIfNeeded();
    };
    const onFocus = () => void repairIfNeeded();
    const onServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "PUSH_SUBSCRIPTION_CHANGE") void repairIfNeeded(true);
    };

    void repairIfNeeded(true);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    navigator.serviceWorker?.addEventListener("message", onServiceWorkerMessage);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      navigator.serviceWorker?.removeEventListener("message", onServiceWorkerMessage);
    };
  }, [user]);
}
