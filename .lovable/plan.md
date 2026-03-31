

## Full-Canvas Background Ownership — Surface-Layer Fix

### Problem
`#root` and `body` use hardcoded `#0B1026`. Each page sets its own background on a `min-h-screen` div, but the app shell wrapper's `paddingBottom` (for bottom nav) creates a gap where `#root`'s dark background bleeds through. Same issue at top safe-area on light pages (Login, Diary, Categories).

### Approach
A new `usePageBackground` hook sets a `--page-bg` CSS variable on `:root`. Both `#root` and the app shell wrapper read this variable, so the active page's background fills the entire device canvas.

### Changes

**A. New file: `src/hooks/usePageBackground.ts`** — 6-line hook that sets `--page-bg` on `document.documentElement`. No cleanup (avoids dark flash during transitions).

**B. `src/index.css`** — Change `#root { background-color: #0B1026 }` → `background-color: var(--page-bg, #0B1026)`.

**C. `src/App.tsx` line 96** — Change `background: 'transparent'` → `background: 'var(--page-bg, #0B1026)'` on the wrapper div. Nothing else on that div changes.

**D. Add `usePageBackground(color)` to 16 files:**

| File | Color |
|---|---|
| `src/pages/Journal.tsx` | `MIDNIGHT_INK` |
| `src/pages/CardView.tsx` | `product?.backgroundColor ?? 'var(--surface-base, hsl(46, 64%, 89%))'` (the `loadingBg` value) |
| `src/pages/Login.tsx` | `'var(--surface-base)'` |
| `src/pages/ProductHome.tsx` | `'var(--surface-base)'` |
| `src/pages/KidsCardPortal.tsx` | `product?.backgroundColor ?? MIDNIGHT_INK` |
| `src/pages/Category.tsx` | Multiple returns — `MIDNIGHT_INK` for kids view, `'#FAF7F2'` for fallback, `EMBER_NIGHT` for Still Us view |
| `src/pages/Diary.tsx` | `'#F8F4EE'` |
| `src/pages/Home.tsx` | `COLORS.emberNight` |
| `src/pages/Paywall.tsx` | `COLORS.emberNight` |
| `src/pages/StillUsExplore.tsx` | `EMBER_NIGHT` |
| `src/pages/SoloReflect.tsx` | `COLORS.emberNight` |
| `src/pages/DissolutionSettings.tsx` | `COLORS.emberNight` |
| `src/pages/TillbakaComplete.tsx` | `COLORS.emberNight` |
| `src/components/ProductLibrary.tsx` | `libraryBg` (resolves to `'#0B1026'`) |
| `src/components/Onboarding.tsx` | `'#1A1A2E'` |
| `src/pages/still-us-routes/SuIntroPortal.tsx` | `BG` |

**Category.tsx note:** This page has 3 different return paths with different backgrounds. The hook call needs to be placed in each sub-component or conditionally with the resolved bg color.

### Not modified
- Navigation, spacing, typography, z-index, scroll, sticky behavior
- `body` background in `index.html` (stays `#0B1026`)
- Bottom nav component
- Protected patterns (suppressUntilRef, prevServerStepRef, clearTimeout, hasSyncedRef)
- `AnimatePresence` mode, `useLayoutEffect` in `useDefaultTheme`
- No `100dvh` introduced

