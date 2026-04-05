

## Polish Install Page to Headspace Tier

Four changes to `src/pages/Install.tsx`:

### 1. Replace "BONKI" text heading with wordmark image
- Import `bonki-wordmark.png` (already used on Login and Library pages)
- Replace the `<motion.h1>BONKI</motion.h1>` (lines 100-113) with a `<motion.img>` using the wordmark asset
- Style: `maxHeight: 36px`, `objectFit: 'contain'`, no background — matches brand spec
- Keep the "På riktigt." tagline below it as-is

### 2. Add breathing animation to creature logo
- Wrap or animate the existing creature `<motion.img>` with a slow vertical float: `animate={{ y: [0, -6, 0] }}` over ~4s, infinite, easeInOut
- Subtle enough to feel alive without being distracting

### 3. Remove border + background from trust stats container
- Remove `background: 'rgba(255,255,255,0.04)'` and `border: '1px solid rgba(255,255,255,0.06)'` from the stats div (line 211-214)
- Let the numbers float freely against the dark background (cleaner, more Headspace-like)

### 4. Add trust badge for psychologist credential
- Replace the plain text "För familjer och par — skapat med legitimerad psykolog." with a slightly styled badge element (small shield/check icon + text)
- Uses existing palette colors, subtle `rgba` background pill

### Files changed
- `src/pages/Install.tsx` only

