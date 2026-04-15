

## Fix Post-Purchase Redirect to Land on Product Page

### Change
**File:** `src/pages/Index.tsx`, lines 177–184

Replace the current post-purchase block with one that also reads the `product` param, looks up the product manifest, uses the correct price for the pixel event, and redirects to the product page.

**FROM:**
```tsx
if (searchParams.get('purchase') === 'success') {
    const returnCard = searchParams.get('returnCard');
    trackPixelEvent('Purchase', { value: 249, currency: 'SEK' });
    window.history.replaceState({}, '', window.location.pathname);
    if (returnCard) {
      return <Navigate to={`/card/${returnCard}`} replace />;
    }
  }
```

**TO:**
```tsx
if (searchParams.get('purchase') === 'success') {
    const returnCard = searchParams.get('returnCard');
    const purchasedProductId = searchParams.get('product');
    const purchasedProduct = purchasedProductId ? allProducts.find(p => p.id === purchasedProductId) : null;
    const priceValue = purchasedProduct?.id === 'still_us' ? 249 : 195;
    trackPixelEvent('Purchase', { value: priceValue, currency: 'SEK' });
    window.history.replaceState({}, '', window.location.pathname);
    if (returnCard) {
      return <Navigate to={`/card/${returnCard}`} replace />;
    }
    if (purchasedProduct) {
      return <Navigate to={`/product/${purchasedProduct.slug}`} replace />;
    }
  }
```

`allProducts` is already imported on line 18. No other files or logic changed.

