

## Update the library tile illustration for Vårt Vi

The library lobby tile uses a separate asset (`illustration-still-us-tile.png`), which is why the previous swap of `illustration-still-us-home.png` didn't reach it.

### Diagnosis

`src/components/ProductLibrary.tsx` (line 25):
```ts
import illustrationStillUs from '@/assets/illustration-still-us-tile.png';
```

All other Vårt Vi surfaces (Home hero, ProductIntro, Journal, Category, manifest) read `illustration-still-us-home.png` — already updated. Only the library tile points at `-tile.png`, which is still the old "two characters embracing" image.

### Fix

Overwrite `src/assets/illustration-still-us-tile.png` with the same uploaded `identitetsskiftet-2.png`. No code changes — single asset replacement.

### Surfaces that update

- `src/components/ProductLibrary.tsx` → Vårt Vi tile on `/` (library lobby).

### Untouched

- All other product tiles and Vårt Vi surfaces (already on `-home.png`).
- Tile cropping/`object-position` logic in `ProductLibrary.tsx` stays as configured.

### Verification

- `/` → Vårt Vi tile shows the new illustration.
- Other surfaces unchanged from previous verification (Home, ProductIntro, Journal, Category).

### Rollback

Restore previous `src/assets/illustration-still-us-tile.png` from version history.

