# Batch C correction — library kids tiles use KidsTileFrame

## Problem

Library kids tiles still render via the old `PastelTile` (single-zone, illustration anchored bottom-right, dense top stack). Batch C never swapped them to the shared `KidsTileFrame` primitive, so the frame/interior compositional structure is missing.

## Changes

### 1. `src/components/KidsTileFrame.tsx` — extend, don't fork

- Add optional prop `metaTrailing?: ReactNode` rendered on the right side of the meta row (used for the `BonkiLogoMark` "tasted" glyph).
- Convert the existing `<span>{meta}</span>` block to a flex row with `justify-content: space-between`, hosting the meta text on the left and `metaTrailing` on the right.
- All other props/behavior unchanged. The product-home callsite (`ProductCardTile`) keeps working — it doesn't pass `metaTrailing`.

### 2. `src/components/ProductLibrary.tsx`

Replace the `PastelTile` definition and all kids-tile callsites with a `LibraryKidsTile` wrapper that delegates to `KidsTileFrame`:

```tsx
import KidsTileFrame from '@/components/KidsTileFrame';
import { getCalmInterior } from '@/lib/productTileVariants';
import { productDarkText } from '@/lib/palette';

function LibraryKidsTile({ product, illustration, totalCards, completedCount, isPurchased, onClick }) {
  const frame = PRODUCT_ACCENT[product.id];
  const interior = getCalmInterior(product.id, frame);
  const darkText = productDarkText[product.id] ?? '#5A3A1F';
  const tasted = !isPurchased && completedCount > 0;
  const progress = isPurchased ? `${completedCount} AV ${totalCards}` : `${totalCards} SAMTAL`;
  const meta = product.ageLabel ? `${progress} · ${product.ageLabel.toUpperCase()}` : progress;

  return (
    <KidsTileFrame
      frame={frame}
      interior={interior}
      title={product.name}
      subtitle={TAGLINES[product.id]}
      meta={meta}
      metaTrailing={tasted ? <BonkiLogoMark size={9} /> : undefined}
      darkText={darkText}
      titleSize={15}
      stripFraction={0.30}
      style={{ aspectRatio: '1 / 1.05' }}
      onClick={onClick}
      ariaLabel={product.name}
    >
      <img
        src={illustration}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '70%',
          maxHeight: '70%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))',
        }}
      />
    </KidsTileFrame>
  );
}
```

Then the kids grid map:

```tsx
{sortedKidsProducts.map((product) => (
  <LibraryKidsTile
    key={product.id}
    product={product}
    illustration={ILLUSTRATIONS[product.id]}
    totalCards={product.cards.length}
    completedCount={completedCountMap[product.id] || 0}
    isPurchased={purchased.has(product.id)}
    onClick={() => navigate(`/product/${product.slug}`)}
  />
))}
```

Drop the now-unused `PastelTile` component entirely (Vårt Vi has its own `StillUsMarquee`).

### 3. `StillUsMarquee` proportion tightening

In `src/components/ProductLibrary.tsx`:

- Container: bump `padding` from `16` to `padding: '20px 16px'` to add 4 px vertical breathing room above the title and below the pill.
- Medallion: change the inner `<img>` from `inset: 6` filling the medallion to centered at 70%:
  ```tsx
  style={{
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%', height: '70%',
    objectFit: 'contain', objectPosition: 'center',
    pointerEvents: 'none',
  }}
  ```
- Pill: change `marginTop: 10` → `marginTop: 12` for clearer separation from the tagline.

## What does NOT change

- `LibraryHeader`, `SectionEyebrow`, disclaimer copy, locked kids order, 2-col grid + 12 px gap, resume card, nudges.
- Kids product home tiles (Batch B) — they keep using `KidsTileFrame` via `ProductCardTile`, no changes.
- Vårt Vi tile content (title, tagline, pill states, navigation), only proportions tighten.
- Color tokens, calm-variant table, `productDarkText` map.

## Verification (390×844)

At `/library`:
1. Each kids tile shows clear frame (product color) + interior (calm variant) zones with the illustration centered in the inner zone — no bottom-anchored crops.
2. Title strip occupies ~30% height; reads as three editorial lines: title (Fraunces 15), italic-serif subtitle, small-caps meta row.
3. JIV and N&I (no `ageLabel`) show only progress in the meta row.
4. Tasted state renders `BonkiLogoMark` to the right of the meta row in the same dark-text color at 0.55 opacity.
5. Vårt Vi marquee right column has visible breathing room; medallion shows the figure centered at ~70 % of the circle, not bottom-anchored.
