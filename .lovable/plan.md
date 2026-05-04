# Phase A.1.3 — Library Midnight Ink + Deep Dusk tiles

## Changes

### `src/index.css`
- Line 228: `--page-bg: #0B1026;` → `--page-bg: #1A1A2E;`

### `src/components/ProductLibrary.tsx`
- Add `import { MIDNIGHT_INK } from '@/lib/palette';`
- Line 274: `usePageBackground('#0B1026')` → `usePageBackground(MIDNIGHT_INK)`
- Line 398: `const libraryBg = '#0B1026'` → `const libraryBg = MIDNIGHT_INK`
- `PastelTile` (lines 148–155):
  - `background: 'rgba(255, 255, 255, 0.02)'` → `background: '#2A2D3A'`
  - `border: '0.5px solid rgba(255, 255, 255, 0.08)'` → `border: '0.5px solid rgba(255, 255, 255, 0.06)'`
- Title `textShadow` (line 213): `'0 1px 8px rgba(0,0,0,0.5)'` → `'0 1px 10px rgba(0,0,0,0.7)'`

## Ripple surfaces (via `--page-bg` CSS var)

Library, app root wrapper, immersive Header, body/html, `.page-bg` utility (AnalyticsDashboard, CardView loading skeleton). All full-screen dark surfaces; midnight ink is the correct value for all.

CardView loading skeleton noted: non-interactive bg color only, no ripple into session logic or protected refs. Verify post-ship that load → session transition is artifact-free.

## Out of scope

Hardcoded `#0B1026` literals elsewhere (BonkiLoadingScreen, ResumeBanner, useDefaultTheme, etc.) — separate cleanup sweep pending Filippa's brand decision between Deep Dusk and Midnight Ink.
