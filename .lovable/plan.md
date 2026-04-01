

## Fix LibraryResumeCard: Correct categoryId and Mock IDs

### Two bugs in the earlier (not-yet-implemented) LibraryResumeCard plan

**Bug 1: Demo/local preview uses wrong categoryId**
The plan proposed `product.categories?.[0]?.id` as fallback. `DemoActiveSession` already has a `categoryId` field — use `demoSession.categoryId` directly instead.

**Bug 2: Dev mock category IDs are fake**
The plan used `'jma-cat-1'` and `'su-cat-1'` which don't exist. Real IDs:
- Jag med Andra: `'jma-vem-ar-jag'` (first category)
- Still Us: `'su-mock-vardagen'` (first category)

### Changes (1 file: `src/components/LibraryResumeCard.tsx`)

**1. Extend `ResumeData` interface** (~line 43) — add `categoryId` and `productSlug`.

**2. Dev mocks** (~lines 68–70) — use real IDs and add new fields:
```tsx
// barn mock
{ productId: 'jag_med_andra', productSlug: 'jag-med-andra', categoryId: 'jma-vem-ar-jag', productName: 'Jag med Andra', cardTitle: 'Att vara duktig', cardId: 'jma-duktig', stepLabel: 'Pausad vid FRÅGA 2 AV 5', accentColor: SAFFRON_FLAME }

// par mock
{ productId: 'still_us', productSlug: 'still-us', categoryId: 'su-mock-vardagen', productName: 'Still Us', cardTitle: 'Att lyssna på riktigt', cardId: 'su-kommunikation-1', stepLabel: 'Pausad vid VÄND · Fråga 1 av 3', accentColor: DEEP_SAFFRON }
```

**3. `fetchFromDb` path** (~line 160) — populate from DB query and product manifest:
```tsx
productSlug: product.slug,
categoryId: session.category_id,
```

**4. Demo/local preview path** (~line 185) — use `demoSession.categoryId` directly:
```tsx
productSlug: product.slug,
categoryId: demoSession.categoryId,
```

**5. Fix navigation** (~line 260):
```tsx
onClick={() => navigate(`/product/${display.productSlug}/portal/${display.categoryId}?card=${display.cardId}`)}
```

### What stays untouched
- All other files
- All protected patterns

