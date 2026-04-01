

## Product Intro → 10/10 Premium Polish

### Issues identified from screenshots

1. **Signoff text invisible** — uses `productAccent` which blends into some dark backgrounds (especially Jag med Andra's berry)
2. **"Inte just nu" invisible** — uses `DRIFTWOOD` (#6B5E52), nearly gone on all dark backgrounds
3. **Fixed 24% spacer** — doesn't adapt to content length; some products have CTA pushed below fold, others have awkward gaps
4. **Illustration cropping** — global `objectPosition: 'center 30%'` cuts creature faces on Syskon and Sexualitet
5. **Tagline-to-body spacing** too tight (4px + 16px), reads as one block
6. **Body text contrast** — pure LANTERN_GLOW at 100% opacity competes with the heading instead of sitting below it in hierarchy

### Changes (1 file: `src/components/ProductIntro.tsx`)

**1. Fix signoff contrast**
- Change signoff `color` from `productAccent` to `LANTERN_GLOW`
- Keep `opacity: 0.7` (down from 0.9) — visible on every background without competing with body

**2. Fix skip-link contrast**
- Change "Inte just nu" `color` from `DRIFTWOOD` to `LANTERN_GLOW`
- Set `opacity: 0.45` — visible but clearly secondary

**3. Replace fixed spacer with flexible min-height**
- Change `flex: '0 0 24%'` → `flex: '1 1 auto'`, `minHeight: '15%'`
- Content area adapts: short text gets more breathing room, long text pushes illustration zone up naturally

**4. Per-product illustration objectPosition**
- Add a `PRODUCT_ILLUSTRATION_POSITION` map for fine-tuned focal points:
  - `jag_i_mig`: `'center 25%'` (creature centered)
  - `jag_med_andra`: `'center 35%'`
  - `jag_i_varlden`: `'center 30%'`
  - `vardagskort`: `'center 20%'`
  - `syskonkort`: `'center 15%'` (face higher up)
  - `sexualitetskort`: `'center 20%'` (face higher up)
  - `still_us`: `'center 30%'`

**5. Typography hierarchy**
- Body text: add `opacity: 0.88` — softens body below heading while staying readable
- Tagline: increase `marginTop` from `4px` to `8px`
- Body wrapper: increase `marginTop` from `16px` to `20px`

**6. Sexualitet safety line**
- Change `color` from `productAccent` to `LANTERN_GLOW` at `opacity: 0.6`
- Increase `fontSize` from `13px` to `14px` for minimum readability standard

### What stays untouched (safety)
- All `initial={false}` and `duration: 0` patterns
- `AnimatePresence` usage (none currently present in render)
- Outer `position: fixed` container and `overflow` logic
- `willChange`/`backfaceVisibility` patterns elsewhere
- All server-side logic, hooks, dependency arrays
- CTA button styling and press handlers
- All protected patterns

