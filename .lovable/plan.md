# Library polish — subtitle italic + section-eyebrow scrim

Two small visual fixes in `src/components/ProductLibrary.tsx`. No logic, no copy, no tokens.

## 1. Remove italic from subtitles

Kids tile tagline currently renders `fontStyle: 'italic'`. Vårt Vi tagline already renders `fontStyle: 'normal'` but is set in `var(--font-display)` which can read as italic-adjacent on some weights — keep upright.

- `LibraryKidsTile` tagline span: drop `fontStyle: 'italic'`. Keep size 12px / weight 400 / opacity 0.85.
- `StillUsMarquee` tagline `<p>`: confirm `fontStyle: 'normal'` (already set, no change needed unless we also want it switched to `var(--font-body)` for visual consistency — leaving as-is for this fix).

## 2. Fix the "dark scrim" over section eyebrows

The eyebrows ("För er som par", "För barn · För familjen") sit between y≈200–340. The atmospheric layer stack includes a top fade:

```text
position: absolute; top: 0; height: 360px;
linear-gradient(180deg,
  hsla(230,25%,10%,0.0) 0%,
  hsla(230,25%,10%,0.35) 30%,
  hsla(230,25%,10%,0.75) 55%,
  #1A1A2E 100%)
zIndex: 1   // inside the atmospheric wrapper (zIndex:0 stacking context)
```

Even though it stays behind the content wrapper, the dark midstops (0.75 at 55% ≈ y=198px) create a heavy band exactly where the first eyebrow sits, reading as a dark scrim over the cream text. The eyebrow loses contrast against the surrounding lighter atmospheric wash above and below.

Fix: soften this top fade so it no longer creates a dark band at the eyebrow band.

- Reduce midstop opacities: `0.35 → 0.15` at 30%, `0.75 → 0.35` at 55%.
- Shorten height `360px → 280px` so the darkest portion ends above the first eyebrow rather than across it.
- Keep the final stop at `${libraryBg}` to preserve the smooth join into the page background.

Net effect: the top-of-page atmosphere stays moody, but the eyebrow band reads as continuous background instead of a darker stripe.

## Verification

- 390×844 preview: confirm both eyebrows read at consistent brightness against the surrounding background, no perceived horizontal dark band.
- Confirm the StillUsMarquee tile and kids tiles still sit naturally on the background (no halo, no banding).
- Confirm kids tile subtitle is upright (not italic).
- Spot-check Vårt Vi marquee unchanged.

## Out of scope

No changes to copy, palette tokens, tile typography, progress bars, age badges, onboarding, or any other surface.
