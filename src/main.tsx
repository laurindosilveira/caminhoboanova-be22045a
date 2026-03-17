import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Hide splash screen after React mounts
function hideSplash() {
  const splash = document.getElementById("splash-screen");
  if (splash) {
    splash.classList.add("hidden");
    setTimeout(() => splash.remove(), 500);
  }
}

// Keep app always on latest version
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    registration?.update();
  },
  onNeedRefresh() {
    window.location.reload();
  },
});

createRoot(document.getElementById("root")!).render(<App />);

// Hide splash after a short delay to ensure first paint
if (document.readyState === "complete") {
  hideSplash();
} else {
  window.addEventListener("load", () => {
    // Small delay so React has time to render
    setTimeout(hideSplash, 300);
  });
}

// Fallback: always hide after 4 seconds
setTimeout(hideSplash, 4000);
