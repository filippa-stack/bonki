## Goal
Make Vårt Vi's hero behave like the kids product home pattern: hero illustration confined to a defined zone at the top, fading cleanly into a uniform Deep Dusk workspace behind the card grid. The illustration must not bleed through behind cards.

## Diagnosis (`src/components/AdultProductHome.tsx`)

**How the hero is positioned today (lines 116–160):**
- `motion.div` wrapper: `position: absolute; top: -8vh; left: -5vw; right: -5vw; height: 100vh; zIndex: 0`.
- Inside: a backlight glow + an `<img>` at `opacity: 0.42`, `width: 110%`, `top: 5%`.
- **No bottom-fade scrim.** That's why the couple shows through behind every card row — the image is full-height with no mask.

**How `KidsProductHome.tsx` solves it (lines 537–549):**
- Same wrapper geometry (`height: 100vh`).
- Adds a bottom-anchored gradient inside the wrapper:
  ```
  background: linear-gradient(to top,
    ${bg}F0 0%, ${bg}E0 15%, ${bg}C0 35%,
    ${bg}80 55%, ${bg}40 70%, transparent 100%);
  height: 90%;
  ```
- This scrim (filled with the page bg color) covers the lower portion of the hero, leaving only the top ~25–30% visible. Below it, cards sit on uniform `bg`.
- For Still Us specifically the kids file currently *skips* this scrim (`product.id !== 'still_us'` is in the exclusion list), which is why Still Us inherited the "no scrim" treatment when its bespoke AdultProductHome was built.

**Page background below hero today:**
- The outer container is already `backgroundColor: DEEP_DUSK_BG` (#0B1026). The Deep Dusk is *there* — the hero illustration is just painted over it. We don't need a different bg; we need a scrim that fades the hero into the existing Deep Dusk.

## Fix (single file: `src/components/AdultProductHome.tsx`)

Add a bottom-fading scrim inside the hero `motion.div`, immediately after the `<img>` (around line 158). Same pattern as kids, tuned for Vårt Vi:

```tsx
{/* Bottom scrim — defines hero zone end, fades into Deep Dusk workspace */}
<div
  style={{
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    background: `linear-gradient(to top,
      ${DEEP_DUSK_BG} 0%,
      ${DEEP_DUSK_BG}F0 18%,
      ${DEEP_DUSK_BG}D0 35%,
      ${DEEP_DUSK_BG}90 55%,
      ${DEEP_DUSK_BG}40 75%,
      transparent 100%)`,
    pointerEvents: 'none',
  }}
/>
```

Why these stops:
- The hero zone visually ends just above the resume banner / filter chips. Wrapper is `100vh` from `-8vh` → bottom of wrapper is at ~92vh. The 70%-tall scrim covers roughly the lower 64vh, fully opaque from ~0–18% (bottom ~12vh), heavy through 35% (~24vh), fading out at the top of the scrim ~64vh from page top — which is right around the resume banner / chips area on a 844px viewport.
- Final stop at `transparent 100%` means the upper hero zone is untouched: the couple, glow, and atmospheric scrim above it all read exactly as today.
- Using `DEEP_DUSK_BG` (already imported) matches the page background exactly, so the transition is seamless — no color shift.

## Untouched
- Hero illustration itself (same source, same opacity, same crop).
- Backlight glow (line 132–144).
- Atmospheric cool-glow ellipse (line 102–114) — sits above the scrim's transparent zone, so it stays visible.
- Top scrim (line 162–173).
- Title, subtitle, banner, chips, grid, tile composition.
- All routing, session, and progress logic.
- `KidsProductHome.tsx`.

## Verification (iPhone 15, 390×844)
- `/product/still-us`: hero illustration visible at the top (couple + glow), atmosphere intact.
- Around the resume banner / filter chips, background fades smoothly to clean Deep Dusk.
- Cards sit on uniform Deep Dusk; no figure or hero content shows through behind any card row.
- Scrolling: cards scroll over uniform Deep Dusk all the way down. Hero stays at the top.
- Kids product homes unchanged.
