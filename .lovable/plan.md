

## Update app icon to new BONKI mark

Replace the favicon, Apple touch icon, PWA icons, and OG image with the uploaded BONKI artwork (1024×1024, dark navy background with off-white "BONKI" wordmark).

### Files generated from the uploaded image

From `user-uploads://Add_a_heading_1.PNG` (1024×1024 source), generate and copy into `public/`:

| Path | Size | Purpose |
|---|---|---|
| `public/favicon.png` | 512×512 | Browser tab icon (`<link rel="icon">`) |
| `public/apple-touch-icon-180x180.png` | 180×180 | iOS home-screen icon (also reused for the 152×152 link) |
| `public/pwa-192x192.png` | 192×192 | PWA manifest icon (Android home screen) |
| `public/pwa-512x512.png` | 512×512 | PWA manifest icon (large + maskable) |

All five are direct resamples of the uploaded square — no padding or recolor. The maskable PWA variant keeps the existing dark background, which already provides safe-area padding around the wordmark.

### Cleanup

- Delete the legacy `public/favicon.ico` if present (browsers request `/favicon.ico` by default and a stale one would override the new PNG). Currently only `favicon.png` exists, so likely a no-op — verified during execution.

### Untouched

- `index.html` — all `<link>` tags already point at `/favicon.png`, `/apple-touch-icon-180x180.png`, and the manifest references the PWA icons by the same filenames; no markup changes needed.
- `vite.config.ts` PWA manifest — same icon paths.
- `public/bonki-og.png` (Open Graph) — kept as-is; OG image is wider/branded and not part of the app-icon system.
- All app code, components, and routes.

### Verification

1. New `/favicon.png` shows in browser tab.
2. `/apple-touch-icon-180x180.png` shows when "Add to Home Screen" on iOS.
3. PWA install prompt + installed home-screen icon use the new artwork (Android + iOS).
4. No 404s for icon paths in network panel.
5. Hard refresh may be needed to bust cached favicons.

