

## Replace the Vårt Vi (Still Us) product illustration

Swap the file behind `@/assets/illustration-still-us-home.png` with the uploaded image. Because every consumer imports from the same path, no code changes are needed — all surfaces update at once.

### Steps

1. Copy `user-uploads://identitetsskiftet-2.png` → `src/assets/illustration-still-us-home.png` (overwrite).
2. No other edits.

### Surfaces that update automatically

- `src/pages/Home.tsx` — Vårt Vi home / return ritual hero.
- `src/components/ProductIntro.tsx` — Vårt Vi welcome / intro page.
- `src/data/products/still-us-mock.ts` — `heroImage` on the product manifest (library tile, etc.).
- `src/pages/Category.tsx` — Vårt Vi category header.
- `src/pages/Journal.tsx` — Vårt Vi entries in the journal illustration map.

### Verification

- `/?devState=browse` → Vårt Vi tile in the library shows the new illustration.
- `/product/still-us` → home hero shows the new illustration.
- Vårt Vi intro / category / journal entries all reflect the new image.

### Untouched

- All other product illustrations.
- Cropping/positioning logic (`object-position`, opacity, scale) per surface stays as configured — the new image will inherit those treatments.
- Creature/atmosphere assets (`STILL_US_CREATURES`, `creature-*`) — separate system, unaffected.

### Rollback

Restore the previous `src/assets/illustration-still-us-home.png` from version history.

