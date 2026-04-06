

## Install Page: 8.5 → 10/10

### Issues visible in the screenshot

1. **No atmospheric depth** — the page is flat Midnight Ink from top to bottom. Premium apps (Headspace, Calm) use a subtle radial gradient behind the hero to create depth and draw the eye.

2. **Creature floats in a void** — the logo sits on flat dark with a barely-visible glow. It needs a warm ambient radial behind it to feel like it's "alive" in the space.

3. **Headline lacks letterspacing** — the serif text at this size needs `letterSpacing: '0.01em'` to breathe. Currently it feels slightly cramped.

4. **Stats section is visually orphaned** — the thin border-top is too subtle. The numbers and labels need slightly more vertical padding to feel like a deliberate design element rather than floating text.

5. **No visual hierarchy between sections** — everything has the same spacing rhythm. The gap between the trust badge and stats should be larger than the gap between headline and badge.

### Changes (Install.tsx only)

**1. Add radial ambient glow behind the page**
- On the root `div`, add a layered background: a soft radial gradient centered at ~30% from top, using `rgba(212, 245, 192, 0.03)` fading to transparent, on top of MIDNIGHT_INK. This creates subtle atmospheric depth.

**2. Increase creature glow warmth**  
- Add a third drop-shadow layer with a warm teal tone: `drop-shadow(0 0 100px rgba(212, 245, 192, 0.06))` for wide atmospheric spread.

**3. Headline letterspacing**
- Add `letterSpacing: '0.01em'` to the h2 for refined serif typography.

**4. Section spacing adjustments**
- Value proposition section: increase top margin from `4px` to `8px`
- Stats section: increase top padding from `10px` to `16px` and inner padding from `16px 10px` to `20px 10px`
- CTA section: increase top padding from `12px` to `16px`

**5. Stats border refinement**
- Increase border opacity from `0.08` to `0.10` so the divider is actually visible

### File changed
`src/pages/Install.tsx` only — five surgical tweaks, no structural changes.

