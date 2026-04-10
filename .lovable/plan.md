

## Replace LibraryResumeCard button style

### Change
In `src/components/LibraryResumeCard.tsx`, replace the entire `style={{...}}` object on the `<button>` element with the user's provided style block. This removes `backdropFilter`, `WebkitBackdropFilter`, and `backgroundImage`, replacing them with a stronger gradient fill and a two-layer outer glow using the product tile color.

### Exact edit
Replace the button's style object (currently spanning ~lines 191–207) with:

```js
style={{
  width: '100%',
  padding: '18px 20px',
  background: `linear-gradient(135deg, ${hexToRgba(tileBg, 0.35)} 0%, ${hexToRgba(tileBg, 0.15)} 100%)`,
  border: `1px solid ${hexToRgba(tileBg, 0.35)}`,
  borderRadius: '22px',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  boxShadow: `0 0 40px ${hexToRgba(tileBg, 0.3)}, 0 0 80px ${hexToRgba(tileBg, 0.15)}, inset 0 1px 0 rgba(255,255,255,0.12)`,
  WebkitTapHighlightColor: 'transparent',
}}
```

Single file, no logic changes.

