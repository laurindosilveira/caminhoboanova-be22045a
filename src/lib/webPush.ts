import { supabase } from "@/integrations/supabase/client";

type PushSubscriptionJson = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

/**
 * Subscribe the current user to Web Push notifications.
 * Saves the subscription to the database.
 */
export async function subscribeToWebPush(vapidPublicKey: string): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Web Push not supported");
    return false;
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    // Wait for service worker
    const registration = await navigator.serviceWorker.ready;
    const pushManager = registration.pushManager;

    // Check for existing subscription
    let subscription = await pushManager.getSubscription();
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    if (subscription && !sameApplicationServerKey(subscription.options.applicationServerKey, applicationServerKey)) {
      const staleEndpoint = subscription.endpoint;
      await subscription.unsubscribe();
      subscription = null;

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await supabase.from("push_subscriptions").delete().eq("user_id", currentUser.id).eq("endpoint", staleEndpoint);
      }
    }

    if (!subscription) {
      // Subscribe with VAPID key
      subscription = await pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });
    }

    // Save to database
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const subJson = subscription.toJSON() as PushSubscriptionJson;
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint: subJson.endpoint!,
        p256dh: subJson.keys!.p256dh!,
        auth: subJson.keys!.auth!,
      },
      { onConflict: "user_id,endpoint" }
    );

    if (error) {
      console.error("Failed to save push subscription:", error);
      return false;
    }

    console.log("Web Push subscription saved successfully");
    return true;
  } catch (err) {
    console.error("Web Push subscription failed:", err);
    return false;
  }
}

function sameApplicationServerKey(current: ArrayBuffer | null, expected: Uint8Array): boolean {
  if (!current) return false;
  const currentBytes = new Uint8Array(current);
  if (currentBytes.length !== expected.length) return false;
  return currentBytes.every((value, index) => value === expected[index]);
}

/**
 * Unsubscribe from Web Push and remove from database.
 */
export async function unsubscribeFromWebPush(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Remove from database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("endpoint", endpoint);
      }
    }
  } catch (err) {
    console.error("Web Push unsubscribe failed:", err);
  }
}

/**
 * Check if the user is currently subscribed to Web Push.
 */
export async function isWebPushSubscribed(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
