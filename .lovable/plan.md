## Unify kids tile shape to Vårt Vi (adult)

Adult tile (`AdultProductCardTile.tsx`) is the canonical shape and will not be touched. Only the kids tile changes.

### File to edit
`src/components/ProductCardTile.tsx` — outer `<button>` style only.

Current values:
- `aspectRatio: '2 / 3'`
- `borderRadius: '38px'`

Change to:
- `aspectRatio: '3 / 4'`
- `borderRadius: '22px'`

### File NOT touched
`src/components/AdultProductCardTile.tsx` — already 3/4 + 22px.

### What stays in kids tile
Full-bleed illustration, bottom scrim, bottom-left serif title, completion checkmark, per-product accent colors, all internal composition. Only outer shape changes.

### Verification
- Kids product homes (Jag i Mig, Jag med Andra, Vardag, Syskon, etc.) render tiles at 3:4 with 22px corners.
- Vårt Vi tiles unchanged.
- Side-by-side: kids and adult tiles share identical outer shape; content treatment still differs (full-bleed vs two-zone).
- Confirm `AdultProductCardTile.tsx` diff is empty.

### Scope
1 file, 2 CSS values.
