## Scope

Apply Vårt Vi's editorial register (saffron progress, small-caps step indicator, warm-glow cream-card shadow, italic-serif reflection trigger, glassy product-accent pill CTA, completion polish) to **kids** session + completion surfaces only. The Vårt Vi (`isStillUs` / `isStillUsFocusMode`) branches stay byte-identical.

## What I found

- Kids live session is an **inline branch** in `src/pages/CardView.tsx` lines **3342–3816** (`if (isKidsProduct && isLive && currentSection)`). It does NOT use `SessionFocusShell` or `SessionStepReflection` — header, progress, white card, note nudge, and CTA are all inlined.
- Vårt Vi focus mode is a separate inline branch (`isStillUsFocusMode`, 3029–3337) — used as visual reference only; not modified.
- Kids completion is `src/components/CompletedSessionView.tsx`, shared with Still Us via `isChildProduct`. All edits gated on `isChildProduct`.
- `productAccentColor` map already exists in `src/lib/palette.ts` (all six kids products); no palette additions needed.
- `Header.tsx`, `SessionFocusShell.tsx`, `SessionStepReflection.tsx` are not on the kids path → no edits.

## Files to change

1. `src/pages/CardView.tsx` — kids live branch (3342–3816) only
2. `src/components/CompletedSessionView.tsx` — every change gated on `isChildProduct`

## Changes — kids live session (CardView.tsx 3342–3816)

**Header bar (3420–3460)**
- Drop `textTransform: uppercase` + letter-spacing on card title (return to editorial title casing); keep 15px font-sans `LANTERN_GLOW`.
- Close X icon: stroke 1.5, opacity **0.65**.

**Progress bar + step indicator (3463–3487)**
- Track: `rgba(255,255,255,0.10)` (was `PARCHMENT` cream).
- Fill: `SAFFRON_FLAME` `#D49A3F` (was `#E9B44C`).
- "X av Y" indicator: `var(--font-body)` 12px weight 400, `letterSpacing: 0.08em`, `textTransform: uppercase`, `LANTERN_GLOW` @ **0.55**, drop the dark text-shadow.

**White question card (3520–3534)**
- Replace `boxShadow: '0 8px 32px rgba(0,0,0,0.15)'` with kids warm-glow:
  `box-shadow: 0 0 40px rgba(233, 200, 144, 0.10), 0 8px 32px rgba(0, 0, 0, 0.20)`.

**Reflection trigger inside cream card (3570–3600)** — Option A confirmed
- Trigger stays **inside** the cream card (no structural move).
- Pencil + label restyle:
  - Font: `var(--font-display)` (Fraunces) **italic**, 14px weight 400, lineHeight 1.4
  - Color: `BARK` `#2C2420` @ **0.7** opacity (adapts to cream surface; preserves editorial register through typography).
  - Pencil icon: ~14px, stroke 1.5, same color & 0.7 opacity.
- Drop the existing `showFullNudge` toggle for icon-only state; always render full italic-serif label.
- Expanded textarea visuals (3617–3666) unchanged.

**Primary CTA "Fortsätt" / "Avsluta" (3704–3772)**
- Replace bright saffron filled rectangle with the unified glassy product-accent pill, applied to **both** layouts (with-back and standalone):
  - Shape: full pill, `height: 56px`, `borderRadius: 28px`. Standalone: full width within parent's 24px padding. With-back: keep `minWidth: 200px / maxWidth: 280px` centered, back chevron absolutely positioned left.
  - Background: `color-mix(in srgb, ${productAccentColor[product.id]} 40%, rgba(255,255,255,0.06))`
  - Border: `1px solid color-mix(in srgb, ${productAccentColor[product.id]} 60%, transparent)`
  - Text: `LANTERN_GLOW`, `var(--font-display)`, 16px weight 600.
- Back chevron color stays `LANTERN_GLOW` @ 0.7.
- Add imports: `productAccentColor`, `SAFFRON_FLAME`, `LANTERN_GLOW`, `BARK` from `@/lib/palette`.

