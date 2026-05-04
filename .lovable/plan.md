# Phase A.1.1 — Dark uniform tiles (live)

Reverses saturated-gradient tile backgrounds shipped in Phase A.1. Tiles now sit on the dark library bg as uniform elevated surfaces; per-product color lives entirely in the illustration.

Single file: `src/components/ProductLibrary.tsx`.

## Changes

**1. Delete gradient system (lines ~57–97)**
- `TILE_COLORS`, `PRODUCT_SLUG`, `GRADIENT_TOKENS_CSS`, `tileBackground()`, `hexToRgba()`.

**2. PastelTile container (lines ~176, 187–196)**
Remove `fallbackBg` lookup. New styles:
```ts
borderRadius: 18,
background: 'rgba(255, 255, 255, 0.02)',
border: '0.5px solid rgba(255, 255, 255, 0.08)',
boxShadow: 'none',
```
Bottom-scrim `borderRadius` → `'0 0 18px 18px'`.

**3. Title text-shadow (line ~253)**
`textShadow: '0 1px 8px rgba(0,0,0,0.5)'`

**4. Tagline color (line ~265)**
`color: 'rgba(255, 255, 255, 0.78)'`

## Out of scope
Resume banner, welcome strip, intro/onboarding/paywall — later phases.
