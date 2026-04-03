

## Fix Still Us Session Page Layout + Visibility

**File:** `src/pages/CardView.tsx` — 4 changes in the Still Us focus mode block

### Change 1: Center question card
Line 2674: `justifyContent: 'flex-end'` → `'center'`

### Change 2: Reduce illustration opacity + add scrim
Line 2692: `opacity: 0.7` → `0.35`

After the `</img>` closing (line 2696), before the white question card div (line 2699), insert:
```tsx
{/* Dark scrim for readability */}
<div style={{
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.25)',
  pointerEvents: 'none',
  zIndex: 0,
}} />
```

### Change 3: Progress bar visibility
Line 2653: `height: '2px'` → `'4px'`
Line 2654: `backgroundColor: 'rgba(255,255,255,0.08)'` → `'rgba(255,255,255,0.12)'`

### Change 4: Question counter
After line 2665 (progress bar closing `</div>`), insert:
```tsx
<p style={{
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  fontWeight: 500,
  color: '#FDF6E3',
  opacity: 0.35,
  textAlign: 'center',
  margin: '8px 0 0',
  letterSpacing: '0.03em',
}}>
  {localPromptIndex + 1} av {sectionPromptCount}
</p>
```

`localPromptIndex` and `sectionPromptCount` are already available in scope.

### Not changed
- Advance/back handlers, completion logic, AnimatePresence, note/save logic, header, CTA, kids block, any other file.

