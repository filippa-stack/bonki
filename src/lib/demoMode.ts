/**
 * Demo mode: append ?demo=1 to the URL to let colleagues
 * browse all products without logging in or being admin.
 *
 * When ?demo=1 is detected, demo mode is auto-entered — no extra
 * click required. The flag persists in sessionStorage for the tab.
 */

const DEMO_KEY = 'bonki-demo-mode';
const DEMO_ENTERED_KEY = 'bonki-demo-entered';

/** Was ?demo=1 used (or previously set in this tab)? Auto-enters demo. */
export function isDemoParam(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === '1') {
    try {
      sessionStorage.setItem(DEMO_KEY, '1');
      sessionStorage.setItem(DEMO_ENTERED_KEY, '1');
    } catch {}
    return true;
  }
  try { return sessionStorage.getItem(DEMO_KEY) === '1'; } catch {}
  return false;
}

/** Has the user "entered" the demo? */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  // Also check param on every call so ?demo=1 works immediately
  if (isDemoParam()) return true;
  try { return sessionStorage.getItem(DEMO_ENTERED_KEY) === '1'; } catch {}
  return false;
}

/** Mark demo as entered (called from login page) */
export function enterDemoMode(): void {
  try { sessionStorage.setItem(DEMO_ENTERED_KEY, '1'); } catch {}
}
