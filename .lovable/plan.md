# 6 surgical edits to `src/components/ProductLibrary.tsx`

Only this file. No copy changes. No imports added/removed.

## 1. SectionEyebrow
- `margin: '0 0 10px'` → `margin: '24px 0 10px'`

## 2. StillUsMarquee — tagline `<p>`
- `fontSize: 13` → `12`
- `lineHeight: 1.35` → `1.3`

## 3. StillUsMarquee — banner & right column
- Button `minHeight: 97` → `110`
- Right-column flex `<div>` (title + tagline + pill row): `justifyContent: 'center'` → `'flex-start'`, add `paddingTop: 2`, keep `gap: 4`

## 4. StillUsMarquee — collapse to a single circle
- Delete the inner 70%/70% translucent disc div (`rgba(15, 30, 80, 0.18)`)
- `<img>` becomes a direct child of the (formerly outer) circle

## 5. StillUsMarquee — single circle styling
On the remaining circle div:
- `flex: '0 0 75px'` → `flex: '0 0 95px'`
- `background: '#5A85D5'` → `` `color-mix(in srgb, ${PRODUCT_ACCENT.still_us} 75%, white)` ``
- Add `overflow: 'hidden'`
- Keep `aspectRatio: '1 / 1'`, `borderRadius: '50%'`, flex-centering

On the `<img>`:
- `width: '90%', height: '90%'` → `width: '115%', height: '115%'`
- Add `objectPosition: 'center'`
- Keep `objectFit: 'contain'`, `pointerEvents: 'none'`

## 6. LibraryKidsTile typography
- Name `<span>`: 16 → 14
- Tagline `<span>`: 11 → 10
- Meta `<span>`: 9 → 8
- Title strip wrapper: `gap: 4` → `gap: 2`

## Verification
Screenshot `/?devState=browse` at 390×844 and confirm spacing, single-line tagline, single ~95px light-blue circle with illustration filling, and kids tile 3-line layout.
