# Kids product home: flat Midnight Ink page

## Edit: `src/components/KidsProductHome.tsx`

Replace the gradient root container with a flat Midnight Ink background:

```tsx
<div
  className="min-h-screen relative overflow-x-hidden"
  style={{ backgroundColor: MIDNIGHT_INK }}
>
```

The hero illustration, atmospheric radial glow, sticky header, tiles, and all other styling stay exactly as-is. The atmospheric glow uses `tileLight` per product at low opacity (15–35%); against Midnight Ink it remains perceptible for every product so no tint adjustment is needed.

`AdultProductHome.tsx` not touched.

## Verification (390×844)

All kids product homes (`/product/jag-i-mig`, `/product/jag-med-andra`, `/product/jag-i-varlden`, `/product/vardagskort`, `/product/syskonkort`, `/product/sexualitetskort`): page is uniformly Midnight Ink top to bottom; hero illustration and glow unchanged; tile accent colors pop. `/product/still-us` unchanged.
