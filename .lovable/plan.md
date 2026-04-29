## Goal

Shrink the giant "BONKI" wordmark at the top of the library page to one-third of its current size, and revert the earlier mistaken watermark change.

## What I got wrong last round

I shrank the heroAlt watermark in `BackgroundWatermark.tsx`, but that watermark doesn't render on `/` at all. The actual "BONKI" you see on the library page is the wordmark image at the top — `bonki-wordmark.png`, rendered inside `ProductLibrary.tsx`.

## Changes

### 1. `src/components/ProductLibrary.tsx` (line 713)

Shrink the wordmark image to 1/3:

- `maxHeight: '60px'` → `maxHeight: '20px'`

Everything else (drop-shadow glow, centering, margin) stays the same.

### 2. `src/components/BackgroundWatermark.tsx` (lines 111–112) — revert

Restore the heroAlt watermark to its locked, approved size:

- `width: '32vw'` → `width: '96vw'`
- `maxWidth: '200px'` → `maxWidth: '600px'`

Also restore the original "Approved 2026-02-26" comment block above it.

## Files touched

- `src/components/ProductLibrary.tsx` — one numeric value
- `src/components/BackgroundWatermark.tsx` — revert two values + comment
