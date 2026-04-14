

## Fix A — ProductHome paywall gate

Four changes in `src/pages/ProductHome.tsx`, no other files touched.

### 1. Add imports (after line 13)
```typescript
import { useProductAccess } from '@/hooks/useProductAccess';
import ProductPaywall from '@/components/ProductPaywall';
import { isDemoMode } from '@/lib/demoMode';
```

### 2. Add hooks (after line 69, before `if (showIntro === true)`)
```typescript
const isFreeProduct = product ? isProductFreeForUser(product.id) : false;
const { hasAccess: hasProductAccess, loading: paywallAccessLoading } = useProductAccess(product?.id ?? '');
```

### 3. Add paywall gate (after the `showIntro === null` loading gate at line 108, before the `if (!product)` check at line 110)
```typescript
if (paywallAccessLoading && product) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: product.backgroundColor ?? 'var(--surface-base)',
    }} />
  );
}

if (product && !isFreeProduct && !hasProductAccess && !isDemoMode()) {
  return (
    <ProductPaywall
      product={product}
      onAccessGranted={() => window.location.reload()}
    />
  );
}
```

No other logic, files, or protected patterns modified.

