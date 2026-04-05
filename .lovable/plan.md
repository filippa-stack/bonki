

## Replace Wordmark with New Transparent PNG + Size Bump

### Steps

1. **Copy asset** — `user-uploads://BONKI_2_1.png` → `src/assets/bonki-wordmark.png` (overwrite existing)

2. **Login page (`src/pages/Login.tsx`, line 145)**
   - Change `maxHeight: '40px'` → `maxHeight: '60px'`
   - The parent `<motion.div>` (line 138) has no background/padding — confirmed clean

3. **Library page (`src/components/ProductLibrary.tsx`, line 695)**
   - Change `maxHeight: '40px'` → `maxHeight: '60px'`
   - The parent `<motion.h1>` (line 687-691) only has `marginBottom: '12px'` — no background/padding to remove
   - Keep the existing `drop-shadow` filter

Both pages already have no visible container styling — the only change is the asset swap and the height bump.

