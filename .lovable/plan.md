

## Fix Question Counter Visibility

**File:** `src/pages/CardView.tsx` — style-only changes to three counter elements.

### Changes

**1. Still Us multi-step counter (line 3036)**
- `opacity: 0.35` → `opacity: 0.55`
- Add `textShadow: '0 1px 3px rgba(0,0,0,0.5)'`

**2. Kids counter (line 3521–3545)**
The kids counter uses CSS variable colors and has no explicit low opacity on the text. However, the dot indicator at line 3542 has `opacity: 0.6` which is fine. No changes needed here per the user's request — but if the user intended this one, I'll leave it as-is since it uses themed CSS vars.

**3. Still Us 1-step fallback counter (line 3564)**
- `opacity: 0.4` → `opacity: 0.55`
- Add `textShadow: '0 1px 3px rgba(0,0,0,0.5)'`

### Summary
Two `<p>` elements updated with higher opacity and text shadow. No logic or layout changes.

