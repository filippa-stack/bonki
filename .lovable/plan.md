

## Fix: Per-product intro flash prevention

**File:** `src/pages/ProductHome.tsx` only

### Changes

1. **Synchronous initializer** — replace `useState(true)` with a per-product localStorage check:
```tsx
const [showIntro, setShowIntro] = useState(() => {
  if (!product?.id) return true;
  return !localStorage.getItem(`bonki-intro-seen-${product.id}`);
});
```

2. **Set key on intro completion** — in both `onComplete` and `onStartFreeCard` callbacks, add:
```tsx
localStorage.setItem(`bonki-intro-seen-${product.id}`, '1');
```

3. **Reconciliation effect** — when DB confirms intro not needed, persist the key:
```tsx
useEffect(() => {
  if (!introChecked) return;
  if (needsIntro && !showIntro) setShowIntro(true);
  if (!needsIntro && showIntro) {
    setShowIntro(false);
    if (product?.id) localStorage.setItem(`bonki-intro-seen-${product.id}`, '1');
  }
}, [introChecked, needsIntro]);
```

No other files touched. No protected patterns modified.

