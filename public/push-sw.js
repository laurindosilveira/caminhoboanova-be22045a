/// <reference lib="webworker" />

// Custom service worker for Web Push notifications
// This file is loaded alongside the VitePWA-generated service worker

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: "Caminho Boa Nova",
      body: event.data.text(),
      icon: "/pwa-192x192.png",
    };
  }

  const options = {
    body: data.body || "",
    icon: data.icon || "/pwa-192x192.png",
    badge: data.badge || "/pwa-192x192.png",
    tag: data.tag || "caminho-push",
    data: {
      ...(data.data || {}),
      url: sanitizeUrl(data.data?.url || data.url || "/"),
    },
    vibrate: [100, 50, 100],
    actions: [
      { action: "open", title: "Abrir app" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = new URL(sanitizeUrl(data.url || "/"), self.location.origin);
  event.waitUntil(
    Promise.allSettled([
      recordPushEvent(data, "clicked"),
      clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          if ("navigate" in client && client.url !== targetUrl.href) {
            await client.navigate(targetUrl.href);
          }
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl.href);
      }),
    ])
  );
});

self.addEventListener("notificationclose", (event) => {
  event.waitUntil(recordPushEvent(event.notification.data || {}, "closed"));
});

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        client.postMessage({ type: "PUSH_SUBSCRIPTION_CHANGE" });
      }
    })
  );
});

function sanitizeUrl(rawUrl) {
  try {
    const target = new URL(rawUrl || "/", self.location.origin);
    if (target.origin !== self.location.origin) return "/";
    return `${target.pathname}${target.search}${target.hash}` || "/";
  } catch {
    return "/";
  }
}

async function recordPushEvent(data, action) {
  if (!data?.record_url || !data?.push_event_id || !data?.push_event_token) return;
  try {
    const endpoint = new URL(data.record_url);
    const allowedFunctionPath = endpoint.pathname.endsWith("/functions/v1/record-push-event");
    const allowedHost = endpoint.origin === self.location.origin || endpoint.hostname.endsWith(".supabase.co");
    if (!allowedFunctionPath || !allowedHost) return;
    await fetch(endpoint.href, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: data.push_event_id,
        token: data.push_event_token,
        action,
      }),
      keepalive: true,
    });
  } catch {
    // Telemetry must never block opening the app.
  }
}
