## Goal
Library tiles read as raised. Outer tile is the single raised element; inner plate sits flush with no shadow.

## Root cause
`NEU_SHADOW_IN` (line 39) starts with `inset` → sunken look. Adding a second raised shadow on the inner plate would muddy the depth, so the inner plate gets no shadow at all.

## Edits (src/components/ProductLibrary.tsx)

1. Remove the `NEU_SHADOW_IN` constant (line 39).

2. Remove the two `boxShadow: NEU_SHADOW_IN` lines:
   - Line 382 — medallion inner circle in `PreviewCardPurchased`
   - Line 639 — inner plate in `LibraryKidsTile`

   No replacement shadow. Inner surfaces sit flush.

3. Leave untouched: `NEU_SHADOW_OUT` and `NEU_SHADOW_OUT_SM` on the outer tile/medallion buttons (already raised, dark bottom-right + light top-left). Tile colors, radii, illustration layout, pill states, and the line 1046 modal shadow are not changed.

## Verification
After edit, `rg "NEU_SHADOW_IN|inset.*rgba" src/components/ProductLibrary.tsx` should return nothing.
