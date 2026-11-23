import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown, fallback = "Erro inesperado.") {
  return error instanceof Error ? error.message : fallback;
}

export function isAppInstalled() {
  if (typeof window === 'undefined') return false;
  
  // 1. matchMedia (PWA standalone mode)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone) return true;

  // 2. User Agent heuristics (specific app browsers)
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.includes('wv') || ua.includes('webview')) return true;

  // 3. Persisted flag (after first auth in app)
  const persisted = localStorage.getItem('caminho_app_active');
  if (persisted === 'true') return true;

  return false;
}
