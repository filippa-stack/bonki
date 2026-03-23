/**
 * Demo session persistence — tracks active (paused) sessions in localStorage
 * so resume banners and progress hooks work in demo mode.
 */

const STORAGE_KEY = 'bonki-demo-active-sessions';

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

/** Remove a demo session (on completion) */
export function completeDemoSession(productId: string, cardId: string): void {
  const all = readAll().filter(s => !(s.productId === productId && s.cardId === cardId));
  writeAll(all);
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
