

## Change 3 — Replace sparkle with Ghost Glow lock on locked kids tiles

**Single file**: `src/components/ProductLibrary.tsx`

### 4 sub-changes

**3a/3b. Pill content** (lines 448–456)
Replace the three non-purchased branches of the pill content ternary:
- `showFreeLabel`: `✦ X samtal · Prova först` → `<><span style={white ✦}>✦</span> Första gratis · X samtal</>`
- `hideFreeBadge`: `✦ Ert första samtal ✓` → `<>🔒SVG X samtal</>`  (Ghost Glow lock SVG inline)
- default: `✦ X samtal` → `<>🔒SVG X samtal</>` (same lock SVG)

The lock SVG uses Ghost Glow palette: fill `rgba(212,245,192,0.5)`, stroke `#D4F5C0`, dual drop-shadow glow.

**3c. Pill background/border** (lines 428–439)
Add a `showFreeLabel` branch before `hideFreeBadge` in both the `background` and `border` ternaries, giving the free-eligible tile a brighter pill (`rgba(255,255,255,0.25)` bg, `0.35` border).

**3d. Free card elevation** (lines 283–286)
In the PastelTile root `<motion.div>` style, add conditional `transform: 'scale(1.02)'` and swap `boxShadow` to a stronger shadow+ring when `showFreeLabel` is true.

### What stays unchanged
- `isPurchased` pill branches (sparkle pills for subscribers)
- Tile backgrounds, illustrations, tap targets, navigation
- All other files

