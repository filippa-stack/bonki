## Remove the dark rectangle behind the truncating chip

### Inventory of elements in the right-edge region of `CategoryFilterChips`

I read the entire file and the parent `StickyFilterHeader` in `KidsProductHome.tsx`. There is **no second overlay, no pseudo-element, no parent background, no leftover mask**. Elements actually rendering in the right-edge region:

1. Outer `<div style={{position:'relative'}}>` — no background.
2. Scroll container `<div role="group">` — no background, `padding: 4px 24px 4px 4px`, `overflow-x: auto`.
3. **Right-edge fade `<div aria-hidden>`** — `position:absolute; right:0; width:40px; zIndex:1; background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)`.
4. Visually-hidden live region — 1×1 px, clipped, invisible.

### Diagnosis

The "dark rectangle" **is element #3**. It is the fade overlay itself. Because it paints a black-tinted gradient *on top of* the chips and hero illustration (zIndex 1), against bright pixels in the hero (saffron glow, illustration highlights) the gradient reads as a dark rectangular plate covering the rightmost chip. Against pure midnight background it's invisible — which is why earlier opacity tweaks didn't help. The geometry is correct; the *technique* (painting black on content) is wrong.

### Fix

In `src/components/CategoryFilterChips.tsx`:

1. **Delete the right-edge fade overlay div entirely** (lines 115–128).
2. **Apply a CSS mask to the scroll container** so the chips themselves fade to transparent at the right edge — no pixels are darkened, only chip alpha is reduced. Add to the scroll container's inline style:

```js
maskImage: 'linear-gradient(to right, black 0, black calc(100% - 40px), transparent 100%)',
WebkitMaskImage: 'linear-gradient(to right, black 0, black calc(100% - 40px), transparent 100%)',
```

3. Add a short comment above the scroll container explaining the mask approach and why the overlay was removed (so a future round doesn't re-add it).

### Preserved

All chip styling, toggle behavior, ARIA group, `aria-pressed`, live region announcements, padding `4px 24px 4px 4px`, gap `8px`, the outer relative wrapper. No other files touched.

### Files

- `src/components/CategoryFilterChips.tsx` — remove overlay div, add mask to scroll container
