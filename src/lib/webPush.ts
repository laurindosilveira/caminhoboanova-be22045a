import { supabase } from "@/integrations/supabase/client";

type PushSubscriptionJson = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

type ExtendedNavigator = Navigator & {
  userAgentData?: { platform?: string };
  standalone?: boolean;
};

export type WebPushStatus = {
  supported: boolean;
  permission: NotificationPermission | "unsupported";
  browserSubscribed: boolean;
  serverSubscribed: boolean;
  needsPermission: boolean;
  needsServerRepair: boolean;
  needsKeyRotation: boolean;
  isIos: boolean;
  isStandalone: boolean;
  deviceId: string | null;
};

const DEVICE_ID_KEY = "caminho_push_device_id";
const SW_VERSION = "push-sw-v2";

export async function subscribeToWebPush(vapidPublicKey: string): Promise<boolean> {
  const result = await syncWebPushSubscription(vapidPublicKey, { requestPermission: true });
  return result;
}

export async function syncWebPushSubscription(
  vapidPublicKey: string,
  options: { requestPermission?: boolean; forceRefresh?: boolean } = {},
): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn("Web Push not supported");
    return false;
  }

  try {
    if (options.requestPermission && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return false;
    }
    if (Notification.permission !== "granted") {
      await markExistingSubscriptionStatus("permission_denied");
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const pushManager = registration.pushManager;
    let subscription = await pushManager.getSubscription();
    const previousEndpoint = subscription?.endpoint ?? null;

    if (subscription && (
      options.forceRefresh
      || !subscriptionUsesVapidKey(subscription, vapidPublicKey)
    )) {
      await subscription.unsubscribe();
      subscription = null;
    }

    if (!subscription) {
      subscription = await pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("church_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.church_id) return false;

    const subJson = subscription.toJSON() as PushSubscriptionJson;
    const endpoint = subJson.endpoint;
    const p256dh = subJson.keys?.p256dh;
    const auth = subJson.keys?.auth;
    if (!endpoint || !p256dh || !auth) return false;

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        church_id: profile.church_id,
        endpoint,
        p256dh,
        auth,
        device_id: getOrCreateDeviceId(),
        user_agent: navigator.userAgent,
        platform: getPlatform(),
        browser: getBrowserName(),
        permission_status: Notification.permission,
        app_version: import.meta.env.VITE_APP_VERSION ?? "web",
        sw_version: SW_VERSION,
        last_seen_at: new Date().toISOString(),
        disabled_reason: null,
        vapid_public_key_hash: await sha256Base64Url(vapidPublicKey),
      },
      { onConflict: "endpoint" },
    );

    if (error) {
      console.error("Failed to save push subscription:", error);
      return false;
    }

    if (previousEndpoint && previousEndpoint !== endpoint) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("endpoint", previousEndpoint);
    }

    return true;
  } catch (err) {
    console.error("Web Push subscription failed:", err);
    return false;
  }
}

export async function unsubscribeFromWebPush(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

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

export async function isWebPushSubscribed(): Promise<boolean> {
  const status = await getWebPushStatus();
  return status.browserSubscribed && status.serverSubscribed;
}

export async function getWebPushStatus(vapidPublicKey?: string): Promise<WebPushStatus> {
  const base = getSupportStatus();
  if (!base.supported) return base;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    const browserSubscribed = !!subscription;
    let serverSubscribed = false;
    let needsKeyRotation = subscription && vapidPublicKey
      ? !subscriptionUsesVapidKey(subscription, vapidPublicKey)
      : false;

    if (subscription?.endpoint) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("push_subscriptions")
          .select("id,disabled_reason,vapid_public_key_hash")
          .eq("user_id", user.id)
          .eq("endpoint", subscription.endpoint)
          .maybeSingle();
        serverSubscribed = !!data && !data.disabled_reason;
        if (data && vapidPublicKey) {
          const expectedHash = await sha256Base64Url(vapidPublicKey);
          needsKeyRotation = needsKeyRotation
            || data.vapid_public_key_hash !== expectedHash
            || data.disabled_reason === "vapid_mismatch"
            || data.disabled_reason === "expired";
        }
      }
    }

    return {
      ...base,
      browserSubscribed,
      serverSubscribed,
      needsPermission: Notification.permission !== "granted",
      needsServerRepair: browserSubscribed && !serverSubscribed && Notification.permission === "granted",
      needsKeyRotation,
      deviceId: getOrCreateDeviceId(),
    };
  } catch {
    return base;
  }
}

export function getSupportStatus(): WebPushStatus {
  const supported = isPushSupported();
  return {
    supported,
    permission: supported ? Notification.permission : "unsupported",
    browserSubscribed: false,
    serverSubscribed: false,
    needsPermission: supported ? Notification.permission !== "granted" : false,
    needsServerRepair: false,
    needsKeyRotation: false,
    isIos: isIos(),
    isStandalone: isStandalone(),
    deviceId: supported ? getOrCreateDeviceId() : null,
  };
}

function isPushSupported() {
  return typeof window !== "undefined"
    && "Notification" in window
    && "serviceWorker" in navigator
    && "PushManager" in window;
}

async function markExistingSubscriptionStatus(disabledReason: string) {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  const endpoint = subscription?.endpoint;
  if (!endpoint) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("push_subscriptions")
    .update({
      permission_status: Notification.permission,
      disabled_reason: disabledReason,
      last_seen_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);
}

function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

function getPlatform() {
  return (navigator as ExtendedNavigator).userAgentData?.platform || navigator.platform || "unknown";
}

function getBrowserName() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  return "Other";
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches
    || (navigator as ExtendedNavigator).standalone === true;
}

async function sha256Base64Url(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  const bytes = new Uint8Array(digest);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function subscriptionUsesVapidKey(subscription: PushSubscription, vapidPublicKey: string) {
  const actualKey = subscription.options.applicationServerKey;
  if (!actualKey) return true;

  const actual = new Uint8Array(actualKey);
  const expected = urlBase64ToUint8Array(vapidPublicKey);
  if (actual.length !== expected.length) return false;
  return actual.every((byte, index) => byte === expected[index]);
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
