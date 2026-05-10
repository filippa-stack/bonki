## Replace Jag i Mig illustrations

Replace 14 of the 21 `jim-*` card illustrations in `public/card-images/` with the uploaded PNGs, converted to WebP (matches existing delivery format used by `useCardImage`).

### File mapping (zip → target)

| Source PNG | Target |
|---|---|
| trygg.png | jim-trygg.webp |
| glad.png | jim-glad.webp |
| ledsen.png | jim-ledsen.webp |
| stress.png | jim-stress.webp |
| skam.png | jim-skam.webp |
| besviken.png | jim-besviken.webp |
| utanför.png | jim-utanfor.webp |
| stolt.png | jim-stolt.webp |
| bestämd.png | jim-bestamd.webp |
| kärlek.png | jim-karlek.webp |
| förvånad.png | jim-forvanad.webp |
| svarttsjuk.png | jim-svartsjuk.webp |
| svartsjuk.png | jim-avundsjuk.webp |
| fri.png | jim-vild.webp |

### Steps

1. Unzip `/tmp/jim.zip` into `/tmp/jim/`.
2. Convert each PNG → WebP via `cwebp` (quality ~88, matches existing assets), writing directly to `public/card-images/<jim-*>.webp` (overwrite).
3. Verify all 14 outputs exist and are non-empty; spot-check dimensions.
4. No code changes needed — `useCardImage` already resolves `/card-images/{cardId}.webp` for these IDs.

### Untouched (kept as-is)
`jim-ensam`, `jim-arg`, `jim-radd`, `jim-acklad`, `jim-avsky`, `jim-nyfiken`, `jim-jag` — no replacement provided.
