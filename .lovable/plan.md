

## Bug: Intro skipped because `useProductIntroNeeded` defaults `needed` to `false`

### Root cause

In `src/components/ProductIntro.tsx` line 445:
```tsx
const [needed, setNeeded] = useState(false);
```

When a user isn't logged in (common after onboarding), the hook hits the `!user` branch, sets `checked: true`, and returns `{ needed: false, checked: true }`. The effect in `ProductHome` sees `introChecked=true, needsIntro=false` and immediately hides the intro.

Even for logged-in users, the `false` default means there's a brief window where `checked` becomes `true` before the async query resolves — but the real issue is the unauthenticated path.

### Fix

**File:** `src/components/ProductIntro.tsx` — one line change

Change the default for `needed` from `false` to `true`:

```tsx
// Line 445 — before:
const [needed, setNeeded] = useState(false);

// After:
const [needed, setNeeded] = useState(true);
```

This means:
- **Fresh/unauthenticated users**: `needed` stays `true`, intro shows (correct)
- **Returning users with completed sessions**: async query resolves, sets `needed: false`, intro is hidden (correct)
- **Returning users without completed sessions**: query finds nothing, sets `needed: true` (already the default, no change)

The `!user` branch should also set `needed: true` for safety:
```tsx
if (!user || cancelled) { setNeeded(true); setChecked(true); return; }
```

No other files touched.

