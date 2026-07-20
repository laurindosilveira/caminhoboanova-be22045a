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
    data: data.data || { url: "/" },
    vibrate: [100, 50, 100],
    actions: [
      { action: "open", title: "Abrir app" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  const targetUrl = new URL(url, self.location.origin);
  event.waitUntil(
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
    })
  );
});
