

## Fix: "sparas under samtalet" → "sparas i samtalet"

**File: `src/pages/CardView.tsx`** — line 3052

The only instance of "under samtalet" in session prompts:

```
// Before
Det ni skriver sparas under samtalet

// After
Det ni skriver sparas i samtalet
```

Single line change. No other files contain this phrase.

