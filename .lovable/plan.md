

## Prompt 4a — Remove Onboarding Gate + Fix Paywall Bypass

Four files, exact changes as specified.

---

### File 1: `src/pages/Index.tsx`

**Remove imports** (lines 7, 10, 11, 12, 15, 17):
- `useDevState`, `isDemoMode`, `Onboarding`, `BonkiLoadingScreen`, `PurchaseScreen`, `ProductIntro`

**Remove** `DevProductIntroPreview` function (lines 60–76).

**Remove** `let audienceRouteConsumed = false;` (line 79).

**Line 82** — change to: `const { } = useApp();`

**Remove** `const devState = useDevState();` (line 85).

**Remove** `const [dbOnboardingChecked, ...]` state (line 89).

**Remove** DB onboarding bypass useEffect (lines 99–118).

**Remove** all four devState blocks (lines 122–141).

**Remove** `const devBypassGates = !!devState;` (line 146).

**Remove** `const demoActive = isDemoMode();` (line 149).

**Remove** audience routing block (lines 151–167).

**Remove** onboarding gate (lines 170–173).

**Keep**: migration useEffect, usePartnerNotifications, post-purchase redirect, skip-to-product, par-first-visit, ProductLibrary return.

---

### File 2: `src/components/BottomNav.tsx`

**Remove imports** (lines 5–6): `isDemoMode`, `useApp`.

**Remove lines 52–57**: `hasCompletedOnboarding` destructuring, `demoActive`, `devBypass`, and the early return.

---

### File 3: `src/pages/ProductHome.tsx`

**Remove import** `isProductFreeForUser` (line 14).

**Remove** `const isFreeProduct = ...` (line 74).

**Line 125** — change `!isFreeProduct && !hasProductAccess` to just `!hasProductAccess`.

---

### File 4: `src/pages/KidsCardPortal.tsx`

**Remove imports** `isProductFreeForUser` (line 12), `FreeCardBadge` (line 14).

**Line 203** — remove `card.id !== product.freeCardId &&` from the condition.

**Line 311** — change to `const isFreeCard = false;`.

**Remove** GRATIS badge block (lines 515–518).

---

### Files Modified
- `src/pages/Index.tsx`
- `src/components/BottomNav.tsx`
- `src/pages/ProductHome.tsx`
- `src/pages/KidsCardPortal.tsx`

### Not Changed
- CardView.tsx, AppContext.tsx, Onboarding.tsx, ProductIntro.tsx, AuthContext.tsx, freeCardPolicy.ts

