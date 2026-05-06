# Kids product home: Midnight Ink workspace background

Single shared component handles all kids products: `src/components/KidsProductHome.tsx` (the per-product `JagIMig*`/`JagMedAndra*`/`JagIVarlden*` files are unused legacy). `MIDNIGHT_INK` is already exported from `src/lib/palette.ts` and already imported by `KidsProductHome.tsx`. No palette change needed.

## Edit: `src/components/KidsProductHome.tsx`

Root container at line 374 currently:
```tsx
<div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: bg }}>
```

Change to a vertical gradient: hero color at top, Midnight Ink in the workspace area. Use `backgroundColor: MIDNIGHT_INK` as the fallback so any beyond-content scroll area sits on Midnight Ink, with the gradient layered on top:

```tsx
<div
  className="min-h-screen relative overflow-x-hidden"
  style={{
    backgroundColor: MIDNIGHT_INK,
    backgroundImage: `linear-gradient(to bottom, ${bg} 0%, ${bg} 35%, ${MIDNIGHT_INK} 60%, ${MIDNIGHT_INK} 100%)`,
  }}
>
```

Also update the loading-gate placeholder a few lines above (line 368) so it doesn't flash the old solid hero color before content renders:

```tsx
return <div style={{ minHeight: '100vh', backgroundColor: MIDNIGHT_INK }} />;
```

That's the entire change — two style edits in one file.

## What stays unchanged

- Hero illustration, atmospheric radial glow, hero positioning per product (`HERO_TOP_OFFSET`, per-id image treatments).
- Sticky filter header, resume banner, filter chips (transparent backdrop reads correctly against the gradient as it scrolls).
- Per-product accent colors on tiles, contain-with-padding tile composition, completion checkmarks.
- `AdultProductHome.tsx` — not touched.
- All routing, session, completion, account-sheet logic.

## Verification (390×844)

- `/product/jag-i-mig`, `/product/jag-med-andra`, `/product/jag-i-varlden`, `/product/vardagskort`, `/product/syskonkort`, `/product/sexualitetskort`: hero atmosphere preserved; below the hero the page settles into Midnight Ink; per-product tile accents pop with stronger contrast.
- Gradient transition is smooth — no hard color edge at the chip-row boundary.
- `/product/still-us` (Vårt Vi) unchanged.
- Scrolling past the bottom of content stays on Midnight Ink (no flash of hero color), thanks to the `backgroundColor: MIDNIGHT_INK` fallback.
