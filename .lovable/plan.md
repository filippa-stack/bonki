

## Plan: Standardize Bottom Padding for BottomNav Visibility

### Changes (11 files)

| # | File | Current | New |
|---|------|---------|-----|
| 1 | `src/pages/still-us-routes/SuIntroPortal.tsx` (line 209) | `calc(env(safe-area-inset-bottom, 0px) + 24px)` | `calc(72px + env(safe-area-inset-bottom, 0px))` |
| 2 | `src/components/ProductLibrary.tsx` (line 915) | `calc(48px + env(safe-area-inset-bottom, 0px))` | `calc(72px + env(safe-area-inset-bottom, 0px))` |
| 3 | `src/components/JagIVarldenProductHome.tsx` (line 69) | `paddingBottom: '0px'` | `paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))'` |
| 4 | `src/components/KidsProductHome.tsx` (line 545) | `paddingBottom: '0px'` | `paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))'` |
| 5 | `src/components/VardagProductHome.tsx` (line 77) | `paddingBottom: '80px'` | `paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))'` |
| 6 | `src/components/SexualitetProductHome.tsx` (line 76) | `paddingBottom: '80px'` | `paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))'` |
| 7 | `src/components/JagMedAndraProductHome.tsx` (line 75) | `paddingBottom: '80px'` | `paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))'` |
| 8 | `src/pages/ProductHome.tsx` (line 218) | `className="text-center pb-16"` (64px) | Add `style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}` and remove `pb-16` |
| 9 | `src/pages/Diary.tsx` (line 501) | `className="px-5 pb-16"` (64px) | Change to `pb-[calc(72px+env(safe-area-inset-bottom,0px))]` or add inline style override |
| 10 | `src/pages/Journey.tsx` (wraps at line 216) | No bottom padding | Add `paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))'` to the outer div style |

### Already Correct — No Changes
- `StillUsExplore.tsx` — already has `120px` padding (line 150)
- `KidsCardPortal.tsx` — already has `72px + safe-area`
- `JagIMigProductHome.tsx` — has `80px`
- `SyskonProductHome.tsx` — has `80px`
- `Home.tsx` — dead code, skip

### Protected Patterns
After changes, will confirm all four protected ref patterns remain unmodified:
- `suppressUntilRef.current = Date.now() + 2000`
- `prevServerStepRef.current = serverStepIndex`
- `clearTimeout(pendingSave.current)`
- `hasSyncedRef.current = true`

### Technical Detail
The standard value `calc(72px + env(safe-area-inset-bottom, 0px))` = 56px nav + 16px breathing room + iOS safe area. Applied to the scrollable content container in each case, not a fixed wrapper.

