

## Prompt 3: Update library tile badges with free card eligibility

### Summary
Add `isProductFreeForUser` check to `ProductLibrary.tsx` so badge text reflects whether the user is eligible for a free card on each product. Introduces a new `showFreeLabel` prop on `PastelTile` to cleanly handle the four badge states.

### Changes (single file: `src/components/ProductLibrary.tsx`)

**1. Add import (top of file)**
```typescript
import { isProductFreeForUser } from '@/lib/freeCardPolicy';
```

**2. PastelTile props — add `showFreeLabel` prop (~line 230-244)**
- Add `showFreeLabel?: boolean;` to the props type
- Add `showFreeLabel = false` to destructuring
- Remove `hideFreeBadge` from props (replaced by `showFreeLabel` + `freeCardCompleted` logic below)

Actually, keep `hideFreeBadge` for backward compat but add `showFreeLabel`. The badge text (~line 447-453) changes to:

```typescript
{isPurchased
  ? (completedCount ?? 0) > 0
    ? `✦ ${completedCount} samtal`
    : '✦ Börja er resa'
  : showFreeLabel
    ? `✦ ${totalCards || 0} samtal · Prova först`
    : hideFreeBadge
      ? '✦ Ert första samtal ✓'
      : `✦ ${totalCards || 0} samtal`}
```

Badge background tint (~line 428-431): use `hideFreeBadge` (free completed) for the warm Lantern Glow tint (existing behavior preserved).

**3. Still Us tile (~line 1042-1076)**
After `suFreeCompleted` computation, add:
```typescript
const suFreeEligible = isProductFreeForUser('still_us');
const suShowFreeLabel = suFreeEligible && !suFreeCompleted;
```

Update the inline badge text (~line 1070-1076) to match the same 4-state logic:
```typescript
{purchased.has('still_us')
  ? suCount > 0
    ? `✦ ${suCount} samtal`
    : '✦ Börja er resa'
  : suShowFreeLabel
    ? `✦ ${totalCards} samtal · Prova först`
    : suFreeCompleted
      ? '✦ Ert första samtal ✓'
      : `✦ ${totalCards} samtal`}
```

Update the background/border tint conditions accordingly (keep warm tint for `suFreeCompleted`).

**4. Kids product tiles (~line 1134-1164)**
After `freeCardCompleted` computation, add:
```typescript
const freeEligible = isProductFreeForUser(product.id);
const showFreeLabel = freeEligible && !freeCardCompleted;
```

Pass to PastelTile:
```typescript
hideFreeBadge={freeCardCompleted}
showFreeLabel={showFreeLabel}
```

### Badge states (all tiles)
| State | Badge text |
|-------|-----------|
| Purchased, has progress | `✦ 6 samtal` |
| Purchased, no progress | `✦ Börja er resa` |
| Free eligible, not tried | `✦ 21 samtal · Prova först` |
| Free card completed | `✦ Ert första samtal ✓` |
| Not eligible, not purchased | `✦ 21 samtal` |

