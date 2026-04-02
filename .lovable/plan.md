

## Onboarding: 2×2 Mini Tiles (Visual Only)

**File**: `src/components/Onboarding.tsx`

### Change

Replace the pill container and pill buttons (the `flex-column` list with single-line pills) with a 2×2 CSS grid of mini tiles.

**Container**: Change from `display: flex, flexDirection: column, gap: 6px` to:
- `display: 'grid'`, `gridTemplateColumns: '1fr 1fr'`, `gap: '10px'`

**Each tile button**:
- `height: '72px'`, `borderRadius: '16px'`, `padding: '12px 14px'`
- `display: 'flex'`, `alignItems: 'flex-end'`
- `position: 'relative'`, `overflow: 'hidden'`, `cursor: 'pointer'`
- Unselected: `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.08)`
- Selected: `background: rgba(218,157,29,0.10)`, `border: 1px solid rgba(218,157,29,0.35)`
- Remove `boxShadow`, `gap`, `width: 100%`, `textAlign`

**Tile text**: Single `<span>` with label only — remove subtitle span entirely:
- `fontFamily: 'var(--font-display)'`, `fontSize: '16px'`, `fontWeight: 600`, `letterSpacing: '-0.01em'`
- Unselected: `rgba(253,246,227,0.85)`, Selected: `#DA9D1D`

**Data array**: Remove `subtitle` field. Order: young, middle, teen, couple.

### Unchanged
Everything else: illustration, headline, credential, divider, body, "Var vill ni börja?", reassurance text, CTA, all state/logic/tracking.

