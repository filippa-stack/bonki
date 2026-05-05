# Portal redesign + Vårt Vi session redesign

Two visual-only redesigns. No routing/lifecycle/autosave changes.

---

## Part 1 — Portal redesign

### Architecture

Fork by product type at the route level, matching the existing `KidsProductHome` / `AdultProductHome` pattern. Cleaner than branching inside `KidsCardPortal` (which already has paywall + animation logic).

**New file:** `src/pages/AdultCardPortal.tsx` (Vårt Vi only, `productSlug === 'still-us'`)
**Edit:** `src/pages/KidsCardPortal.tsx` — keep existing kids logic, but adopt the new three-zone composition for kids
**Edit:** `src/App.tsx` — at `/product/:productSlug/portal/:categoryId`, dispatch:
- `still-us` → `AdultCardPortal`
- everything else → `KidsCardPortal`

Both portals reuse:
- Existing routing + URL params (`?card=`)
- `useKidsProductProgress`, `useCardImage`, `useProductTheme`, `useProductAccess`
- Paywall intercept logic
- Portal-open animation phases (kept as-is)
- Swipe nav + keyboard a11y

### Page composition (shared three-zone layout)

```
┌───────────────────────────────────┐
│  ‹                ◯               │  Top bar (back / account)
│         VARDAGEN                  │  Eyebrow (small caps, font-display 12px)
│       Ert minsta vi               │  Title (serif, title-case)
│     ni och de små stunderna       │  Subtitle (italic serif, 0.85 LANTERN_GLOW)
│                                   │
│      ┌─────────────────┐          │  Card preview — 80% width, 3:4
│      │  illustration   │          │   Two-zone tile, identical to
│      │                 │          │   AdultProductCardTile / kids
│      ├─────────────────┤          │   variant. Saffron ✓ if completed.
│      │  Card title     │          │
│      └─────────────────┘          │
│                                   │
│         CA 2–4 MIN                │  Time estimate (small caps)
│         ✓ Klart                   │  (only if completed; italic serif)
│  ┌─────────────────────────┐     │  Pill CTA (color-mixed)
│  │     Starta samtal       │     │
│  └─────────────────────────┘     │
│   Föregående    2 av 5    Nästa  │  Text-only sequence nav
└───────────────────────────────────┘
```

### Adult portal specifics (`AdultCardPortal.tsx`)

- Background: `#0B1026` (Deep Dusk), same atmospheric glow as `AdultProductHome`. No hero illustration — the large card preview dominates.
- Eyebrow: `var(--font-display)` 12px, `LANTERN_GLOW` @ 0.65 opacity, `letter-spacing: 0.08em`, uppercase via CSS `text-transform`.
- Title: serif, title-case (raw string from card data — no `toUpperCase()`).
- Card preview: import & reuse `AdultProductCardTile`'s visual structure as an inline composition (button → click triggers `startSession`, not navigation). Anchor color resolved with the same deterministic logic used in `AdultProductHome` (so Vardagen-anchored cards stay cornflower, etc.). Saffron ✓ check using `Check` icon already in scope.
- CTA pill: `color-mix(in srgb, ${cardColor} 30%, rgba(255,255,255,0.06))`, border `1px solid color-mix(in srgb, ${cardColor} 50%, transparent)`, height 56px, full-width with horizontal margin, label `LANTERN_GLOW` font-display 16px.
- Sequence nav: text-only `Föregående` / `2 av 5` / `Nästa` (no `ChevronLeft`/`Right` icons), font-display 14px, `LANTERN_GLOW` @ 0.65; disabled state opacity 0.35. Remove "Fler i [Category]" link.

### Kids portal (`KidsCardPortal.tsx`)

Same three-zone composition, but:
- Background stays product `backgroundColor` (deep teal hero etc.) — current treatment.
- Card preview uses the kids tile color (`product.tileLight` / `tileDark`) — same per-product accent as today.
- CTA pill uses `product.accentColor` (or `tileLight`) in the same `color-mix` formula.
- Existing portal-open animation phases preserved (kids zoom, Still Us warm flood — Still Us animation moves to AdultCardPortal).

