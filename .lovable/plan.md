

## Fix: Allow `devState` to Work Without `dev=1`

The onboarding preview at `/?devState=onboarding` doesn't work because `DevStateContext` requires `isDevToolsEnabled()` to be true first — which needs either `?dev=1` in the URL or a persisted localStorage flag.

### Root cause
In `DevStateContext.tsx` line 27, if `isDevToolsEnabled()` returns false, the context immediately returns `null` — ignoring the `devState` param entirely.

### Fix
Modify `DevStateContext.tsx` to also check for the presence of `devState` in the URL params directly, treating it as an implicit dev-tools activation:

**`src/contexts/DevStateContext.tsx`** — Change the early return so that if `devState` is present in the URL, it's accepted even without `?dev=1`:

```typescript
const devState = useMemo<DevState>(() => {
  const raw = params.get('devState');

  // If devState param exists, treat it as implicit dev activation
  if (raw && VALID_STATES.includes(raw as DevState)) {
    try { sessionStorage.setItem(DEV_STATE_STORAGE_KEY, raw); } catch {}
    return raw as DevState;
  }

  // For persisted states, still require dev tools enabled
  if (!isDevToolsEnabled()) return null;

  // Check persisted session state
  try {
    const persisted = sessionStorage.getItem(DEV_STATE_STORAGE_KEY);
    if (persisted && VALID_STATES.includes(persisted as DevState)) {
      return persisted as DevState;
    }
  } catch {}

  if (raw) {
    try { sessionStorage.removeItem(DEV_STATE_STORAGE_KEY); } catch {}
    console.warn(`[DevState] Unknown devState: "${raw}". Valid: ${VALID_STATES.join(', ')}`);
  }

  return null;
}, [params]);
```

This is a single-file change. After this, `/?devState=onboarding` will show the onboarding page directly.

