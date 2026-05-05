## Product Home Redesign — Filter chips + flat card grid

### Scope
The live product home pages (Jag i Mig, Vårt Vi, etc.) all render via `src/components/KidsProductHome.tsx`. The redesign applies there. `ProductHomeMock` and `LibraryMock` remain untouched. `KidsCardPortal` route stays intact for any other entry point.

### Current vs target

```text
NOW                          →   TARGET
─────────────────────────────────────────────
Title + tagline                   Title + tagline (scrolls away)
NextActionBanner                  NextActionBanner   ┐ sticky
                                  Filter chip row   ┘ (blurred, no fill)
2-col grid of CATEGORY tiles      2-col grid of CARD tiles
(tap → /portal/:categoryId)       (tap → /card/:cardId)
```

Preserved as-is: full-bleed evighetsskogen hero, atmospheric glow, top scrim, title typography, NextActionBanner pill, painterly card illustration treatment (illustration + bottom-left serif title).

### New: `CategoryFilterChips` (`src/components/CategoryFilterChips.tsx`)
Props: `categories`, `selected: Set<string>`, `onChange`, `accentHex`, `totalVisible`.

- "Alla" first, selected by default and exclusive. Tapping a category clears `'all'` and adds the category. Toggling all categories off snaps back to `{'all'}`. Tapping "Alla" resets.
- Pill: `var(--font-display)` 13px, `LANTERN_GLOW`. Bg `color-mix(in srgb, ${accent} 14%, rgba(255,255,255,0.06))`; selected `color-mix(...) 28%` + 1px tinted border. No new tokens.
- Horizontal scroll with momentum; 24px right-edge fade via `linear-gradient(to right, transparent, var(--surface-base))`.
- Selection cross-fades 120ms. No bouncy motion.
- A11y: `<button role="button" aria-pressed>`, container `role="group" aria-label="Filtrera samtal efter kategori"`, sibling visually-hidden `aria-live="polite"` region announces `Visar X samtal i alla kategorier` / `Visar X samtal i Y kategorier`.

### New: `ProductCardTile` (`src/components/ProductCardTile.tsx`)
- `useCardImage(card.id)` at top level — mounted once per card, never unmounted.
- Reuses `CategoryTile`'s illustration + bottom scrim + bottom-left serif title.
- Tap → `navigate(\`/card/\${card.id}\`)`.
- Completed (in `recentlyCompletedCardIds` ∪ `allTimeCompletedCardIds`): add `inset 0 0 0 1.5px ${SAFFRON_FLAME}` to the existing `box-shadow` so the saffron border sits inside the rounded radius without disturbing layout.

### Refactored `KidsProductHome`
1. Remove `useFirstCardImages` (no longer needed).
2. Title block stays above sticky region so it scrolls away.
3. Sticky header: `<div style={{ position:'sticky', top:0, zIndex:5, backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)' }}>` containing `<NextActionBanner/>` + `<CategoryFilterChips/>`. **No background fill.**
4. 2-col grid of `<ProductCardTile>` for **every** card in `product.cards`. All tiles mount on first render and stay mounted across filter changes — image cache persists, no re-mount flicker.
5. **Filter rendering — mount-everything pattern:**
   - Each tile wrapped in `<motion.div>` with variants `{ shown: { opacity: 1 }, hidden: { opacity: 0 } }` (opacity-only; scale stays 1).
   - Hidden tiles: `aria-hidden`, `tabIndex=-1`, `pointer-events:none`.
   - **Grid-collapse fix:** apply `display: 'none'` via `onAnimationComplete` after the exit animation finishes, so visible tiles repack into the 2-col grid without holes. React subtree stays mounted (component instance + `useCardImage` cache preserved); only the DOM display toggles.
   - Transition: `duration: 0.2`, `ease: [0.32, 0.72, 0, 1]`, `staggerChildren: 0.03` on enter.
6. **Empty state** (defensive, not normally reachable): centered italic `Inga samtal i den här kategorin än.` — `var(--font-display)` 14px italic, `LANTERN_GLOW` @ 0.7 opacity, 32px vertical padding.
7. Hero illustration, top scrim, atmospheric glow blocks: untouched.

### Routing / data
- Card tap → `/card/:cardId` (existing `CardView`). One fewer tap than the portal flow.
- Categories from `product.categories`, cards from `product.cards` filtered by `categoryId`. No data-layer refactor.

### QA checklist (post-build, on real devices)
- iPhone 15 / 390×844: title + tagline (~20vh) + sticky header (~88px) + at least one full row of 2 cards in initial viewport.
- Toggle filters rapidly: no image flicker on toggle-back.
- Hero illustration visible at all times, including under the sticky blur.
- Completed cards show saffron inset border.
- VoiceOver announces filter changes.
- **iOS Safari blur check (iPhone 11/12, real hardware):** verify `backdrop-filter: blur(10px)` actually renders smoothly under the sticky header during scroll. If blur fails or stutters, add a 24px `linear-gradient(to bottom, transparent, var(--surface-base) 80%)` fade just below the sticky region — do **not** add an opaque fill (would kill the brand world). Don't pre-build the fallback; only ship if testing requires it.

### Files
- New: `src/components/CategoryFilterChips.tsx`
- New: `src/components/ProductCardTile.tsx`
- Edited: `src/components/KidsProductHome.tsx`