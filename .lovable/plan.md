

## Fix: Library tab bypasses skip-to-product redirect

### Problem
Tapping "Biblioteket" navigates to `/`, but Index.tsx immediately redirects back to the last active product.

### Changes

**1. `src/components/BottomNav.tsx`** (~line 99)
Add `sessionStorage.setItem('bonki-navigating-to-library', '1');` before `navigate('/')` in the `if (item.id === 'library')` block.

**2. `src/pages/Index.tsx`** (before the skip-to-product block)
Add two lines before the `// Skip-to-product` comment:
```typescript
const libraryNavFlag = sessionStorage.getItem('bonki-navigating-to-library');
if (libraryNavFlag) sessionStorage.removeItem('bonki-navigating-to-library');
```

Then guard the redirect: change `if (lastProductSlug)` to `if (lastProductSlug && !libraryNavFlag)`.

No other files, blocks, or ref patterns are touched.

