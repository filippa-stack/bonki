

## Unify Product Intro Layout + Improve Readability

### Changes (1 file: `src/components/ProductIntro.tsx`)

**1. Remove card preview block** (lines ~347–429)
Delete the entire `resolvedFreeCardTitle && !isStillUs` conditional block. CTA button already shows card name.

**2. Improve body text readability**
- Body: `fontSize: '15px'` → `'16px'`, `lineHeight: 1.55` → `1.6`
- Paragraph spacing: `marginTop: '10px'` → `'14px'`
- Body wrapper: `marginTop: '8px'` → `'16px'`

**3. Fix signoff text**
- `fontSize: '14px'` → `'15px'`
- `opacity: 0.85` → `0.9`

### Safety
- No animation changes — all `initial={false}` and `duration: 0` untouched
- No `AnimatePresence` changes
- Outer `position: fixed` container unchanged
- No theme hook or dependency array changes

