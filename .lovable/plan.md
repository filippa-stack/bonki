Two color fixes on the Library page:

### 1. Resume banner — Vårt Vi accent
`src/components/LibraryResumeCard.tsx` has its own `PRODUCT_ACCENT` map (line 22) where `still_us: '#A8B5C9'` (a muted slate). Update to `#6495ED` to match the tile.

### 2. Jag i Mig tile — use accent, not deep color
`src/components/ProductLibrary.tsx` (line 61) currently has `jag_i_mig: '#2A6B65'`. Per `src/lib/palette.ts` `productTileColors.jag_i_mig`:
- tileLight (accent): `#27A69C`
- tileMid: `#1D8A82`
- tileDeep: `#115D57`

`#2A6B65` is darker than even `tileDeep` — confirmed it's not the accent. Update to the signature accent `#27A69C` so it sits in the same vibrant register as the other tiles (jag_med_andra, vardagskort, etc., which use light/mid values, not deep).

### Files
- `src/components/LibraryResumeCard.tsx` — line 22: `#A8B5C9` → `#6495ED`
- `src/components/ProductLibrary.tsx` — line 61: `#2A6B65` → `#27A69C`