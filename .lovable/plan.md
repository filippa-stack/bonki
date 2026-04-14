

## Fix B — Completion page paywall (Kids + Still Us)

Single file: `src/pages/CardView.tsx`

### 1. Add state variables (after line 203, near existing paywall state)

```typescript
const [completionPurchaseLoading, setCompletionPurchaseLoading] = useState(false);
const [completionPurchaseError, setCompletionPurchaseError] = useState<string | null>(null);
const [completionPriceSek, setCompletionPriceSek] = useState<number | null>(null);
```

### 2. Add price-fetch useEffect (near line 227, after other useEffects)

Fetches `price_sek` from `products` table by `product.id`, with fallback defaults (249 for still_us, 195 otherwise).

### 3. Add `handleCompletionPurchase` function

Calls `create-checkout` edge function. Includes auth guard with `setCompletionPurchaseError`, handles `already_purchased` (reload), 503 (not configured), and general errors. Uses `completionPurchaseLoading` state.

### 4. Kids completion block (~lines 1480–1568): wrap in conditional

The existing navigation (comment `{/* 4. Primary CTA med Föregående */}` through the secondary "Till" link at ~line 1568) gets wrapped:

- **If `isFreeCard && !hasProductAccess`**: Render inline purchase CTA — product name, price, "Lås upp" button, error display, trust line, and fallback "Till [product]" link.
- **Else**: Existing navigation code unchanged, wrapped in `<>...</>`.

### 5. Still Us completion block (~lines 1772–1843): wrap in conditional

The `cardId === 'su-mock-0'` branch's inner content (ghost "Nästa samtal" + "Till Vårt Vi") gets the same treatment:

- **If `!hasProductAccess`**: Show purchase CTA with Still Us naming.
- **Else**: Existing code unchanged.

### What is NOT touched

- No hooks, refs, effects, or session logic above the completion blocks
- No protected patterns (`suppressUntilRef`, `prevServerStepRef`, `pendingSave`, `kidsNoteSyncedRef`, `userDismissedCompletion`, `hasRenderedContent`)
- No rendering chain order changes
- No other files

