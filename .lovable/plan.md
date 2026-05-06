## Vårt Vi tile — circular medallion frame

Single-file change to `src/components/AdultProductCardTile.tsx`. Wraps the illustration in a centered circular medallion whose fill is a tonally contrasting tint of the card's anchor color. Outer card, accent line, title zone, and checkmark all unchanged.

### Changes to `src/components/AdultProductCardTile.tsx`

1. **Add `getCircleColor` helper** (module scope, above the component). Imports `CORNFLOWER`, `MIDNIGHT_INK`, `DUSTY_ROSE`, `WARM_GOLD`, `STORM_GREY`, `SAGE` — all already exported from `src/lib/palette.ts` (verified).

   ```ts
   function getCircleColor(cardColor: string): string {
     switch (cardColor) {
       case CORNFLOWER:   return '#5A85D5'; // darker (only light anchor)
       case MIDNIGHT_INK: return '#2A2D45';
       case DUSTY_ROSE:   return '#C99A9D';
       case WARM_GOLD:    return '#E8D4A8';
       case STORM_GREY:   return '#5A6573';
       case SAGE:         return '#A8B5A8';
       default:           return cardColor;
     }
   }
   ```

2. **Rewrite Zone A (top 65%)** — replace the current full-bleed `<img>` with a centered circular medallion:
   - Wrapper `div` keeps `flex: '0 0 65%'`, `position: relative`, `overflow: hidden`, plus `display: flex`, `alignItems: center`, `justifyContent: center`.
   - Inside: medallion `div` — `width: 78%`, `aspectRatio: 1/1`, `borderRadius: 50%`, `backgroundColor: getCircleColor(cardColor)`, `overflow: hidden`, centered flex.
   - Inside medallion: `<img src={tileImage}>` — `width: 85%`, `height: 85%`, `objectFit: contain`, `objectPosition: center`. Drop the existing 6px padding on the image.
   - Keep the existing 8px bottom inner-shadow gradient (rendered above the medallion via stacking).
   - Keep the saffron checkmark exactly where it is (`top: 12, right: 12`, on the card mat — Option A).

3. **Unchanged:** outer card (3:4, 22px radius, border, shadow, anchor `backgroundColor`), 1px warm-gold accent line, Zone B title (35%, padding, font, color), checkmark style/animation, navigation handler, `useCardImage` hook, `skipPillAnimation` logic.

### Out of scope
- `ProductCardTile.tsx` (kids) — untouched
- `AdultProductHome.tsx` anchor rotation — untouched
- Palette, portal, session, routing — untouched

### Verification (390×844)
- `/product/still-us`: each of the six anchor colors shows a visible contrasting circle; illustration sits inside without clipping; mat color frames the circle; gold accent line and title preserved; checkmark renders top-right on the mat.
- `/product/jag-i-mig`: kids tiles unchanged.
- Adult portal: inherits automatically since it reuses `AdultProductCardTile`.

If any circle hex reads too close to its mat in the live preview, nudge the value toward more contrast (darker for cornflower, lighter for the rest) — mockup is source of truth.
