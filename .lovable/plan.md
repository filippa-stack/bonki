

## Fix Price Fallbacks: 249 for Still Us, 195 for Kids

Four files need changes. Two are already correct.

### Changes

1. **`src/pages/KidsCardPortal.tsx`** line 149
   - `249` → `195`

2. **`src/pages/Category.tsx`** line 129
   - `249` → `195`

3. **`src/pages/PaywallFullScreen.tsx`** line 57
   - `249` → `(productId === 'still_us' ? 249 : 195)`

4. **`src/components/ProductPaywall.tsx`** line 66
   - `249` → `(product.id === 'still_us' ? 249 : 195)`

### No change needed
- `src/components/PurchaseScreen.tsx` — Still Us only, already 249
- `src/pages/Paywall.tsx` — Still Us only, already 249

