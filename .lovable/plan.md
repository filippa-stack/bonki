

## Fix: Background Bleed + BottomNav Content Overlap

### Analysis: Which pages set their own background?

Every page that renders inside the app sets its own background explicitly:
- **Library** (`ProductLibrary.tsx`): `#0B1026`
- **Login**: `var(--surface-base)` (Petrol Teal)
- **Onboarding**: `#1A1A2E` (inline)
- **Journal**: `MIDNIGHT_INK`
- **Diary**: `#F8F4EE`
- **Home (Still Us)**: `COLORS.emberNight`
- **Paywall**: `COLORS.emberNight`
- **CompletionCeremony**: `COLORS.emberNight`
- **StillUsExplore**: `EMBER_NIGHT`
- **KidsCardPortal**: `product.backgroundColor`
- **ProductHome**: each product component sets its own BG
- **Categories / SavedConversations**: `var(--color-bg-base)`
- **NotFound**: `bg-muted` (Tailwind class)
- **AnalyticsDashboard**: `page-bg` (CSS class)
- **CardView**: loading state uses `page-bg`, active state uses session shell

**Conclusion**: No page relies on the `#root` fallback as its visible background. Every page sets its own. Changing `#root` to `#0B1026` is safe — it only shows during the pre-hydration flash, and matching it to the library (the most common landing page) is correct.

### Changes — 3 files

**1. `src/index.css` (line 6)** — Fix `#root` background
- Change `#1A1A2E` → `#0B1026` to match the library's actual background color
- Also update `index.html` body inline style if present (checked: no inline body background exists, only `theme-color` meta — no change needed)

**2. `src/pages/KidsCardPortal.tsx` (line 349)** — Fix BottomNav overlap
- Change `maxHeight: 'calc(100vh - 280px)'` → `maxHeight: 'calc(100vh - 340px)'`
- This adds 60px more space for the BottomNav (56px) + breathing room
- **Keep `height: '100vh'`** on line 259 — do NOT change to `100dvh` (codebase convention: `100dvh` causes layout reflow on iOS Safari)

**3. No change to `App.tsx`** — The existing `paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))'` on line 96 stays. It provides the global safe-area clearance for all pages. Removing it would break other pages.

### Files changed: 2
- `src/index.css`
- `src/pages/KidsCardPortal.tsx`

