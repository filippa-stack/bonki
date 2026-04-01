

## Fix: Move BottomNav Padding From Global Wrapper to Pages That Need It

### Root Cause
`App.tsx` line 96 applies `paddingBottom: calc(56px + env(safe-area-inset-bottom))` to ALL routes. Fullscreen pages (portals, ceremonies, paywalls) get unwanted bottom padding pushing content out of viewport.

### Audit Results

| Page | Already has bottom padding? | Action |
|------|---------------------------|--------|
| **App.tsx** (global wrapper) | Yes — the problem | **Remove paddingBottom** |
| ProductLibrary.tsx (Index) | Yes — spacer div line 913 | None |
| KidsProductHome.tsx | `16px` only | **Change to `calc(56px + safe-area)`** |
| StillUsExplore.tsx | None | **Add `calc(56px + safe-area)`** |
| Journal.tsx | Yes — line 762 | None |
| Journey.tsx | Yes — line 219 | None |
| Category.tsx | Yes — lines 391, 682 | None |
| Diary.tsx | Yes — line 505 | None |
| KidsCardPortal.tsx | Yes — line 580 | None |
| SharedSummary.tsx | No | **Add `calc(56px + safe-area)`** |
| SuIntroPortal.tsx | Yes — spacer div line 211 | None |
| Paywall.tsx | No (centered layout) | **Add `paddingBottom: calc(56px + safe-area)`** |
| ProductHome.tsx (Still Us) | Yes — line 224 | None |
| JagIVarldenProductHome | Yes — line 69 | None |
| VardagProductHome | Yes — line 77 | None |

### Changes (5 files)

**1. `src/App.tsx` line 96** — Remove paddingBottom from global wrapper
```
style={{ minHeight: '100vh', background: 'var(--page-bg, #0B1026)' }}
```

**2. `src/components/KidsProductHome.tsx` line 549** — Change paddingBottom
```
paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
```

**3. `src/pages/StillUsExplore.tsx` line 111** — Add paddingBottom to outer container
```
<div className="min-h-screen flex flex-col" style={{ backgroundColor: EMBER_NIGHT, paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}>
```

**4. `src/pages/SharedSummary.tsx`** — Add paddingBottom to outer scrollable container

**5. `src/pages/Paywall.tsx` line 114** — Change padding to include bottom clearance
```
padding: '48px 24px calc(56px + env(safe-area-inset-bottom, 0px))',
```

### Pages that benefit (no longer get unwanted padding)
CardView, KidsCardPortal, CompletionCeremony, PaywallFullScreen, SoloReflect, DissolutionSettings, JourneyPreview, TillbakaComplete, CardPreview, Login — all fullscreen pages that manage their own viewport.

### Risk
Low. Moving an existing CSS value from one global location to specific pages. No logic changes.

