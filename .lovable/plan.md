

## Replace Still Us Card Images (su-mock-0 to su-mock-20)

File replacement only. No code changes.

### Batch 1 — 10 images received now

Map uploaded PNGs to their correct `su-mock-N.webp` filenames by matching card titles from `stillUsSequence.ts`:

| Uploaded file | Card title | Target file |
|---|---|---|
| omtänksamt_utrymme-2.png | Omtänksamt utrymme | su-mock-9.webp |
| när_självkänslan_svajar.png | När självkänslan svajar | su-mock-10.webp |
| uppfostran_vi_ärvt-2.png | Uppfostran ni ärvt | su-mock-11.webp |
| mina_dina_era_värderingar.png | Mina, dina, era värderingar | su-mock-13.webp |
| mina_dina_era_traditioner.png | Mina, dina, era traditioner | su-mock-14.webp |
| er_filosofi.png | Er filosofi | su-mock-15.webp |
| när_livet_lutar.png | När livet lutar | su-mock-16.webp |
| värt_att_spendera_på.png | Värt att spendera på | su-mock-17.webp |
| på_drift-2.png | På drift | su-mock-18.webp |
| att_nå_fram.png | Att nå fram | su-mock-19.webp |

### Process

1. Copy each uploaded PNG to `/tmp/`
2. Convert each PNG to WebP (85% quality) using `cwebp` or ImageMagick
3. Place the resulting `.webp` files in `/public/card-images/` with the correct `su-mock-N.webp` filename, overwriting existing files

### Batch 2 — awaiting next prompt

Still needed (11 images): su-mock-0 through su-mock-8, su-mock-12, su-mock-20.

### What stays untouched

No code changes. No modifications to `useCardImage.ts`, components, or any other file.