Both portals: keep existing labels by state — `Starta samtal` / `Fortsätt samtal` / `Gör om samtalet`.

---

## Part 2 — Vårt Vi session redesign

Visual-only changes, gated on `product?.id === 'still_us' || isStillUsCard` (the `isStillUs` flag at `CardView.tsx:376` already exists).

### Background

In `CardView.tsx`, override the page background and the `SessionFocusShell productBgColor` to `MIDNIGHT_INK` (`#1A1A2E`) when `isStillUs`. Currently it falls through to `product?.backgroundColor`. Kids products untouched.

### `SessionFocusShell.tsx`

Add a subtle warm glow under the cream question card when `productBgColor === MIDNIGHT_INK` (or accept a new `glow` prop):
```
boxShadow: '0 0 40px rgba(233, 200, 144, 0.08), 0 8px 32px rgba(0,0,0,0.15)'
```

### Header (`Header.tsx` / progress bar)

When Still Us session active:
- Title `Ert minsta "vi"` color: `LANTERN_GLOW` full opacity
- Progress fill: `SAFFRON_FLAME` (instead of current yellow); track `rgba(255,255,255,0.10)`. Likely requires either a Still-Us-specific class on `Progress` or inline override of `--progress-fill`.
- Close `X`: `LANTERN_GLOW` @ 0.65, ensure ≥44×44 tap target.
- "1 av 4" indicator: `var(--font-display)` 12px, small caps, `letter-spacing: 0.08em`, `LANTERN_GLOW` @ 0.55, centered with proper margin.

### `SessionStepReflection.tsx` (already supports `stillUsMode`)

Currently when `stillUsMode` is true, palette derives from `EMBER_GLOW`. Update the Still Us branch to read for Midnight Ink shell:
- Note trigger color & pencil: `LANTERN_GLOW` @ 0.7, italic serif 14px (currently sans).
- Primary CTA: pill, full-width, height 56px:
  - `backgroundColor: color-mix(in srgb, ${WARM_GOLD} 28%, rgba(255,255,255,0.06))`
  - `border: 1px solid color-mix(in srgb, ${WARM_GOLD} 50%, transparent)`
  - color `LANTERN_GLOW`, `var(--font-display)` 16px, weight 600
  - Replaces the current `DEEP_SAFFRON` filled button (Still Us branch only).

Kids sessions: untouched — the `stillUsMode` prop already gates this.

### Question card (already cream `#FAF7F2` in `SessionFocusShell`)

Verify against Midnight Ink. Add the warm-gold lantern glow above. No structural changes.

---

## Files affected

- `src/pages/AdultCardPortal.tsx` — **new**
- `src/pages/KidsCardPortal.tsx` — restructure to three-zone layout (kids only after fork)
- `src/App.tsx` — dispatch portal route by slug
- `src/pages/CardView.tsx` — override session bg to Midnight Ink for Still Us; pass glow flag
- `src/components/SessionFocusShell.tsx` — optional warm-glow on question card
- `src/components/Header.tsx` — Still Us progress fill saffron, step indicator typography (verify exact location of progress bar render)
- `src/components/SessionStepReflection.tsx` — Still Us branch CTA pill + reflection trigger restyle

## Verification (390×844)

1. Vårt Vi product home → tap card → adult portal renders with Deep Dusk bg, anchor-colored card preview matching product home tile, title-case serif, pill CTA in card color, text-only prev/next.
2. Kids product → tap card → kids portal renders three-zone, deep teal bg, kids accent on tile + CTA. No "Fler i" link.
3. Tap "Starta samtal" on a Vårt Vi card → session loads with Midnight Ink bg (not cornflower). Cream question card visible with subtle warm glow. Progress bar saffron. CTA is warm-gold pill.
4. Open any kids card session → unchanged from today.
