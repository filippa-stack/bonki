/**
 * Single gate for all dev tooling.
 *
 * devToolsEnabled = true only when:
 *   1. Vite dev server (import.meta.env.DEV)
 *   2. URL contains ?dev=1
 *   3. localStorage.devToolsEnabled === "true"
 *
 * In Preview builds the default is FALSE — dev tools are hidden
 * unless explicitly opted-in via (2) or (3).
 */
export function isDevToolsEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  if (params.get('dev') === '1') {
    // Persist so subsequent navigations keep it on
    try { localStorage.setItem('devToolsEnabled', 'true'); } catch {}
    return true;
  }

  try {
    if (localStorage.getItem('devToolsEnabled') === 'true') return true;
  } catch {}

  return false;
}
