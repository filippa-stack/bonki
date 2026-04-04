

## Fix: Journal Page Blank Screen

**File:** `src/pages/Journal.tsx`

### Root Cause

The most likely cause is that the hero section renders but nothing is visible because either:
1. The component hits an error during render (most likely from the card components with invalid border syntax), or
2. The empty state renders but is invisible

The **border syntax** on lines 246 and 442 is suspicious:
```tsx
border: `0.5px solid ${accent.light}18`,
```
This produces e.g. `0.5px solid #27A69C18` — while syntactically valid 8-digit hex, some browsers may not parse `0.5px` borders correctly, and more importantly, the `18` suffix may be interpreted incorrectly if the hex color already has transparency from the palette.

However, the blank screen (not even the hero title visible) suggests a **build/compile error** or **runtime crash** preventing the entire component from mounting.

### Fix Plan

1. **Fix border syntax** (lines 246, 442) — change from appending hex alpha to using `rgba()`:
   ```tsx
   // FROM:
   border: `0.5px solid ${accent.light}18`,
   // TO:
   border: `0.5px solid ${accent.light}29`,
   ```
   Actually, to be safe, convert to proper rgba:
   ```tsx
   border: `1px solid ${accent.light}29`,
   ```
   The `0.5px` value is not reliably rendered across all browsers. Use `1px` instead.

2. **Same fix for backgroundColor** (lines 245, 441) — keep the `22` alpha suffix but verify it works. These are standard 8-digit hex and should work.

3. **Add error boundary safety** — wrap the timeline rendering in a try/catch or verify the component mounts by checking if the hero text "Era samtal" is at least visible when the page loads.

### Minimal approach
The safest fix: change the two border lines from `0.5px solid ${accent.light}18` to `1px solid ${accent.light}29` and verify the page renders. If the issue persists, we'll need to check build logs for compilation errors.

### Files changed
- `src/pages/Journal.tsx` — lines 246 and 442 (border fix)
