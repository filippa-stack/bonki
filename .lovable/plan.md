Tint the resume banner dot to match the active product's accent.

### Change
`src/components/LibraryResumeCard.tsx` (lines 264–276): replace the hardcoded Ghost Glow `#D4F5C0` dot with the existing `accent` value (already computed at line 236 from `PRODUCT_ACCENT[display.productId]`) and use `accentRgba(0.5)` for the glow.

Result:
- Vårt Vi → sky blue (#6495ED)
- Jag i Mig → teal (#2A6B65 in this file's map; matches its tile elsewhere)
- Other products → their respective accents