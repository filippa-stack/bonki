

## Solid Fill on NextActionBanner CTA Pill

**File:** `src/components/NextActionBanner.tsx`

### Change — CTA `<span>` style updates

Update the pill's inline style object (around line 126-136) with:

- Add `border: 'none'`
- Add `opacity: 1`
- Change `boxShadow` from `'0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)'` to `'0 2px 8px rgba(0,0,0,0.25)'`
- Add `position: 'relative'` and `zIndex: 1` to isolate from banner border

Keep `backgroundColor: accentColor`, text color, padding, borderRadius, font unchanged.

### Not changed
- Pill text, padding, border-radius, font, color
- Banner background, layout, state logic
- Any other file

