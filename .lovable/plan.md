# Vårt Vi portal — design system alignment

Scope: `src/pages/AdultCardPortal.tsx` only. Kids portal and other pages untouched.

## 1. Card preview → medallion composition

Currently the portal renders its own ad-hoc full-bleed preview (illustration directly on the cornflower mat, no circle). Tile and portal duplicate logic, so the recent medallion change didn't propagate.

Approach: keep the portal preview as its own JSX (it is a CTA-bearing larger preview, not a navigating tile), but consolidate the `getCircleColor` helper.

Steps:
- Export `getCircleColor` from `src/components/AdultProductCardTile.tsx` so both files share it.
- In `AdultCardPortal.tsx`, import `getCircleColor` and rebuild the preview's illustration zone to mirror the tile structure:
  - Outer card: `aspectRatio: 3/4`, `backgroundColor: cardColor`, rounded `22px`, same border/shadow as tile.
  - Two zones: top illustration zone `flex: 0 0 65%` containing a centered medallion; bottom title strip `flex: 1 1 auto` with `titleZoneBg` and the card title (matches tile so portal preview reads as an enlarged tile).
  - Medallion: circle at **60% of card width**, `borderRadius: 50%`, `backgroundColor: getCircleColor(cardColor)`.
  - Illustration inside circle: **80% width/height**, `objectFit: contain`.
  - Keep the 1px warm-gold accent line between zones.
  - Keep saffron `✓ Klart` indicator inside the illustration zone (top-right of medallion area), matching tile.
- Preview container sizing: keep `maxWidth: 280px`, `maxHeight: 45vh`, centered. Remove the current `flex flexDirection: column` quirks that don't match the tile.

## 2. CTA stops overlapping the card

The sticky CTA (`position: fixed`, `bottom: calc(56px + safe-area)`) currently visually sits on top of the card on short viewports because the scroll content's `paddingBottom` only accounts for nav+CTA height but the card preview itself extends to the CTA edge with no breathing room.

Fix: the sticky CTA stays sticky (matches resume banner pattern), but ensure the card never visually collides:
- Increase scroll region `paddingBottom` to `calc(56px + 140px + env(safe-area-inset-bottom))` so prev/next nav clears the CTA with ≥24px gap.
- Add `marginBottom: 24px` after the card preview block before the completion+nav stack.
- The CTA pill `maxWidth: 320px` (narrower than the 280px card visually feels equal due to pill height; actually keep at 320 to match resume banner) — confirmed: keep current `420px` cap but matches the existing system. No overlap because it's pinned to viewport bottom above bottom-nav.

If user prefers an in-flow (non-sticky) CTA below the card, that is a separate decision; current sticky pattern is consistent with the rest of adult Vårt Vi.

## 3. Preparation paragraph typography refinement

Content unchanged (Ida's clinical copy via `getPortalCopy().preparation`).

Adjust the existing block:
- `fontFamily: var(--font-display)`
- `fontSize: 15px`, `lineHeight: 1.55`, `letterSpacing: 0`
- `color: LANTERN_GLOW`, `opacity: 0.85`
- `maxWidth: 320px`, centered (`margin: 24px auto 32px`)
- `textAlign: center` (current is left — center reads as quieter editorial preparation in this column composition)

## 4. CTA color → warm gold

Replace card-anchor-tinted CTA with unified warm-gold:

```ts
backgroundColor: `color-mix(in srgb, ${WARM_GOLD} 28%, rgba(255,255,255,0.06))`,
border: `1px solid color-mix(in srgb, ${WARM_GOLD} 50%, transparent)`,
color: LANTERN_GLOW,
```

Remove `ctaBg`/`ctaBorder` derived from `cardColor`.

## 5. Vertical rhythm

Final order in the scroll region:

```text
eyebrow (category)
title
subtitle
24px
preparation paragraph (centered, 320px)
32px
card preview (medallion-on-mat, 280px)
24px
✓ Klart (if completed)
16px
sequence nav (Föregående · N AV M · Nästa)
[sticky CTA pinned above bottom-nav]
```

Time estimate row: not currently rendered in portal — leaving out unless data exists; spec lists it as conditional.

## Verification (444×720 preview viewport)

Cards to check:
- `expressing-needs` (cornflower) — medallion uses `#5A85D5`, CTA warm-gold
- `our-traditions` — different anchor color, medallion contrasts, CTA still warm-gold
- A Midnight Ink card — medallion uses `#2A2D45`, CTA still warm-gold

Compare portal preview side-by-side with product home tile for the same card: same compositional language, just larger.

## Files

- `src/components/AdultProductCardTile.tsx` — export `getCircleColor`
- `src/pages/AdultCardPortal.tsx` — preview rebuild, prep typography, CTA color, spacing
