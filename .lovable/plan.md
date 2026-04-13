

## Fix: Free-session banner navigates to free card portal

**File**: `src/components/ProductLibrary.tsx` (~line 750)

Update the `<button>` onClick handler to navigate directly to the portal page for the free card's category, instead of just the product home.

**Change**: Replace the current `onClick` with logic that finds the free card's category and navigates to `/product/{slug}/portal/{categoryId}`. Falls back to product home if category lookup fails.

No other files, logic, or protected patterns touched.

