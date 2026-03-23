/**
 * Demo session persistence — tracks active (paused) sessions in localStorage
 * so resume banners and progress hooks work in demo mode.
 */

const STORAGE_KEY = 'bonki-demo-active-sessions';
export const DEMO_SESSION_EVENT = 'bonki:demo-session-changed';

export interface DemoActiveSession {
  productId: string;
  cardId: string;
  categoryId: string;
  currentStepIndex: number;
  startedAt: string;
}

function readAll(): DemoActiveSession[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeAll(sessions: DemoActiveSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DEMO_SESSION_EVENT, { detail: sessions }));
  }
}

/** Save or update the active demo session for a product+card */
export function saveDemoSession(session: Omit<DemoActiveSession, 'startedAt'>): void {
  const all = readAll();
  const idx = all.findIndex(s => s.productId === session.productId && s.cardId === session.cardId);
  const entry: DemoActiveSession = { ...session, startedAt: new Date().toISOString() };
  if (idx >= 0) {
    all[idx] = { ...entry, startedAt: all[idx].startedAt };
  } else {
    all.unshift(entry);
  }
  writeAll(all);
}

/** Update step index for an active demo session */
export function updateDemoSessionStep(productId: string, cardId: string, stepIndex: number): void {
  const all = readAll();
  const session = all.find(s => s.productId === productId && s.cardId === cardId);
  if (session) {
    session.currentStepIndex = stepIndex;
    writeAll(all);
  }
}

/** Remove a demo session (on completion) and track it as completed */
export function completeDemoSession(productId: string, cardId: string): void {
  const all = readAll().filter(s => !(s.productId === productId && s.cardId === cardId));
  writeAll(all);
  // Track completed cards
  markDemoCardCompleted(productId, cardId);
}

const COMPLETED_KEY = 'bonki-demo-completed-cards';

function markDemoCardCompleted(productId: string, cardId: string): void {
  try {
    const set: string[] = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]');
    const key = `${productId}::${cardId}`;
    if (!set.includes(key)) {
      set.push(key);
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(set));
    }
  } catch { /* ignore */ }
}

/** Check if a card was completed in demo mode */
export function isDemoCardCompleted(productId: string, cardId: string): boolean {
  try {
    const set: string[] = JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]');
    return set.includes(`${productId}::${cardId}`);
  } catch { return false; }
}

/** Get all active demo sessions */
export function getAllDemoSessions(): DemoActiveSession[] {
  return readAll();
}

/** Get active session for a specific product */
export function getDemoSessionForProduct(productId: string): DemoActiveSession | null {
  return readAll().find(s => s.productId === productId) ?? null;
}

/** Get the most recent active session across all products */
export function getMostRecentDemoSession(): DemoActiveSession | null {
  const all = readAll();
  return all.length > 0 ? all[0] : null;
}
