

## Pre-Launch Audit Fixes — Round 2

Four files, one concern each.

### Fix 1: Category.tsx — Replace Driftwood in Still Us sections
**File:** `src/pages/Category.tsx`

Five lines where `DRIFTWOOD` is used on the dark `#2E2233` background:

- **Line 197** — "not found" text: conditional since `pageBg` varies. Use `isStillUsCategory ? 'rgba(253, 246, 227, 0.6)' : DRIFTWOOD`
- **Line 662** — subtitle `color`: change to `'rgba(253, 246, 227, 0.6)'` (this is inside the Still Us render branch starting ~line 620)
- **Line 678** — progress count `color`: same
- **Line 767** — card subtitle `color`: same
- **Line 805** — bottom message `color`: same (remove the separate `opacity: 0.7` on line 806 since the rgba already has 0.6 opacity)

Non-Still-Us Driftwood usages remain untouched.

### Fix 2: NextActionBanner.tsx — Replace Driftwood in "all done" state
**File:** `src/components/NextActionBanner.tsx` — line 68

```
// FROM:
labelColor = DRIFTWOOD;
// TO:
labelColor = 'rgba(253, 246, 227, 0.65)';
```

Also remove the `DRIFTWOOD` import if it becomes unused. Check if it's used elsewhere in the file first — it is not (only states 1 and 3 use `LANTERN_GLOW`).

### Fix 3: Header.tsx — Remove localStorage.removeItem
**File:** `src/components/Header.tsx` — lines 196-199

```
// FROM:
onClick={() => {
  localStorage.removeItem('bonki-last-active-product');
  navigate('/', { replace: false });
}}
// TO:
onClick={() => {
  navigate('/', { replace: false });
}}
```

### Fix 4: useDefaultTheme.ts — Set dark defaults instead of cream
**File:** `src/hooks/useDefaultTheme.ts` — lines 21-23

```
// FROM:
root.style.setProperty('--text-primary', 'hsl(20, 16%, 15%)');
root.style.setProperty('--text-secondary', 'hsl(29, 13%, 37%)');
root.style.setProperty('--surface-base', 'hsl(46, 64%, 89%)');
// TO:
root.style.setProperty('--text-primary', 'hsl(36, 20%, 88%)');
root.style.setProperty('--text-secondary', 'hsl(36, 15%, 65%)');
root.style.setProperty('--surface-base', '#0B1026');
```

The text values switch from dark-on-cream to light-on-dark to match the app's dark default. `--surface-base` uses the same Midnight Ink as `:root`.

### Not changed
- Non-Still-Us Driftwood in Category.tsx
- NextActionBanner states 1 and 3 (LANTERN_GLOW)
- Header navigation logic
- useDefaultTheme Verdigris cleanup logic
- Any other file

