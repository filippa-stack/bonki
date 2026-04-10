

## Use product-color fill for LibraryResumeCard

### Change
Replace the button's `style` object in `src/components/LibraryResumeCard.tsx` with a product-colored background at meaningful opacity, matching the energy of the product tiles below.

### Exact edit

Replace the button style block with:

```js
style={{
  width: '100%',
  padding: '18px 20px',
  background: `linear-gradient(135deg, ${hexToRgba(tileBg, 0.55)} 0%, ${hexToRgba(tileBg, 0.30)} 100%)`,
  border: `1px solid ${hexToRgba(tileBg, 0.7)}`,
  borderRadius: '22px',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  boxShadow: `0 0 30px ${hexToRgba(tileBg, 0.25)}, 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)`,
  WebkitTapHighlightColor: 'transparent',
}}
```

Single file, no logic changes.

