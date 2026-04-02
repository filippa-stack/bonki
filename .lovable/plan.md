

## Onboarding 10/10 Polish

**File**: `src/components/Onboarding.tsx`

### Fix 1: Tile proportions — more refined
- **Line 176**: `height: '80px'` → `height: '64px'`, `borderRadius: '22px'` → `borderRadius: '16px'`

### Fix 2: Tile surface — better visibility
- **Line 182** (unselected border): `rgba(255, 255, 255, 0.08)` → `rgba(255, 255, 255, 0.10)`
- **Line 185** (unselected bg): `rgba(255, 255, 255, 0.04)` → `rgba(255, 255, 255, 0.06)`
- **Line 181** (selected border): `rgba(218, 157, 29, 0.35)` → `rgba(218, 157, 29, 0.40)`

### Fix 3: Grid gap — tighter
- **Line 166**: `gap: '12px'` → `gap: '10px'`

### Fix 4: Ambient glow — larger
- **Line 56–57**: glow div `width/height: '200px'` → `'240px'`

### Fix 5: Tile label — smaller but bold and branded
- **Line 191**: Keep `fontFamily: 'var(--font-display)'`, keep `fontWeight: 700`, change `fontSize: '17px'` → `fontSize: '15px'`

### Fix 6: Spacing tightening
- **Line 159**: tile section padding `padding: '16px 32px 0'` → `padding: '12px 32px 0'`
- **Line 162**: "Var vill ni börja?" margin `margin: '0 0 12px'` → `margin: '0 0 10px'`

### Unchanged
All tile selection logic, colors (selected/unselected), CTA, text content, tracking, routing, state.

