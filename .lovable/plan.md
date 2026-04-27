# Cleanup: Remove build artifacts and wireframe exports

## Critical finding on `public/check-in/`

This directory is **NOT junk** — it must be kept. It contains a single file `index.html` (a standalone Still Us slider check-in page). It is referenced at runtime:

- `src/pages/still-us-routes/SharePage.tsx:39` builds the partner share URL as `${window.location.origin}/check-in/index.html?token=${partnerLinkToken}`
- `src/App.tsx:99` redirects in-app `/check-in/*` routes to the product (so the standalone HTML at `/check-in/index.html` is served by the static handler, not React Router)
- Notification deep-links and Home.tsx navigation also target `/check-in/...`

**Decision: keep `public/check-in/` untouched.**

## Change 1 — Delete 8 ZIPs from public/

```
public/bulk-image-crop_2.zip
public/card-images.zip
public/jim-illustrations.zip
public/jiv-card-images.zip
public/jma-card-images.zip
public/sex-card-images.zip
public/sk-card-images.zip
public/vk-card-images.zip
```

## Change 2 — Delete 11 wireframe/export files from public/

```
public/color-palette.html
public/flowcharts.html
public/kids-family-journey-flowchart.html
public/library-mood-comparison.html
public/screenshot-export.html
public/user-journey-flowchart.html
public/wireframe-preview-2.html
public/wireframes-export.html
public/wireframes-pdf.html
public/wireframes.html
public/still-us-content-export.md
```

## Change 3 — Update `src/components/MobileOnlyGate.tsx` allowlist

Line 7:

```ts
// before
const DESKTOP_ALLOWED_ROUTES = ['/analytics', '/login', '/flowcharts.html', '/kids-family-journey-flowchart.html', '/user-journey-flowchart.html', '/color-palette.html'];

// after
const DESKTOP_ALLOWED_ROUTES = ['/analytics', '/login'];
```

## Verification

1. `ls public/ | grep -E "\.zip$|wireframes|flowchart|color-palette|library-mood|screenshot-export"` → expect 0 matches
2. `grep -n "flowchart\|color-palette" src/components/MobileOnlyGate.tsx` → expect 0 matches
3. `ls public/card-images/ | wc -l` → expect 128 (current count, unchanged)
4. `ls public/check-in/` → expect `index.html` still present
5. `bunx vite build` → expect 0 errors

## Out of scope

No other files touched. No code changes beyond the single allowlist line in `MobileOnlyGate.tsx`.
