import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

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
