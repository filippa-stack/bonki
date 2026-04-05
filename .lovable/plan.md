

## Get CTA Above the Fold

The creature logo (220px) + headline + sub-copy + stats currently push the CTA below ~620px viewport height. Two approaches to fix this:

### Option A: Reduce creature to ~180px + tighten gaps (recommended)
- Creature: 220px → 180px (still dominant, but saves 40px)
- Remove tagline bottom margin or reduce heading `fontSize` from 24px → 22px
- Trust stats internal padding: `20px 12px` → `16px 10px`
- Net savings: ~60-70px — enough to get CTA fully visible

### Option B: Keep 220px creature, compress everything else aggressively
- Heading font: 24px → 20px
- Sub-copy font: 15px → 14px, reduce margin
- Stats padding: more aggressive compression
- Risk: text becomes too small and loses premium feel

### Recommendation
Option A — creature at 180px is still large and prominent, and the page breathes better. The CTA will be fully visible on standard phones (375×667 and up).

### Changes to `src/pages/Install.tsx`
1. Creature: `width/height: '220px'` → `'180px'`
2. Creature section padding: `'12px 0 8px'` → `'8px 0 4px'`
3. Headline font-size: `'24px'` → `'22px'`, margin-bottom: `'12px'` → `'8px'`
4. Sub-copy margin-bottom in section: `margin: '0 0 24px'` kept but section margin tightened: `'-4px auto 0'` → `'-8px auto 0'`
5. Stats container padding: `'20px 12px'` → `'16px 10px'`
6. Stats section top padding: `'20px'` → `'14px'`
7. CTA section top padding: `'24px'` → `'16px'`

