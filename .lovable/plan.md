# Phase A.1.4 — Tile composition + Resume banner redesign

## Audit findings

- **Vårt Vi tile** at line 725 in `ProductLibrary.tsx` is rendered via the same `PastelTile` component (with `name="Vårt Vi"`). One composition rewrite covers all seven products — no separate inline tile JSX exists.
- **Resume banner** is rendered as a separate component: `<LibraryResumeCard global />` at line 549. All redesign work goes in `src/components/LibraryResumeCard.tsx`. The inline render in `ProductLibrary.tsx` stays unchanged.
- Existing `PastelTile` already uses `#2A2D3A` background + `0.5px solid rgba(255,255,255,0.06)` border (Phase A.1.3). Tile container chrome is correct; only internal composition changes.

## Part 1 — `PastelTile` composition rewrite (`src/components/ProductLibrary.tsx`, lines ~140–267)

Restructure tile as a vertical flex container: title block top, illustration zone fills remainder, pill absolutely-positioned bottom-left.

**Container** (unchanged): `aspectRatio: '1 / 1.05'`, `background: '#2A2D3A'`, `border: '0.5px solid rgba(255,255,255,0.06)'`, `borderRadius: 18`, `boxShadow: 'none'`. Add `display: 'flex'`, `flexDirection: 'column'`.

**Title block** (new top zone):
- Padding: `16px 16px 14px`
- Title `<h3>`: Fraunces 24px wt 500, color `#FFFFFF`, line-height 1.1, **no `textShadow`**, margin `0 0 4px`
- Tagline `<p>`: Inter 12px wt 400, color `rgba(255,255,255,0.78)`, line-height 1.3, **no `textShadow`**, margin 0
- `position: relative`, `zIndex: 2`

**Illustration zone**: `flex: 1`, `position: relative`, `overflow: hidden`. Image rendered with `position: absolute, inset: 0, width: 100%, height: 100%, objectFit: 'contain', objectPosition: 'center bottom'`, no filter, no scrim.

**Remove the bottom scrim** entirely (current lines 178–191). The full-color illustration stays uncompromised.

**Pill**: absolute-positioned inside the illustration zone at `bottom: 14, left: 14`, `zIndex: 2`. All chrome unchanged: `padding: '5px 11px'`, `borderRadius: 999`, `background: 'rgba(255,255,255,0.18)'`, `backdropFilter: 'blur(8px)'` + `WebkitBackdropFilter`, `border: '0.5px solid rgba(255,255,255,0.25)'`, Inter 11.5px wt 600, color `LANTERN_GLOW`, letter-spacing `0.02em`. Same three-state content (`X av Y` / `Du har provat` / `N samtal`).

## Part 2 — Resume banner redesign (`src/components/LibraryResumeCard.tsx`)

Replace the entire button surface (currently radial accent bloom + orange "Fortsätt" pill) with a quiet sister-surface to the tiles.

**Container button**:
- `background: '#2A2D3A'` (DEEP_DUSK)
- `border: '0.5px solid rgba(255,255,255,0.06)'`
- `borderRadius: 14`
- `padding: '12px 16px'`
- Width 100%, no boxShadow
- Whole element is the navigation action → `/card/{cardId}` (already the case)

**Remove**: the breathing radial-gradient `motion.div` overlay, the small accent dot with product-color, the orange `BONKI_ORANGE` "Fortsätt" pill.

**New layout** (flex row, gap 12px, align center):

1. **Ghost-glow dot** (left): 8×8px, `background: '#D4F5C0'`, `borderRadius: 50%`, `boxShadow: '0 0 8px rgba(212,245,192,0.5)'`, flex-shrink 0.
2. **Text block** (flex: 1, min-width: 0):
   - Headline: Fraunces 14.5px wt 500, color `#FFFFFF`, line-height 1.15. Content: **just `display.productName`** (e.g. "Vårt Vi") — no verb, no "Fortsätt utforska".
   - Subhead: Inter 11px, color `rgba(255,255,255,0.55)`, line-height 1.3. Content: `${display.stepLabel} · ${display.cardTitle}` (stepLabel already formatted as "Pausad vid Fråga N av M").
   - Both with `overflow: hidden, textOverflow: ellipsis, whiteSpace: nowrap`.
3. **Chevron** (right): inline SVG (lucide-style `>`), 16px, `color: LANTERN_GLOW`, opacity 0.5, flex-shrink 0. Use `ChevronRight` from `lucide-react` (already a project dep).

Devmock branch keeps its existing data shape; only render path changes.

## Cleanup

- Remove unused `BONKI_ORANGE` constant in `LibraryResumeCard.tsx` if no longer referenced after the orange pill is gone.
- Keep `productTileColors` import only if still used elsewhere in the file; otherwise drop. (Currently used to derive `accent` for the bloom — remove with the bloom.)
- Remove `motion` import if no other motion usage remains.

## Verification

After edits, these greps must return zero matches:

- `rg "linear-gradient.*to top.*rgba\(0,0,0" src/components/ProductLibrary.tsx src/components/LibraryResumeCard.tsx`
- `rg "Fortsätt utforska|utforska" src/components/LibraryResumeCard.tsx src/components/ProductLibrary.tsx`
- `rg "textShadow" src/components/ProductLibrary.tsx` should not match within `PastelTile` title/tagline (other surfaces unaffected).

Visual:
- All seven product tiles (incl. Vårt Vi) show title + tagline at top in solid dark zone, full-color illustration below with no overlay, pill bottom-left.
- Resume banner reads as quiet tile-sister, headline is just the product name, ghost-glow dot left, chevron right, no orange CTA. Tap anywhere navigates to `/card/{cardId}`.

## Out of scope

- Tile flatness calibration (inset highlights / internal gradients) — re-evaluate after this ships.
- `MockResumeBanner` in staging mocks.
- Welcome strip, intro page, onboarding redesigns (later phases).
