

## Elevate Install Page to 10/10

### Core Insight
Headspace uses ONE hero visual, generous whitespace, and everything above fold. Currently we have wordmark + creature + headline all fighting for attention.

### Changes to `src/pages/Install.tsx`

**1. Enlarge wordmark to 48px** (currently 36px, Login uses 60px)
- Change `maxHeight: '36px'` → `maxHeight: '48px'`

**2. Tighten creature section — reduce to 160px**
- 180px creature + 48px wordmark + headline is too much. Reduce creature to 160px to reclaim vertical space while keeping it prominent.
- Creature padding: `'8px 0 4px'` → `'4px 0 0'`

**3. Merge tagline into headline**
- Remove the separate "På riktigt." tagline (saves ~30px vertical space)
- The headline already captures the brand voice

**4. Compress value prop section**
- Reduce headline font from 22px → 20px
- Reduce section horizontal padding from 28px → 24px
- Trust badge margin: tighten top spacing

**5. Stats — softer labels**
- Change label `textTransform` from `'uppercase'` to `'none'` and bump to 13px
- Reduces the "dashboard" feel, more editorial

**6. Ensure sub-CTA + login link visible**
- CTA section padding: `'16px 24px 0'` → `'12px 24px 0'`
- Login section padding: `'32px 24px 48px'` → `'20px 24px 36px'`

### Net effect
~50-60px saved vertically. Everything including "Redan medlem?" fits above fold on 375×667.

### File changed
`src/pages/Install.tsx` only

