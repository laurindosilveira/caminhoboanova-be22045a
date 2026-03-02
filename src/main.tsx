import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register custom push service worker alongside VitePWA's SW
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch((err) => {
    console.warn("Custom SW registration failed:", err);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
