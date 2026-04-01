

## Fix NextConversationCard Paywall Bypass

### Change (1 file: `src/components/NextConversationCard.tsx`)

**Line ~81**: Change the `onClick` navigation from direct card route to portal route.

```tsx
// Before
onClick={() => navigate(`/card/${card.id}`)}

// After
onClick={() => navigate(`/product/${product.slug}/portal/${nextSuggestedCategoryId}?card=${nextSuggestedCardId}`)}
```

No new imports, props, or other file changes needed.

