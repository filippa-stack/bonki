

## Make "Nästa steg" Suggestion Tappable

**File:** `src/components/ProductLibrary.tsx`

### Change (lines 733-743)

Replace the `<p>` element with a `<button>` that navigates to the suggested product's page on tap.

**From:**
```tsx
<p style={{
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: '#FDF6E3',
  opacity: 0.45,
  lineHeight: 1.5,
}}>
  Nästa steg: prova <span style={{ fontWeight: 600, opacity: 1, color: '#D4F5C0' }}>
    {untriedProduct.name}
  </span> — ert första samtal är gratis.
</p>
```

**To:**
```tsx
<button
  onClick={() => navigate(`/product/${untriedProduct.slug}`)}
  style={{
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    color: '#FDF6E3',
    opacity: 0.45,
    lineHeight: 1.5,
    WebkitTapHighlightColor: 'transparent',
  }}
>
  Nästa steg: prova <span style={{ fontWeight: 600, opacity: 1, color: '#D4F5C0' }}>
    {untriedProduct.name}
  </span> — ert första samtal är gratis.
</button>
```

`navigate` is already imported and used throughout the component. No other changes needed.

### Not changed
- Conditional logic for showing/hiding the suggestion
- Any other element or file

