## Portal v2 — resolver + card sizing (one pass)

Single-file change: `src/pages/AdultCardPortal.tsx`. Data in `stillUsPortalCopy.ts` is verified populated (all 18 entries, `expressing-needs` matches spec). Only wiring + sizing to fix.

### Fix A — id resolver

Add at top of file (just below the existing `getPortalCopy` import):

```ts
import { CARD_SEQUENCE, bareIdFromSlug } from '@/data/stillUsSequence';

function resolveBareCardId(cardId: string): string {
  const m = cardId.match(/^su-mock-(\d+)$/);
  if (m) {
    const seq = CARD_SEQUENCE[Number(m[1])];
    if (seq) return bareIdFromSlug(seq.cardId);
  }
  return bareIdFromSlug(cardId);
}
```

Update both portal-copy lookups in the render to use it:
- subtitle override block: `getPortalCopy(resolveBareCardId(card.id))`
- preparation paragraph block: `getPortalCopy(resolveBareCardId(card.id))`

### Fix B — card tile sizing

Change the card `<button>` style from:
```
width: '80%', maxWidth: '320px', aspectRatio: '3 / 4'
```
to:
```
width: '100%', maxWidth: '280px', maxHeight: '45vh', aspectRatio: '3 / 4'
```

Already centered by parent flex.

### Verification (after switching to build mode)

Visit each card and confirm:
- `expressing-needs` (su-mock-3, Tillsammans) — subtitle "Tystnadens innehåll – och priset vi betalar"; prep starts "Vi håller ofta tillbaka tankar och känslor…"
- `our-traditions` (su-mock-0, Grunden) — subtitle "Mönstren vi ärvde – och de vi skapar idag"; prep starts "Det här samtalet har sina rötter…"
- `family-ab` (su-mock-14, Riktningen) — subtitle "Dragningen utåt – och var gränserna går"; prep starts "Det är mänskligt att lägga märke till andra…"
- Card visually balanced with copy on 444×720; sticky CTA still pinned.

If any of the three renders without prep copy after the resolver fix, that means CARD_SEQUENCE indexing diverges from manifest indexing — will flag rather than mask.
