

## Navigation Reliability Fix

### Problem Analysis

Two root causes found:

**1. Double bottom navigation on Still Us Home**
- `Home.tsx` (lines 500-519) renders its own fixed bottom nav with BIBLIOTEKET / ERT RUM / ERA SAMTAL tabs
- `BottomNav.tsx` (rendered in `App.tsx` line 139) also renders on `/?product=still-us` because its hide-rules only check path prefixes, not the `?product=still-us` query param
- Result: two overlapping navigation bars at the bottom

**2. Unreliable product routing via `bonki-last-active-product`**
- `Index.tsx` reads `bonki-last-active-product` from localStorage and auto-redirects returning users to that product
- This redirect fires even when the user intentionally navigated to `/` (e.g. tapping "Biblioteket" in Home.tsx's own nav)
- Kids product CTA → `/card/{id}` → back → `/` → auto-redirect to last product (could be Still Us) instead of library
- Multiple components set this flag (`CardView`, `ProductHome`) but clearing it is inconsistent

### Plan

#### Step 1: Unify bottom navigation — remove Home.tsx's duplicate nav
Remove the custom NavTab bar from `Home.tsx` (lines 500-519 and the NavTab component). Instead, make `BottomNav.tsx` show correctly on `/?product=still-us` with the "Still Us" tab active. This is already the case — BottomNav's match logic handles it. The only change needed is removing the duplicate from Home.tsx.

#### Step 2: Hide BottomNav during immersive Still Us screens
Add `/?product=still-us` awareness to BottomNav's hide rules so it does NOT hide on Still Us home (it should show there), but ensure it hides on all the right paths. Currently correct — no change needed here.

#### Step 3: Add route guards for product-scoped navigation
- In `ProductIntro.handleCta`: after `onStartFreeCard()` returns, ensure the navigation target is validated (already correct per code review)
- In `Home.tsx`: the BIBLIOTEKET nav tab calls `navigate('/')` but doesn't clear `bonki-last-active-product` → add `localStorage.removeItem('bonki-last-active-product')` before navigating to `/`
- In `Index.tsx`: make `bonki-last-active-product` redirect only fire when the user arrives at `/` without an explicit navigation intent (not from an in-app navigation that targets `/`)

#### Step 4: Defensive guard in kids free card flow
- In `ProductHome.tsx` `onStartFreeCard`: set `bonki-last-active-product` to the current kids product slug BEFORE navigating to `/card/{id}`, ensuring any back-navigation returns to the correct product

### Files Changed
1. **`src/pages/Home.tsx`** — Remove custom NavTab bar (lines ~500-540) and the NavTab component. Add `localStorage.removeItem('bonki-last-active-product')` to the "Biblioteket" navigation.
2. **`src/components/BottomNav.tsx`** — Minor: ensure BottomNav properly handles the Still Us home state (already works, may need small style tweak for visual consistency).
3. **`src/pages/ProductHome.tsx`** — Set `bonki-last-active-product` to current product slug in `onStartFreeCard` before navigate.

