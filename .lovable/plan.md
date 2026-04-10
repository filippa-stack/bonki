

## Replace LibraryResumeCard button style

### Change
In `src/components/LibraryResumeCard.tsx`, replace the `<button>`'s `style={{...}}` object with the provided white-glass style — neutral white gradient fill, white border, and a layered glow combining white ambience with a thin product-colored ring (`hexToRgba(tileBg, 0.5)`).

### Exact edit (single file, no logic changes)
Replace the button style block (~lines 191–203) with:

```js
style={{
  width: '100%',
  padding: '18px 20px',
  background: `linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)`,
  border: `1px solid rgba(255,255,255,0.15)`,
  borderRadius: '22px',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  boxShadow: `0 0 30px rgba(255,255,255,0.07), 0 0 60px rgba(255,255,255,0.04), 0 0 2px ${hexToRgba(tileBg, 0.5)}, inset 0 1px 0 rgba(255,255,255,0.15)`,
  WebkitTapHighlightColor: 'transparent',
}}
```

