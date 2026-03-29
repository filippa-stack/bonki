

## Updated Plan: Fix Screen Flashing — with verified conditions

### Condition 1: Library remount — CONFIRMED ✅
`ProductLibrary` renders inside `Index` at route `/`. With `AnimatePresence mode="wait"` and `key={location.pathname}`, navigating away and back fully unmounts/remounts the tree. The `[]` dependency on `useDefaultTheme` will re-fire correctly.

### Condition 2: Additional routes needing `useDefaultTheme` — FOUND
These light-themed pages have no theme hook and will show dark-var bleed if visited after a dark product page:

| Route | File | Action |
|---|---|---|
| `/journal` | `Journal.tsx` | Add `useDefaultTheme()` |
| `/diary/:productId` | `Diary.tsx` | Add `useDefaultTheme()` |
| `/unlock` | `Paywall.tsx` | Add `useDefaultTheme()` |
| `/paywall-full` | `PaywallFullScreen.tsx` | Add `useDefaultTheme()` |
| `/settings/dissolve` | `DissolutionSettings.tsx` | Add `useDefaultTheme()` |

These dark-themed Still Us pages should probably call `useVerdigrisTheme` but that's a separate concern — the current fix is about preventing light-page bleed.

### Changes (revised from previous plan)

**1. Remove cleanup from `useProductTheme.ts`** — delete the return cleanup function

**2. Remove CSS var cleanup from `VerdigrisAtmosphere.tsx`** — keep class cleanup only

**3. Create `src/hooks/useDefaultTheme.ts`** — resets vars to `:root` defaults with `// Must match :root defaults in index.css` comment

**4. Call `useDefaultTheme()` in 8 files** (expanded from original 3):
- `src/components/ProductLibrary.tsx`
- `src/pages/Login.tsx`
- `src/pages/SharedSummary.tsx`
- `src/pages/Journal.tsx`
- `src/pages/Diary.tsx`
- `src/pages/Paywall.tsx`
- `src/pages/PaywallFullScreen.tsx`
- `src/pages/DissolutionSettings.tsx`

**5. Fix PastelTile forwardRef** in `ProductLibrary.tsx`

### Files changed
| File | Change |
|---|---|
| `src/hooks/useProductTheme.ts` | Remove cleanup return |
| `src/components/VerdigrisAtmosphere.tsx` | Remove CSS var cleanup (keep class cleanup) |
| `src/hooks/useDefaultTheme.ts` | New file |
| `src/components/ProductLibrary.tsx` | Add `useDefaultTheme()` + fix forwardRef |
| `src/pages/Login.tsx` | Add `useDefaultTheme()` |
| `src/pages/SharedSummary.tsx` | Add `useDefaultTheme()` |
| `src/pages/Journal.tsx` | Add `useDefaultTheme()` |
| `src/pages/Diary.tsx` | Add `useDefaultTheme()` |
| `src/pages/Paywall.tsx` | Add `useDefaultTheme()` |
| `src/pages/PaywallFullScreen.tsx` | Add `useDefaultTheme()` |
| `src/pages/DissolutionSettings.tsx` | Add `useDefaultTheme()` |

### Not touched
- AnimatePresence / PageTransition logic
- Session creation, save, or reflection logic
- All four protected ref patterns

