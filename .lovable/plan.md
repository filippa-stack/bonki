Update Jag med Andra subtitle from "Att höra till & vara sig själv" to "Att höra till".

## Files to change
- `src/data/products/jag-med-andra.ts` line 244: `tagline: 'Att höra till & vara sig själv'` → `tagline: 'Att höra till'`
- `src/components/ProductLibrary.tsx` line 44: subtitle map entry `jag_med_andra: 'Att höra till & vara sig själv'` → `jag_med_andra: 'Att höra till'`

(Note: line 7 in `jag-med-andra.ts` is a category title "Att höra till" — already matches the new subtitle, unrelated, leave untouched. Line 47 reference to "höra till" is different copy, leave untouched.)

## Verification
- ripgrep `"Att höra till & vara sig själv"` returns zero matches.
- tsc clean (string-only edit, no type impact).