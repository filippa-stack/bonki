

## One-Tap Resume from Library

**File:** `src/components/LibraryResumeCard.tsx`

**Single change** — update the `onClick` handler on the main `<button>` element (line 258):

```tsx
// FROM:
onClick={() => navigate(`/product/${display.productSlug}/portal/${display.categoryId}?card=${display.cardId}`)}

// TO:
onClick={() => navigate(`/card/${display.cardId}`)}
```

**Why safe:** The resume card only renders for `status === 'active'` sessions — paywall already passed, session already exists. CardView picks up the active session via `normalizedSession` and resumes at the correct prompt.

**No other changes.**

