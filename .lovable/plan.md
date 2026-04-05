

## Generate Favicon and PWA Icons from Creature Logo

### Approach
Run a Python script using Pillow to composite the creature logo onto a Midnight Ink (#1A1A2E) background at each required size, with 15% padding. Generate ICO with embedded 16×16 and 32×32 sizes.

### Steps

1. **Copy uploaded image** to `/tmp/creature.png`
2. **Run Python script** that:
   - Opens the creature PNG
   - For each target size (32, 180, 192, 512), creates a `#1A1A2E` background canvas, resizes the creature to fit with 15% padding, pastes centered
   - Saves `public/favicon.png` (32×32), `public/apple-touch-icon-180x180.png` (180×180), `public/pwa-192x192.png` (192×192), `public/pwa-512x512.png` (512×512)
   - Creates `public/favicon.ico` containing both 16×16 and 32×32 sizes
3. **QA** — convert each output to inspect visually

No code changes needed — `index.html` already references these file paths.

