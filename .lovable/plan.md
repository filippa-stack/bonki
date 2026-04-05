

## Create Favicon from Creature PNG on Dark Background

Generate the favicon using the uploaded transparent creature PNG (`BONKI_1.png`) composited onto the `#0B1026` theme background, then replace the current favicon.

### Steps

1. **Copy uploaded image** — `user-uploads://BONKI_1.png` → `/tmp/BONKI_1.png`
2. **Generate favicon** — Use Python/Pillow to:
   - Create a 512×512 canvas filled with `#0B1026`
   - Paste the creature PNG centered with padding (~15% margin)
   - Export as 32×32 and 180×180 PNGs
   - Save to `public/favicon.png` (32px) and update `public/apple-touch-icon-180x180.png`
3. **Preview at actual size** — Render a comparison image showing the new favicon at 16px, 32px, and 64px so we can judge sharpness before committing
4. **Update `index.html`** if file paths change (current refs already point to `/favicon.png`)

### Why this should help
The transparent PNG on a solid dark background eliminates any edge artifacts from mismatched backgrounds. The contrast between green creature and dark navy should be cleaner than the current version.

