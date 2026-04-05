

## Replace Favicon with New Creature Logo

### Steps

1. Copy `user-uploads://2_1.png` to `public/favicon.png` (overwriting the current one)
2. No changes needed to `index.html` — it already references `/favicon.png`
3. Also update the PWA icons (`apple-touch-icon-180x180.png`, `pwa-192x192.png`, `pwa-512x512.png`) with the same new creature logo, resized appropriately

### Notes
- The existing `<link rel="icon" type="image/png" href="/favicon.png" />` in index.html stays as-is
- PWA manifest already references the icon files by name, so replacing them in-place is sufficient

