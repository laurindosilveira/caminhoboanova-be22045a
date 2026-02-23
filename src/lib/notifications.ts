// Notification scheduling utility for PWA
// Uses the Notification API + setTimeout for daily reminders

const NOTIFICATION_PERMISSION_KEY = "caminho_notifications_enabled";
const LAST_NOTIFICATION_KEY = "caminho_last_notification";

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  
  if (Notification.permission === "granted") {
    localStorage.setItem(NOTIFICATION_PERMISSION_KEY, "true");
    return true;
  }
  
  if (Notification.permission === "denied") return false;
  
  const result = await Notification.requestPermission();
  const granted = result === "granted";
  localStorage.setItem(NOTIFICATION_PERMISSION_KEY, String(granted));
  return granted;
}

export function isNotificationEnabled(): boolean {
  return localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === "true" && Notification.permission === "granted";
}

export function sendNotification(title: string, body: string, icon = "/pwa-192x192.png") {
  if (!isNotificationEnabled()) return;
  
  try {
    new Notification(title, {
      body,
      icon,
      tag: "caminho-reminder",
    });
  } catch {
    // Fallback for service worker context
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, { body, icon, badge: icon, tag: "caminho-reminder" });
      });
    }
  }
}

export function scheduleDailyReminder() {
  if (!isNotificationEnabled()) return;
  
  const now = new Date();
  const target = new Date();
  target.setHours(7, 0, 0, 0); // 7:00 AM
  
  // If 7 AM already passed today, schedule for tomorrow
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }
  
  const msUntil = target.getTime() - now.getTime();
  
  setTimeout(() => {
    const lastNotif = localStorage.getItem(LAST_NOTIFICATION_KEY);
    const today = new Date().toDateString();
    
    // Only send once per day
    if (lastNotif !== today) {
      sendNotification(
        "📖 Hora do Devocional!",
        "Bom dia! Não esqueça do seu devocional de hoje. Cada dia conta na sua caminhada!"
      );
      localStorage.setItem(LAST_NOTIFICATION_KEY, today);
    }
    
    // Reschedule for next day
    scheduleDailyReminder();
  }, msUntil);
}
