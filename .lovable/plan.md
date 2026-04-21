

## Three small refinements to push the lantern banner to 10/10

The current banner is good — the teal bloom resolves correctly, the dot reads, the pill is anchored right. But three details against the screenshot keep it from a 10:

1. **The secondary line is too dim.** "Pausad vid Fråga 3 av 6 · Ärlad" is set to `DRIFTWOOD #6B5E52` at `opacity: 0.55` — on Midnight Ink that computes to roughly 30% effective luminance. Per `mem://style/typography-and-readability-standards`, secondary text on dark backgrounds should be `LANTERN_GLOW` at 0.55–0.65 opacity, never a brown mid-tone at low opacity (the brown reads as muddy, not soft). Fix: switch the secondary line to `LANTERN_GLOW` at `opacity: 0.6`.

2. **The bloom is slightly under-saturated for the eye.** Current alpha stops are `${accent}55` → `${accent}1A` (33% → 10%). Against pure Midnight Ink the teal reads as a faint wash rather than a confident lantern glow. Bump to `${accent}66` → `${accent}1F` (40% → 12%) — same shape, same anchor, just a touch more presence. Still well within the "lit from within" standard (`mem://ux/visual-standards/luminosity-and-glow`), still subtle enough not to compete with product tiles below.

3. **The dot's halo currently uses Midnight Ink, but it sits on top of the teal bloom — so the halo blends into the bloom instead of separating the dot from it.** Swap the halo from `MIDNIGHT_INK` to a 1.5px ring at `rgba(11, 16, 38, 0.85)` so it stays dark but with a hair of softness, AND add a 4px outer accent glow (`box-shadow: 0 0 0 1.5px rgba(11,16,38,0.85), 0 0 6px ${accent}80`). This makes the dot punch *and* feel lit, matching the lantern metaphor.

### Files touched
- `src/components/LibraryResumeCard.tsx` — three contained edits to the existing render block (lines 251, 280–283, 290–298). No structural changes, no new imports, no new logic.

### What is NOT touched
- The shell, the bloom geometry/anchor/animation, the pill, the navigation, the data layer, the dev mocks, the color resolver. All preserved.
- `ResumeBanner.tsx`, `palette.ts`, `Categories.tsx` — untouched.

### How to verify
1. `/?devState=pairedActive` (Jag i Mig): teal bloom reads more confidently; secondary line is legible cream at 60% instead of muddy brown; dot has a subtle teal halo that separates it from the bloom.
2. `/?devState=library` (Jag med Andra): same improvements with rose accent.
3. Reduced-motion users: bloom still renders static at `opacity: 0.85` (the breathing animation is the only thing motion-guarded, unchanged).

### Revert cost
One file, three small hunks.

