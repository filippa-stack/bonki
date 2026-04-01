

## PaywallFullScreen → 10/10 Premium Polish

Apply the same contrast and hierarchy fixes proven on ProductIntro.

### Changes (1 file: `src/pages/PaywallFullScreen.tsx`)

**1. Trust line contrast**
- Change trust lines (rows 2-3) from `DRIFTWOOD` to `LANTERN_GLOW` at `opacity: 0.55`
- This matches the ProductIntro hierarchy: primary value line at full LANTERN_GLOW, trust lines softer but still legible

**2. Value prop font size**
- Increase value proposition text from `14px` to `15px` — the emotional pitch deserves more presence on a purchase page

**3. Metadata line contrast**
- Change "X samtal · Engångsköp · Tillgång för alltid" from `color: DRIFTWOOD` to `color: LANTERN_GLOW` with `opacity: 0.5`
- Increase from `13px` to `14px`

**4. "Inte just nu" contrast**
- Change from `color: DRIFTWOOD` to `color: LANTERN_GLOW` with `opacity: 0.45`
- Matches the ProductIntro skip-link standard

### What stays untouched
- All `initial={false}` and `duration: 0` patterns
- Purchase logic, error handling, dev bypass
- Layout structure, CTA button styling
- Price display and long-press handler
- `usePageBackground`, `useDefaultTheme` hooks

