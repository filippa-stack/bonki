

## Add Product Name to Empty Sessions List

**File:** `src/pages/Journal.tsx` — 1 change

### Change (line 1260)

Replace the card name span with product name + separator + card name:

```tsx
// Line 1260 — currently:
<span style={{ color: 'rgba(253,246,227,0.6)' }}>{m.cardName}</span>

// Replace with:
<span>
  <span style={{ color: 'rgba(253,246,227,0.45)' }}>
    {allProducts.find(p => p.id === m.productId)?.name}
  </span>
  <span style={{ color: 'rgba(253,246,227,0.35)', margin: '0 6px' }}>·</span>
  <span style={{ color: 'rgba(253,246,227,0.6)' }}>{m.cardName}</span>
</span>
```

### No other changes needed
- `allProducts` is already imported
- `CompletedMarker` already has `productId`
- Header, date column, collapse logic, and all other sections remain untouched

