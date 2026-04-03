

## Fix: GRATIS Badge Not Hiding After Free Card Completion

The GRATIS badge reappears because both `KidsCardPortal.tsx` and `Category.tsx` check completions against a 14-day expiring list. The badge should use **all-time** completions so it permanently hides once the free card is done.

### Root cause

- `KidsCardPortal.tsx` line 469: checks `completedSet` which is built from `progress.recentlyCompletedCardIds` (14-day window)
- `Category.tsx` line 140-164: `completedCardIds` also filters by 14 days for kids products

Once the 14-day window passes (or in edge cases), the badge reappears even though the card was completed.

### Changes

**1. `src/pages/KidsCardPortal.tsx`**
- Add a second Set for all-time completions: `const allTimeSet = new Set(progress.allTimeCompletedCardIds)`
- Change the GRATIS badge condition (line 469) from `!completedSet.has(card.id)` to `!allTimeSet.has(card.id)`
- Keep `completedSet` (recently completed) for checkmarks and reordering — those should still expire

**2. `src/pages/Category.tsx`**
- Add an `allTimeCompletedCardIds` memo that does NOT apply the 14-day filter (uses `serverCompletedCardIds` directly + optimistic IDs)
- Change the GRATIS badge condition (line 232) from `!completedCardIds.includes(card.id)` to `!allTimeCompletedCardIds.includes(card.id)`
- Pass `allTimeCompletedCardIds` into `KidsProductCategoryView` for its badge check (line 733)
- Keep `completedCardIds` (14-day filtered) for checkmarks and progress display

### Not changed
- FreeCardBadge component itself
- Checkmark/progress display logic (still uses 14-day expiry)
- Any other file or component

