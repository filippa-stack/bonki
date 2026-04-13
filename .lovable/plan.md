

## Fix: Purchased tile pills show progress, not just count

**File**: `src/components/ProductLibrary.tsx`

### Change 1: PastelTile progress pill (line 457)

Change `✦ ${completedCount} samtal` to `✦ ${completedCount} av ${totalCards || 0} utforskade`.

### Change 2: Still Us tile badge (line 1151)

Change `✦ ${suCount} samtal` to `✦ ${suCount} av ${totalCards} utforskade`.

Both zero-completion ("Börja er resa") and unpurchased states remain untouched. No other files or protected patterns modified.

