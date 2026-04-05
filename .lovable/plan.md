

## Replace BONKI Text with Wordmark Logo Image

Use the uploaded wordmark image (`3_1.png`) in place of the Bebas Neue text on both pages.

### Steps

1. **Copy asset** — `user-uploads://3_1.png` → `src/assets/bonki-wordmark.png`

2. **Login page (`src/pages/Login.tsx`, lines 141-145)**
   - Replace `<h1>BONKI</h1>` with `<img src={bonkiWordmark} alt="BONKI" />` (~200px wide, centered)
   - The image has a dark navy background that blends with the page's Midnight Ink background

3. **Library page (`src/components/ProductLibrary.tsx`, lines 700-701)**
   - Replace `BONKI` text inside `<motion.h1>` with `<img src={bonkiWordmark} alt="BONKI" />` (~180px wide)
   - Apply a subtle `drop-shadow` filter to replicate the existing text glow effect

### Notes
- Taglines ("På riktigt.", "Verktyg för samtalen...") remain unchanged
- The wordmark's dark background blends naturally with both pages' dark backgrounds

