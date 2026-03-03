/**
 * Single gate for all dev tooling.
 *
 * devToolsEnabled = true only when:
 *   1. URL contains ?dev=1
 *   2. localStorage.devToolsEnabled === "true"
 *
 * In Preview/Production the default is FALSE — dev tools are hidden
 * unless explicitly opted-in via (1) or (2).
 */

/** The only user ID allowed to activate dev tools */
const DEV_ADMIN_UID = 'b29f4c84-0426-4b8f-9293-dccf9141a4b5';

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

/** Check if the current authenticated user is the dev admin */
export function isDevAdmin(userId: string | undefined | null): boolean {
  return userId === DEV_ADMIN_UID;
}
