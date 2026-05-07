## Vårt Vi — bind illustrations to card ID

### 1. Extract & convert Emma's 18 PNGs to WebP in `public/card-images/`

Filename mapping (Emma → saved as):

| Emma file | Saved as |
|---|---|
| rösternautifrån.png | thoughtful-space.webp |
| osagt.png | expressing-needs.webp |
| vänskap.png | behind-the-scenes.webp |
| osynliga ansvaret.png | smallest-we.webp |
| egnautrymmet.png | self-esteem-wavering.webp |
| drömmenspris.png | parenting-exhaustion.webp |
| outtaladelängtan.png | love-languages.webp |
| frågaombarn.png | different-parenting-styles.webp |
| pengarssymbolik.png | worth-spending-on.webp |
| vägentillbaka.png | when-life-tilts.webp |
| uppmärksamhetåtannathåll.png | family-ab.webp |
| tystamuren.png | conflict-repair.webp |
| bäraochbliburen.png | facing-adversity.webp |
| derödalinjerna.png | parenting-boundaries.webp |
| attblisedd.png | listening-presence.webp |
| begäretavståndet.png | adrift.webp |
| våruppväxt.png | our-traditions.webp |
| utveckligen.png (sic) | identity-shift.webp |

Conversion via `cwebp` (quality ~85). Old `su-mock-{N}.webp` files left untouched as fallback.

### 2. Update `src/hooks/useCardImage.ts` — bare-id resolution for Still Us

Add the 18 bare card IDs to `CARD_IDS_WITH_IMAGES`. When `cardId` matches the `su-mock-N` pattern, translate N → bare id via `CARD_SEQUENCE` (imported from `src/data/stillUsSequence.ts`) and resolve to `/card-images/{bareId}.webp`. If that bare-id isn't in our known set, fall back to `/card-images/su-mock-{N}.webp`. Non-Still-Us card IDs continue working unchanged.

Resolver logic (concise):
```ts
if (id.startsWith('su-mock-')) {
  const n = Number(id.slice('su-mock-'.length));
  const seq = CARD_SEQUENCE[n];
  const bare = seq ? bareIdFromSlug(seq.cardId) : null;
  if (bare && CARD_IDS_WITH_IMAGES.has(bare)) return `/card-images/${bare}.webp`;
  // fallback to legacy indexed file
  return CARD_IDS_WITH_IMAGES.has(id) ? `/card-images/${id}.webp` : null;
}
```

### 3. Verify

- Spot-check 6 cards across all 4 layers in the portal.
- Confirm no broken images; no other product affected.

### Out of scope

Other products' image pattern, image optimization beyond standard cwebp conversion, tile color treatments.
