

## Restore Full Ghost-Glow Intensity on Background Logo

**File**: `src/components/Onboarding.tsx`

### Change
On the `<img>` element (~line 55): increase opacity from `0.35` → `0.88`, keep `filter: 'brightness(1.15) saturate(1.3)'`. The logo stays absolute-positioned behind the text as a background element, but now glows at full brand intensity — the illuminator, not a whisper.

### Unchanged
Position (`absolute`, `zIndex: 0`), size (`160px`), layout structure, saffron ambient glow, all text/pills/CTA logic.

