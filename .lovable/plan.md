## Diagnosis

Audit of every loading gate that paints a full-screen color before content resolves:

| Location | Current bg | Destination page bg | Status |
|---|---|---|---|
| `ProductHome.tsx` line 102 (intro-resolution gate) | `product.backgroundColor` (e.g. deep teal `#115D57`) | Kids home = Midnight Ink, Still Us = Deep Dusk | **WRONG** — flashes product color |
| `ProductHome.tsx` line 111 (paywall-access gate) | `product.backgroundColor` | same as above | **WRONG** |
| `KidsProductHome.tsx` line 368 (progress gate) | `MIDNIGHT_INK` | Midnight Ink | OK |
| `AdultProductHome.tsx` line 91 (progress gate) | Deep Dusk | Deep Dusk | OK |
| `KidsCardPortal.tsx` line 297 (progress gate) | `product.backgroundColor` | Portal renders on `product.backgroundColor` | OK (matches destination — spec says portals keep product color) |
| `CardView.tsx` line 1264 (session init gate) | `product.backgroundColor` | Kids session uses product color; Still Us session uses Midnight Ink | Partially wrong for Still Us |
| `App.tsx` `BonkiLoadingScreen` | `#0B1026` (Deep Dusk) | n/a — global splash | OK |
| `Category.tsx` line 194 (not-found) | `pageBg` (parchment / `#2E2233`) | matches | OK |

The user-visible flash on `/product/jag-i-mig` etc. originates from `ProductHome.tsx`'s two pre-resolution gates returning the product color before delegating to `KidsProductHome` (which is Midnight Ink).

## Fix

Replace the two `ProductHome.tsx` loading gates so they paint the correct **destination** background:

- Still Us (`product.id === 'still_us'`) → Deep Dusk `#0B1026` (matches `AdultProductHome`)
- All kids products → Midnight Ink `#1A1A2E` (matches `KidsProductHome`)
- Unknown product → Deep Dusk fallback

Also fix `CardView.tsx` line 1264 init-gate so Still Us sessions paint Midnight Ink (the actual session bg) while kids sessions keep `product.backgroundColor` (their session bg).

### Technical changes

**`src/pages/ProductHome.tsx`** — replace both gates:
```ts
const loadingBg = product?.id === 'still_us' ? '#0B1026' : '#1A1A2E';
// use loadingBg in both showIntro===null and paywallAccessLoading returns
```

**`src/pages/CardView.tsx`** line 1264:
```ts
const loadingBg = product?.id === 'still_us'
  ? '#1A1A2E'
  : (product?.backgroundColor ?? '#1A1A2E');
```

No other loading gates need changes — kids portal, kids session, and intro pages all correctly match their destination backgrounds.

## Verification

- Navigate library → `/product/jag-i-mig`: loading paints Midnight Ink, then content resolves on Midnight Ink. No teal flash.
- Navigate library → `/product/still-us`: loading paints Deep Dusk → AdultProductHome renders on Deep Dusk.
- Navigate product home → portal: portal loading paints the product color (unchanged, intentional).
- Hard refresh on any kids product home: initial paint is Midnight Ink.