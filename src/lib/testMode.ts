/**
 * Test Mode — Pre-launch QA utility.
 * Activated via ?testmode=true, persisted in sessionStorage.
 * REMOVE BEFORE LAUNCH.
 */

const KEY = 'testmode';

export function isTestMode(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(KEY) === 'true';
}

export function activateTestMode(): void {
  sessionStorage.setItem(KEY, 'true');
}

/** Call once at app boot to detect URL param and persist */
export function detectTestModeParam(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (params.get('testmode') === 'true') {
    activateTestMode();
  }
}
