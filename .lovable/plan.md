# Resume banner — shape-matched medallion + card-specific illustration

Single-file change: `src/components/LibraryResumeCard.tsx`. No data-layer changes needed.

## Investigation findings

- **Card illustration access pattern**: `useCardImage(cardId)` hook (`src/hooks/useCardImage.ts`) is the canonical resolver. Returns `/card-images/{bareId}.webp` for any card that has one.
- **Vårt Vi cards DO have per-card illustrations**: `useCardImage` already handles `su-mock-N` IDs by resolving through `CARD_SEQUENCE` to a bare id (e.g. `expressing-needs`). All 21 Vårt Vi cards are in `CARD_IDS_WITH_IMAGES`.
- Conclusion: card-specific illustration applies to **both** kids and Vårt Vi. No fallback gymnastics needed — but we keep a fallback to the product hero (`ILLUSTRATIONS[productId]`) for safety if `useCardImage` returns null.
- `productDarkText` and `getCalmInterior` are already imported / available.

## Changes (only the medallion zone)

### 1. Resolve illustration

Replace the current `const illustration = ILLUSTRATIONS[display.productId]` line with:

```ts
const cardIllustration = useCardImage(display.cardId);
const illustration = cardIllustration ?? ILLUSTRATIONS[display.productId];
```

Add `import { useCardImage } from '@/hooks/useCardImage';`.

(Hook must be called unconditionally at component top — move it above the `if (!display) return null` guard, or restructure so the hook always runs. Cleanest: call `useCardImage(display?.cardId ?? null)` before the early return.)

### 2. Branch the medallion by product family

Introduce `const isStillUs = display.productId === 'still_us'` and `const darkText = productDarkText[display.productId] ?? '#5A3A1F'`.

**Vårt Vi (isStillUs)** — keep current circular treatment:
- Outer 56×56, `borderRadius: '50%'`, `background: accent` (#6495ED)
- Inner 70%×70%, `borderRadius: '50%'`, `background: '#5A85D5'`
- Illustration `width/height: 100%`, `objectFit: contain`

**Kids (else)** — rounded rectangle composition:
- Outer 56×56, `borderRadius: 10`, `background: accent` (product `tileLight`)
- Inner zone fills with `inset: 6` (i.e. `position: relative` outer + absolutely positioned inner with `inset: 6`, OR padding: 6 + inner box at 100%/100%)
- Inner: `borderRadius: 6`, `background: getCalmInterior(productId, accent)`, `border: 1px solid ${darkText}30` (hairline, ~19% alpha — matches kids tile pattern)
- Illustration inside inner zone with ~4px padding, `objectFit: contain`

Implementation: render the medallion via a small inline conditional (two JSX branches) to keep the code legible — both branches share the outer 56px box footprint so banner layout is unchanged.

## Unchanged

Outer container (tinted background, border, padding, flex, eyebrow, chevron in `accent`), text block (title + italic context line), navigation (`/card/:cardId`), realtime subscription, dev mock, fetch logic, `ResumeData` shape, props.

## Verification (390×844)

1. Vårt Vi resume → circular cornflower medallion with darker inner circle, paused card's illustration centered (e.g. `expressing-needs.webp`, not the generic Still Us hero).
2. JIM resume of "Glad" → 56px rounded-rectangle warm-coral frame, calm-variant inner zone with hairline, **Glad** illustration (not JIM hero).
3. Each kids product paints with its own `tileLight` outer + calm inner; hairline visible but quiet.
4. Banner background tint, border, eyebrow, title, italic context line, chevron unchanged.
5. Tap still navigates to `/card/{cardId}`.
6. If `useCardImage` returns null for any card, banner falls back to product hero (no broken image).

## Calibration knobs

- Hairline alpha (`30` hex = ~19%): can adjust to `25`–`40` if too faint/heavy.
- Inner-zone inset (6px) and inner illustration padding (4px): tweak together if illustration feels cramped or too small.
- Outer kids `borderRadius: 10` — drop to 8 if it reads too soft next to the 14px banner radius.
