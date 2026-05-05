## Plan: Replace pill chips with typographic underlined labels

Rebuild `CategoryFilterChips` as a typographic section-nav row. Selection is signaled only by a 2px sliding underline beneath the active label. Behavior, ARIA, scroll/mask, and selection logic are preserved.

### Files

1. **`src/components/CategoryFilterChips.tsx`** — full visual rebuild.
2. **`src/components/KidsProductHome.tsx`** — pass `underlineColor={BONKI_ORANGE}` (one-line change at the existing call site, line ~683).
3. **`src/components/AdultProductHome.tsx`** — pass `underlineColor={WARM_GOLD}`.
4. **`src/lib/palette.ts`** — no change (`BONKI_ORANGE` and `WARM_GOLD` already exported).

### Component contract

Keep all existing props. Add:
- `underlineColor?: string` — defaults to `BONKI_ORANGE`.

`accentHex` is retained (no breakage at call sites) but no longer used for chip backgrounds. `variant` is retained but unused for styling — kept to avoid touching call sites.

### Visual structure

```text
role=group
└─ scroll container (overflow-x:auto, mask-image right-edge fade 40px)
   └─ labels row  (position:relative, display:flex, gap:24px, padding:12px 0 16px)
      ├─ <button> Alla
      ├─ <button> Mina känslor
      ├─ ...
      └─ <motion.div underline>  (absolute, bottom:0, height:2px, radius:1px)
```

Typography (all labels):
- `font-family: var(--font-display)`, `font-size: 14px`, `font-weight: 500`, `letter-spacing: 0.02em`
- color: `LANTERN_GLOW` at opacity `0.65` unselected, `1.0` selected
- button reset: no background, no border, no padding-x chrome (small vertical padding for hit area), `cursor: pointer`

Underline:
- absolutely positioned, `bottom: 0`, `height: 2px`, `border-radius: 1px`
- `background: underlineColor`
- width = selected label's `offsetWidth`; left = selected label's `offsetLeft`

### Position measurement & animation

- `labelRefs = useRef<Record<string, HTMLButtonElement | null>>({})`
- `const [pos, setPos] = useState<{left:number,width:number}|null>(null)`
- `useLayoutEffect` recomputes `pos` from the *first* selected label's `offsetLeft/offsetWidth` whenever:
  - selection changes
  - on mount
  - on container resize (via `ResizeObserver` on the labels row)
- Selected label for underline: if `selected.has(ALL_FILTER_KEY)` → "Alla"; else first selected category in display order. (Multi-select still toggles state; underline tracks the first active to keep one visual marker, since spec calls for a single sliding underline.)
- `<motion.div animate={{ left, width }} transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }} initial={false} />` — `initial={false}` plus `useLayoutEffect` synchronous set means first paint has no entry animation.

### Scroll / mask

- Keep current right-edge mask: `linear-gradient(to right, black 0, black calc(100% - 40px), transparent 100%)` on both `maskImage` and `WebkitMaskImage`.
- Underline lives **inside** the scrolling labels row, so it scrolls with the labels (positions are `offsetLeft` relative to the row, not viewport).

### Behavior (unchanged)

- "Alla" is exclusive; toggling categories clears "Alla"; emptying selection snaps back to `{'all'}`. Identical to current `handleToggle`.
- `aria-pressed` per button, `role="group"` with existing aria-label, `aria-live="polite"` announcement region preserved verbatim.

### Accessibility

- `:focus-visible` falls through to global style; add a small `outline-offset: 4px` so the ring sits cleanly around the text label without pill background.
- Each button keeps `type="button"` and `aria-pressed`.

### Verification

- Kids product home: orange underline under selected label, no pills.
- Adult product home (Vårt Vi): warm gold underline.
- Tap different category → underline slides ~220ms, no jump.
- First paint: underline appears under "Alla" without animation.
- Horizontal overflow still scrolls; mask fade intact; underline stays glued to its label while scrolling.
- Resize/rotate: ResizeObserver repositions underline.
- Keyboard tab → focus ring on text; Enter activates and animates underline.