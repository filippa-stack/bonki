// src/lib/offlineQueue.ts
// Local-first write queue for Still Us sessions.
// Writes go to memory first, then sync to Supabase when online.

type QueuedWrite = {
  id: string;
  table: string;
  operation: 'upsert' | 'update';
  match: Record<string, unknown>;
  data: Record<string, unknown>;
  createdAt: number;
};

let queue: QueuedWrite[] = [];
let isSyncing = false;
let syncListener: (() => void) | null = null;

export function enqueueWrite(write: Omit<QueuedWrite, 'id' | 'createdAt'>): void {
  const entry: QueuedWrite = {
    ...write,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  queue.push(entry);
  attemptSync();
}

export async function attemptSync(): Promise<void> {
  if (isSyncing || queue.length === 0) return;
  if (!navigator.onLine) return;

  isSyncing = true;

  const { supabase } = await import('@/integrations/supabase/client');

  const pending = [...queue];
  const failed: QueuedWrite[] = [];

  for (const write of pending) {
    try {
      let error: unknown = null;

      if (write.operation === 'upsert') {
        const result = await (supabase as any)
          .from(write.table)
          .upsert(write.data);
        error = result.error;
      } else if (write.operation === 'update') {
        let query = (supabase as any).from(write.table).update(write.data);
        for (const [key, value] of Object.entries(write.match)) {
          query = query.eq(key, value);
        }
        const result = await query;
        error = result.error;
      }

      if (error) {
        console.warn('Offline queue: write failed, will retry', write.id, error);
        failed.push(write);
      }
    } catch (err) {
      console.warn('Offline queue: network error, will retry', write.id, err);
      failed.push(write);
    }
  }

  queue = failed;
  isSyncing = false;

  if (syncListener) syncListener();
}

export function getPendingCount(): number {
  return queue.length;
}

export function hasPendingWrites(): boolean {
  return queue.length > 0;
}

export function onSyncStatusChange(callback: () => void): () => void {
  syncListener = callback;
  return () => { syncListener = null; };
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    attemptSync();
  });
}
