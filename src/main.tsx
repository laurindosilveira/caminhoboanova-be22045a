import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Push SW is now loaded via VitePWA's importScripts in the generated service worker

createRoot(document.getElementById("root")!).render(<App />);
