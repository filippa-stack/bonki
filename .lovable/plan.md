

## Patch: Hide free-session banner during active sessions

**File**: `src/components/ProductLibrary.tsx`, line 599

**Change**: Append `&& activeProductIds.size === 0` to the `showFreeBanner` condition.

```typescript
// FROM
const showFreeBanner = !!freeProduct && !freeCardUsed && !freeProductPurchased;

// TO
const showFreeBanner = !!freeProduct && !freeCardUsed && !freeProductPurchased && activeProductIds.size === 0;
```

`activeProductIds` is already in scope (line 491). No other changes needed.