## Changes — kids completion (CompletedSessionView.tsx, gated on `isChildProduct`)

**Header section (around 263–293)** — bug fix + editorial upgrade
- For kids: hide the existing 32×2 saffron line; render a **saffron checkmark badge** above the headline:
  - 64px circle, `background: rgba(233, 200, 144, 0.15)`, centered.
  - Inside: `lucide-react` `Check` icon, size 36, stroke 2, color `SAFFRON_FLAME` `#D49A3F`.
- Headline color **bug fix** (kids only): switch from `hsl(41, 78%, 38%)` (dark saffron — unreadable on dark wine / terracotta atmospheric bgs) to `LANTERN_GLOW` full opacity. Font `var(--font-serif)` 24–28px weight 500 lineHeight 1.1 centered. **Vårt Vi keeps the existing dark-saffron color.**
- Optional eyebrow `VALFRITT` (kids only) above the takeaway block when it renders: `var(--font-body)` 11px weight 600, `letterSpacing: 0.10em`, uppercase, `LANTERN_GLOW` @ 0.55, centered.

**Takeaway block (356–372)** — kids only
- Cream container `#FAF7F2`, `padding: 20px 24px`, `borderRadius: 12px`, warm glow `box-shadow: 0 0 40px rgba(233, 200, 144, 0.10), 0 8px 32px rgba(0, 0, 0, 0.20)`.
- Body text color `BARK` (currently `#FDF6E3` light-on-light → unreadable when migrated to cream).
- Vårt Vi keeps the existing translucent dark-on-dark treatment.

**CTA block (374–421)** — kids only
- Primary button (`Nästa` when `nextDest` exists, otherwise `Tillbaka till {product.name}`): replace `cta-primary` class with the glassy product-accent pill spec defined above. Label: `Nästa samtal` when `nextDest` exists, otherwise `Tillbaka till {product.name}`.
- Secondary text link `Tillbaka till {product.name}` (only present alongside `Nästa`): `var(--font-display)` 14px weight 400, `LANTERN_GLOW` @ 0.65, no chrome.
- Vårt Vi (`!isChildProduct`) keeps current `cta-primary` button.

## What stays unchanged

- Atmospheric product backgrounds (already shipped).
- Session lifecycle, autosave, completion logic, reflection storage/retrieval, routing.
- Vårt Vi `isStillUsFocusMode` branch in CardView.
- Vårt Vi rendering in CompletedSessionView (translucent dark-on-dark takeaway, dark-saffron headline preserved).
- `BONKI_ORANGE` is not used on session/completion CTAs.
- Start screen for kids (`shouldShowStartScreen && isKidsProduct`) is out of scope — separate surface.

## Verification (390×844)

For at least JIM (`/?devState=browse`) and JmA, plus a Vårt Vi card for regression:
1. **Kids live session**: dark wine/terracotta bg, saffron `#D49A3F` progress fill on translucent track, small-caps `1 AV N`, warm-glow cream card, italic-serif `BARK @ 0.7` reflection trigger inside cream, glassy product-accent pill CTA (no bright yellow rectangle).
2. **Kids completion**: saffron checkmark badge, serif headline in `LANTERN_GLOW` (readable on atmospheric bg — bug fix verification), `VALFRITT` eyebrow when takeaway present, cream takeaway block with warm glow and `BARK` body text, glassy `Nästa samtal` pill, secondary text link in lantern @ 0.65.
3. **Vårt Vi regression** (su-mock-0): focus mode session and completion screen render byte-identical to current production — Midnight Ink shell, existing saffron progress, warm-gold pill CTA, dark-saffron headline, dark-on-dark takeaway block.
4. **Per-product CTA color sweep**: JIM `#F2BC97`, JmA `#E59FCF`, JIV `#D8E145`, Vardag `#A8E5C0`, Syskon `#E0BFEA`, N&I `#CFA08D`.
