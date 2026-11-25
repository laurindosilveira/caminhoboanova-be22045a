// Vite emits this event when a dynamic chunk from a replaced deployment is
// missing. Retry once per tab after five minutes, and never auto-reload edits.
export function installAssetRecovery(target: Window = window) {
  const key="caminho-asset-retry-at";
  const onPreloadError=(event: Event) => {
    if (!target.navigator.onLine || target.document.querySelector('[data-unsaved-work="true"]')) return;
    try {
      const now=Date.now(), previous=Number(target.sessionStorage.getItem(key) || 0);
      if (previous && now-previous<5*60_000) return;
      target.sessionStorage.setItem(key,String(now));
      event.preventDefault();
      target.location.reload();
    } catch { /* Without reliable per-tab storage, do not risk a reload loop. */ }
  };
  target.addEventListener("vite:preloadError",onPreloadError);
  return () => target.removeEventListener("vite:preloadError",onPreloadError);
}
