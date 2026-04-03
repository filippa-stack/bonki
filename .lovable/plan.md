

## Fix Tile Text Readability — Bottom Gradient Scrims

**File:** `src/components/ProductLibrary.tsx`

### Change 1: Add scrim to PastelTile (kids product tiles)
After the illustration `</div>` (line 313) and before the text container (line 362), insert:

```tsx
{/* Bottom scrim for text readability */}
<div style={{
  position: 'absolute',
  left: 0, right: 0, bottom: 0,
  height: '70%',
  background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, transparent 100%)',
  pointerEvents: 'none',
  zIndex: 1,
  borderRadius: '0 0 22px 22px',
}} />
```

Update text container (line 366) `zIndex: 2` — already 2, confirmed fine.

### Change 2: Add scrim to Still Us tile
After the illustration `</div>` (line 915) and before the text container (line 919), insert:

```tsx
{/* Bottom scrim for text readability */}
<div style={{
  position: 'absolute',
  left: 0, right: 0, bottom: 0,
  height: '70%',
  background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, transparent 100%)',
  pointerEvents: 'none',
  zIndex: 2,
  borderRadius: '0 0 22px 22px',
}} />
```

Text container already has `zIndex: 3` — confirmed fine.

### Change 3: Bump hero subtitle opacity
Line 698: `color: 'hsla(100, 40%, 80%, 0.60)'` → `'hsla(100, 40%, 80%, 0.65)'`

Small bump for legibility while staying secondary.

### Not changed
- Tile layout, border-radius, height, illustration positioning
- Text content, tile colors, illustration opacity
- Resume banner, suggestion tile, section headers
- Logic, routing, data fetching
- Any other file

