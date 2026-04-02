

## Offline Queue Persistence

**File: `src/lib/offlineQueue.ts`**

Four additions to the existing file, no signature or logic changes:

1. **Restore on load** (after `let queue` declaration): Read `bonki-offline-queue` from localStorage, parse, filter out entries older than 24h (`createdAt < Date.now() - 86400000`).

2. **Persist on enqueue**: After `queue.push(entry)`, call `localStorage.setItem("bonki-offline-queue", JSON.stringify(queue))`.

3. **Persist after sync**: After `queue = failed`, either update localStorage or remove key if empty.

4. **Visibility listener**: Add `document.addEventListener("visibilitychange", ...)` alongside the existing `online` listener — calls `attemptSync()` when page becomes visible.

No other files touched. All exports and sync logic unchanged.

