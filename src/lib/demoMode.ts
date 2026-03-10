/**
 * Demo mode: append ?demo=1 to the URL to let colleagues
 * browse all products without logging in or being admin.
 *
 * The flag is stored in sessionStorage so it persists across
 * navigations within the same tab, but not across tabs/sessions.
 */

const DEMO_KEY = 'bonki-demo-mode';

export function isDemoMode(): boolean {
  // Check URL first
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') {
      try { sessionStorage.setItem(DEMO_KEY, '1'); } catch {}
      return true;
    }
    // Persist within tab via sessionStorage
    try { return sessionStorage.getItem(DEMO_KEY) === '1'; } catch {}
  }
  return false;
}
