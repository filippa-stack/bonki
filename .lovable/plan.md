## Product Home Refinements — Round 2

Four scoped visual edits across three files. No structural/behavioral changes.

### 1. `src/components/KidsProductHome.tsx` — Remove sticky container blur

In `StickyFilterHeader` (lines ~667–681), remove `backdropFilter` and `WebkitBackdropFilter`. The wrapper becomes a transparent positioning layer (sticky/top/zIndex retained). Pills and chips already carry their own glassy treatment.

### 2. `src/components/KidsProductHome.tsx` — Tighten hero vertical padding

Current values:
- Content wrapper `paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 56px), clamp(56px, 12vh, 100px))'` (line 570) → reduce ~30% to `'max(calc(env(safe-area-inset-top, 0px) + 36px), clamp(36px, 8vh, 70px))'`
- Title→subtitle gap: subtitle `marginTop: '8px'` (line 606) is already tight — keep at `8px` (already at target).
- Spacer below subtitle: `clamp(48px, 12vh, 100px)` (line 621) → reduce to `clamp(28px, 7vh, 60px)` (~40% reduction). This is the main win — reclaims the ~40–50px above the sticky header.

Title/subtitle font sizes, hero illustration, atmospheric glow, top scrim untouched.

### 3. `src/components/CategoryFilterChips.tsx` — Fix right-edge fade

The current overlay is correct in structure but uses `0.4` end opacity. Change end stop from `rgba(0,0,0,0.4)` to `rgba(0,0,0,0.25)`. Verified `0%` start stop is already `rgba(0,0,0,0)` — no typo. Now sits over raw hero (no container blur).

### 4. `src/components/ProductCardTile.tsx` — Replace inset border with "Klart" pill

a) Remove the `inset 0 0 0 1.5px ${SAFFRON_FLAME}` from `boxShadow` — `shadow` always equals `baseShadow`.

b) Add a conditionally rendered "Klart" pill inside the card's content layer (the card already has `overflow: hidden`, but the pill sits inside the same rounded rect at top:12 right:12 so it won't be clipped). Place the pill as a sibling at zIndex 4 (above scrim z2 and title z3 to remain visible).

Pill spec:
```tsx
{isCompleted && (
  <motion.div
    role="status"
    initial={hasMounted ? { opacity: 0 } : false}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
    style={{
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 4,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 10px',
      borderRadius: 999,
      background: `color-mix(in srgb, ${SAFFRON_FLAME} 28%, rgba(255,255,255,0.08))`,
      border: `1px solid color-mix(in srgb, ${SAFFRON_FLAME} 50%, rgba(255,255,255,0))`,
      fontFamily: 'var(--font-display)',
      fontSize: 12,
      fontStyle: 'italic',
      fontWeight: 500,
      color: LANTERN_GLOW,
      lineHeight: 1,
    }}
  >
    <span style={{ fontSize: 10, color: `color-mix(in srgb, ${SAFFRON_FLAME} 80%, transparent)` }}>✓</span>
    Klart
  </motion.div>
)}
```

c) Animation control: track first-render with a `useRef(true)` flipped in `useEffect` so already-completed cards on initial load skip the fade-in (`initial={false}`); cards transitioning from incomplete→completed get the 240ms opacity fade. Visible text "Klart" provides the accessible label; `role="status"` added.

d) Imports: add `LANTERN_GLOW` from `@/lib/palette`, add `motion` from `framer-motion`, add `useRef`/`useEffect` from React.

### Preserved

Mount-everything filter pattern, opacity-only filter animation, `[0.32,0.72,0,1]`/200ms/30ms stagger, hero illustration + glow + top scrim, title typography, 2-col grid, `/card/:cardId` routing, all chip ARIA, NextActionBanner, 25% bottom card scrim, chip 10px horizontal padding.

### Files

- `src/components/KidsProductHome.tsx` — items 1, 2
- `src/components/CategoryFilterChips.tsx` — item 3
- `src/components/ProductCardTile.tsx` — item 4
