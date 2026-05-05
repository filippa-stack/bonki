## Product Home Refinements

Three scoped edits across three files. No structural or behavioral changes — only visual/spacing tuning.

---

### 1. `src/components/ProductCardTile.tsx` — Lighter card scrim

Replace the existing bottom scrim (`height: '65%'`, multi-stop dark gradient) with a much lighter one that respects the illustrations.

- `height: '25%'` (was `'65%'`)
- `background: 'linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0) 100%)'`

No other changes to the file. Title position, completion border (`SAFFRON_FLAME` inset shadow), aspect ratio, and tile image treatment all stay identical.

---

### 2. `src/components/CategoryFilterChips.tsx` — Chip padding + edge fade

**a) Tighter chip padding.** In the chip `<button>` style, change `padding: '7px 14px'` → `padding: '7px 10px'` (vertical unchanged, horizontal -4px each side).

**b) Fix the right-edge fade.** The current overlay fades to `var(--surface-base)` (solid color) which creates a seam against the blurred sticky header. Replace it:

- Keep absolute positioning, 24px wide, anchored right, `pointer-events: none`.
- New gradient: `linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)`.
- Ensure z-order: the fade sits above the scrolling chip row but is purely visual (no pointer events), so taps on visible chips are unaffected. Add `zIndex: 1` to the fade overlay; chips remain in normal flow with no z-index, so the fade renders above them visually but the pointer-events:none keeps them tappable. The fade naturally only obscures the truncating chip on the right edge.

No changes to: chip toggle logic, ARIA, color-mix tinting, live region.

---

### 3. `src/components/KidsProductHome.tsx` — Sticky header spacing

In the `StickyFilterHeader` sticky wrapper (lines ~667–692):

- `paddingTop: '8px'` → `'6px'` (top of sticky region)
- `paddingBottom: '4px'` → unchanged (already tight)
- Inner `NextActionBanner` wrapper `<div style={{ minHeight: '52px' }}>`: remove the `minHeight` so the banner sizes to its content; add `marginBottom: '6px'` instead of relying on the chip row's own top padding for spacing.

Also tighten the `NextActionBanner` pill itself. View `src/components/NextActionBanner.tsx`, locate the pill's vertical padding (currently ~18–20px top/bottom), and reduce to `12px` top and bottom. Eyebrow label, card name, and Öppna button stay as-is.

Reduce the spacer below the sticky header (line ~695):

- `<div style={{ height: '12px' }} />` → `<div style={{ height: '8px' }} />`

Inside `CategoryFilterChips`, the chip scroll container has `padding: '8px 24px 8px 4px'`. Reduce to `padding: '4px 24px 4px 4px'` so the chip row contributes less internal vertical padding. (Right padding stays at 24px to give the fade gradient room.)

Net effect: ~20–30px reclaimed in the sticky header on a 390×844 viewport.

---

### What stays exactly the same

- Mount-everything filter pattern, `FilterableCardCell` opacity-only animation, `display: none` after exit via `onAnimationComplete`.
- Easing `[0.32, 0.72, 0, 1]`, 200ms duration, 30ms stagger.
- Hero illustration, top scrim, title typography, 2-col grid, `/card/:cardId` routing.
- Completion border treatment (`inset 0 0 0 1.5px ${SAFFRON_FLAME}`).
- All ARIA (`aria-pressed`, `aria-live`, `aria-hidden` on filtered tiles, `role="group"`).

### QA on iPhone 15 (390×844)

1. Each card: bottom 25% has subtle darkening that fully clears above; top 75% of illustration unobstructed.
2. All four primary chips visible without truncation; if a 5th chip exists, it fades into translucent black at the right edge with no color seam against the blur.
3. Sticky header occupies ≤ ~22% viewport; first card row meaningfully visible above the fold.
4. Filter toggling, completion border, and hero blur all behave unchanged.
