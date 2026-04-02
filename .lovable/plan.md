

## Fix: Async timing in ProductHome — with synchronous init

Two changes, no shims.

### File 1: `src/components/ProductIntro.tsx`

Change `useProductIntroNeeded` return type from `boolean` to `{ needed: boolean; checked: boolean }`:

```ts
// Before:
if (!checked) return false;
return needed;

// After:
return { needed, checked };
```

### File 2: `src/pages/ProductHome.tsx`

Replace the intro gating logic with a synchronous-first approach:

```ts
const { needed: needsIntro, checked: introChecked } = useProductIntroNeeded(product?.id ?? '');

// Synchronous init: if user has completed any session before, assume no intro needed.
// This prevents a single-frame flash of the intro for returning users.
const [showIntro, setShowIntro] = useState(() => {
  const hasFinishedBefore = localStorage.getItem('bonki-first-session-done');
  return !hasFinishedBefore; // new users: true, returning users: false
});

useEffect(() => {
  if (!introChecked) return;
  if (needsIntro && !showIntro) setShowIntro(true);   // DB says needed, override sync guess
  if (!needsIntro && showIntro) setShowIntro(false);   // DB says not needed, collapse
}, [introChecked, needsIntro]);
```

The `bonki-first-session-done` key already gets set elsewhere when a session completes (or we add it to the completion flow if missing). This gives us:

- **New user**: no localStorage key → `showIntro` starts `true` → DB confirms → stays true → intro shows
- **Returning user**: localStorage key exists → `showIntro` starts `false` → DB confirms → stays false → no flash
- **Edge case (cleared localStorage, DB has sessions)**: starts `true`, DB says not needed → single effect flip to `false` (acceptable — same dark background, imperceptible)

### Files edited
- `src/components/ProductIntro.tsx`
- `src/pages/ProductHome.tsx`

