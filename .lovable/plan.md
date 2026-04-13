

## Revised Fix 2: Use template literal, drop `as any` cast

**File**: `src/components/ProductLibrary.tsx`

### Fix 1: Still Us badge pill alignment (~line 1110)

Add four CSS properties to the badge `<span>`'s style object: `display: 'inline-flex'`, `alignItems: 'center'`, `alignSelf: 'flex-start'`, `gap: '4px'`. No other changes to badge logic.

### Fix 2: Free-session banner tappable (~line 750)

Change inner `<div>` to `<button>` with:

```tsx
onClick={() => { if (freeProduct) navigate(`/product/${freeProduct.slug}`); }}
```

Using a template literal directly — no `as any` cast since `freeProduct` is already typed as `ProductManifest | undefined` and `.slug` is a required property on `ProductManifest`.

Add to existing style: `cursor: 'pointer'`, `width: '100%'`, `textAlign: 'left' as const`, `WebkitTapHighlightColor: 'transparent'`. Change closing `</div>` to `</button>`.

No other files, logic, or protected ref patterns are touched.

