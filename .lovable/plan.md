# Vårt Vi completion — remove product-color top band

## Diagnosis

In `src/pages/CardView.tsx` (Still Us completion branch, line 1787+), the page wrapper sets `backgroundColor: MIDNIGHT_INK` correctly. However the first child rendered inside is:

```tsx
<Header title="" variant="immersive" />
```

`Header` (immersive variant, `src/components/Header.tsx` line 68) sets:

```ts
backgroundColor: 'var(--page-bg, var(--surface-base))'
```

`--page-bg` is set globally by `useProductTheme` to the product's background color (cornflower for Vårt Vi via `useVerdigrisTheme(isStillUsCard)` and the still-us product theme). That's the cornflower band visible at the top of the completion screen — the immersive header inheriting the product page bg, not the Midnight Ink completion bg.

It also draws a faint bottom border, reinforcing the band appearance.

## Fix

Replace the `<Header title="" variant="immersive" />` in the Still Us completion branch with a plain safe-area spacer painted Midnight Ink. The header serves no functional purpose on this screen (no title, no back button — the back action lives in the CTA area below).

```tsx
<div style={{ height: 'env(safe-area-inset-top, 0px)', backgroundColor: MIDNIGHT_INK }} />
```

Scope: only the Still Us completion branch (line ~1812). Kids completion branch (line 1340) is not touched. Live/archive branches keep their headers.

## Verification (390×844)

- Complete a Vårt Vi session. Completion screen renders uniformly Midnight Ink top to bottom — no cornflower band.
- Saffron checkmark, headline, takeaway, CTAs unchanged.
- Kids completion screens unchanged.

## Files

- `src/pages/CardView.tsx` — Still Us completion branch only
