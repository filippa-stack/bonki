

## Root Cause

Two interacting bugs cause text loss during typing:

### Bug 1: `setText` silently drops text when `myReflection` is null

In `useSessionReflections.ts` line ~199:
```js
setMyReflection(prev => prev ? { ...prev, text } : null);
```
When a new prompt loads, the fetch finds no existing row, creates an empty draft (fire-and-forget), but **does not** set `myReflection` locally. So `myReflection` stays `null`. When the user types, `setText` tries to spread into `prev` — but `prev` is null, so it returns null. The autosave still works (it reads from refs), but `myReflection` never becomes non-null from user input alone.

### Bug 2: CardView sync effect clears text on every `myReflection` change

In `CardView.tsx` lines 657–665:
```js
useEffect(() => {
    if (kidsNoteSession.loading) return;
    if (kidsNoteSession.myReflection?.text && ...) {
      setKidsNoteLocalText(kidsNoteSession.myReflection.text);
    } else {
      setKidsNoteLocalText('');  // ← wipes user's text
    }
  }, [kidsNoteSession.loading, kidsNoteSession.myReflection, ...]);
```
Since `myReflection` stays null (bug 1), this effect always takes the `else` branch and **clears `kidsNoteLocalText`** whenever the effect re-runs — e.g. when `loading` transitions, or when the realtime subscription delivers the empty-draft row (with `text: ''`, which is falsy).

The combination: user types → autosave timer starts → realtime delivers empty draft row → `myReflection` becomes `{ text: '' }` → sync effect fires → `myReflection.text` is falsy → `setKidsNoteLocalText('')` → **text gone**.

## Fix

### File 1: `src/hooks/useSessionReflections.ts`

In `setText` callback (~line 199), handle the null case by creating a skeleton reflection object:
```js
setMyReflection(prev =>
  prev
    ? { ...prev, text }
    : {
        id: '',
        sessionId: sessionIdRef.current || '',
        stepIndex: stepIndexRef.current,
        userId: userIdRef.current || '',
        text,
        state: 'draft' as ReflectionState,
        updatedAt: new Date().toISOString(),
      }
);
```

### File 2: `src/pages/CardView.tsx`

Change the sync effect (lines 657–665) to only sync on initial load, not on every myReflection change. Use a `hasSyncedRef` pattern (same as `SessionStepReflection` already does):

```js
const kidsNoteSyncedRef = useRef(false);

useEffect(() => { kidsNoteSyncedRef.current = false; }, [kidsNoteStepIndex]);

useEffect(() => {
    if (kidsNoteSession.loading) return;
    if (kidsNoteSyncedRef.current) return; // Already synced for this prompt
    kidsNoteSyncedRef.current = true;
    if (kidsNoteSession.myReflection?.text && 
        kidsNoteSession.myReflection.stepIndex === kidsNoteStepIndex) {
      setKidsNoteLocalText(kidsNoteSession.myReflection.text);
      setKidsNoteExpanded(true);
    } else {
      setKidsNoteLocalText('');
    }
  }, [kidsNoteSession.loading, kidsNoteSession.myReflection, kidsNoteStepIndex]);
```

Remove `localPromptIndex` from dependencies (redundant — `kidsNoteStepIndex` already encodes it).

### Not changed
- Auth logic, route definitions, session lifecycle
- `SessionStepReflection.tsx` (already uses `hasSyncedRef` correctly)
- Any other file

