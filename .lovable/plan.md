

## Apply lantern design to the visible library banner with correct product colors

The lantern treatment was previously applied to `ResumeBanner.tsx`, but the banner you actually see on `/` is `LibraryResumeCard.tsx` — a different component. That's why the redesign appeared to "not take effect" and why the color stayed wrong: `LibraryResumeCard` always hardcoded saffron, and its product-color lookup table had Jag i Mig mapped to lilac instead of teal.

This plan fixes both: ports the lantern to the visible banner, and makes the bloom always reflect the active product's true tile color.

### Files touched

1. `src/components/LibraryResumeCard.tsx` — redesign + color fix (the only banner currently on the library home)
2. `src/lib/palette.ts` — read-only confirmation that `productTileColors` is the canonical source

### What changes

**1. Replace the visual shell with the approved lantern design**

Current `LibraryResumeCard` (lines 244–304) renders a full-bleed tinted gradient with a hardcoded saffron accent. Replace its outer container and content layout with the same lantern recipe used in `ResumeBanner`:

- **Shell**: dark Midnight Ink (`#0B1026`) base, `border-radius: 22px` (preserve existing radius), no gradient fill.
- **Bloom layer** (absolute, `inset: 0`, `pointer-events: none`): breathing radial gradient anchored left
  `radial-gradient(ellipse 260px 120px at 22% 50%, ${accent}33 0%, ${accent}10 60%, transparent 100%)`
  driven by the existing Framer Motion 6s ease-in-out opacity loop (`[0.85, 1, 0.85]`). Reduced-motion guard preserved.
- **Foreground content** (`position: relative; z-index: 2`):
  - Primary line "Fortsätt utforska {productName}": 14px, weight 500, `LANTERN_GLOW`. Preceded by a 6px accent dot with a 1.5px Midnight Ink halo (`box-shadow: 0 0 0 1.5px #0B1026`) so it punches through the bloom.
  - Secondary line "{stepLabel} · {cardTitle}": 12px, `DRIFTWOOD` at opacity 0.55, aligned via flex gap (no padding hacks).
  - Pill: keep the existing Bonki Orange "Fortsätt" pill exactly as it is (32px height, `#E85D2C`, white text, rounded). It already sits on the right — with the bloom anchored at 22%, the pill naturally emerges from the darker right half.

The result matches the lantern reference 1:1 — same shell, same bloom math, same dot, same hierarchy, same pill.

**2. Make the bloom always use the correct product tile color**

Two specific fixes inside `LibraryResumeCard.tsx`:

- **Delete** the local `PRODUCT_TILE_COLORS` map (lines 32–40). It is duplicated and contains the bug (`jag_i_mig: '#CB7AB2'` should be `#27A69C`).
- **Import** `productTileColors` from `@/lib/palette` — the single source of truth — and resolve the bloom color via `productTileColors[productId]?.tileLight ?? LANTERN_GLOW`. This guarantees:
  - Jag i Mig → teal `#27A69C`
  - Jag med Andra → rose `#CB7AB2`
  - Jag i Världen → chartreuse `#C6D423`
  - Vårt Vi → cobalt `#94BCE1`
  - Syskonkort → lilac `#CF8BDD`
  - Sexualitetskort → coral `#DD958B`
  - Vardagskort → mint `#8BDDB0`
- **Delete** the hardcoded `accentColor: SAFFRON_FLAME / DEEP_SAFFRON` assignments at lines 71, 72, 153, and 183. The component no longer carries an `accentColor` field on `ResumeData` — color is derived at render time from `productId`. `SAFFRON_FLAME` and `DEEP_SAFFRON` imports are removed.
- **Update the dev mock** so `devState=pairedActive` defaults to a real Jag i Mig session (`productId: 'jag_i_mig'`, `cardId: 'jim-glad'`, `cardTitle: 'Glad'`) — this gives you immediate visual confirmation that teal renders correctly. The `?devState=library` and Still Us/Jag-med-Andra mocks are preserved for switching colors during inspection.

**3. Remove the dead lantern from `ResumeBanner.tsx` + `Categories.tsx`**

`Categories.tsx` is dead code (`/categories` is redirected to `/` in `App.tsx`), so the lantern there is invisible. I will leave both files untouched — no risk of regression — but add a one-line JSDoc comment at the top of `Categories.tsx` noting it is unreachable, so no future agent wastes another iteration there.

### What is NOT touched

- `ResumeBanner.tsx` — unchanged. Lantern code stays as a reference.
- `UnifiedResumeBanner.tsx`, `ContinueModule.tsx`, `NextActionBanner.tsx` — out of scope.
- `ProductLibrary.tsx` — only consumes `<LibraryResumeCard global />`; no edits needed.
- `palette.ts` — read-only.
- Any session/data fetching logic in `LibraryResumeCard` — unchanged. Only the visual return JSX, the color resolution, and the dev-mock seed change.
- Pill styling, pill copy ("Fortsätt"), navigation behavior — preserved.

### How to verify after the change

1. Open `/?devState=pairedActive` on iPhone preview. Expect: dark Midnight Ink banner, **teal bloom** anchored on the left, 6px teal dot, "Fortsätt utforska Jag i Mig" + step label, orange Fortsätt pill emerging from the dark right half.
2. Open `/?devState=library`. Expect: Jag med Andra mock → **rose bloom**.
3. Manually edit the dev mock locally (or trigger a real session in a different product) → bloom recolors to that product's tile.
4. Confirm console (dev only) logs no warnings; the banner respects `prefers-reduced-motion`.

### Revert cost

One file to revert (`LibraryResumeCard.tsx`). The dead-code comment in `Categories.tsx` is harmless if reverted or kept.

