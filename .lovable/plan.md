

## Onboarding: Final Visual Polish (4 Fixes)

**File**: `src/components/Onboarding.tsx` — visual-only changes

### Fix 1: Tighten illustration-to-credential spacing
- Content section (line 88): change `paddingTop: 0` → `paddingTop: '8px'` (already 0, but the illustration wrapper has `flex: 1 1 auto` which absorbs space)
- Illustration wrapper (line 42): reduce `minHeight: '140px'` → `minHeight: '100px'` to pull the logo closer to the text below
- Add `marginBottom: 0` to the illustration wrapper to eliminate any flex gap

### Fix 2: Memory-card tile styling
Lines 170–179 — each tile button:
- `borderRadius`: `'16px'` → `'22px'`
- `height`: `'72px'` → `'80px'`
- Add `boxShadow` per state:
  - Unselected: `'0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.06)'`
  - Selected: `'0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(218,157,29,0.15)'`

### Fix 3: Grid gap
Line 160: `gap: '10px'` → `gap: '12px'`

### Fix 4: Logo image sharpness
Line 61–73 — the `<img>` tag:
- Add `draggable={false}`
- Add `width={120}` and `height={120}` attributes
- Add `imageRendering: 'auto'` to the style object

### Unchanged
All logic, state, tracking, CTA, text content, routing.

