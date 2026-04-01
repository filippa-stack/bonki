

## Onboarding → True 10/10

### What's holding it back

1. **Dead space gap** — `marginTop: 'auto'` on the content block pushes everything to the absolute bottom, leaving ~40% of the screen as empty void between illustration and text
2. **Illustration too small** — 200px on a 390px viewport (51%) feels timid for a hero moment; premium apps use 60-70% width
3. **Bottom fade eats the creature** — 80px gradient clips into the illustration bottom edge
4. **Ambient glow misaligned** — sits at `top: 5%` but illustration starts at ~48px; glow should center on the creature

### Changes (1 file: `src/components/Onboarding.tsx`)

**1. Illustration size: 200px → 240px**
- Gives the creature the monumental presence expected of a hero element
- Still well within viewport bounds with padding

**2. Layout: replace `marginTop: 'auto'` with balanced flex**
- Give the illustration zone `flex: '1 1 auto'` so it absorbs available space and centers the creature vertically
- Content block: remove `marginTop: 'auto'`, keep `flex: '0 1 auto'`
- This distributes space *around* the illustration rather than dumping it all between illustration and text

**3. Reduce bottom fade: 80px → 48px**
- Stops the gradient from eating into the creature's body
- Still provides a smooth transition into Midnight Ink

**4. Reposition ambient glow**
- Move from `top: '5%'` to `top: '8%'` to better center behind the larger illustration

### What stays untouched
- `initial={false}` and `duration: 0` on all motion elements
- `position: fixed` container and `overflow: hidden`
- `usePageBackground('#1A1A2E')`
- All text content, colors, opacities, font sizes
- BonkiButton and click handlers
- `trackOnboardingEvent` logic

