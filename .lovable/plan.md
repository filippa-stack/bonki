

## Problem

The product name is not readable in the journal. Two likely causes:

1. **Color/contrast**: The product name uses `accent.mid` at `cc` (80%) opacity on the dark background — too faint to read, especially for products with dark accent colors.
2. **Possibly empty**: If sessions were created before products were wired up, `entry.productId` and `entry.cardId` might not resolve to a product name, returning an empty string.

## Fix

Make the product name the most prominent metadata element:

### In `NoteEntryCard` (lines 304-321)
- Increase product name font size from `12px` → `13px`
- Use `accent.light` (the brighter tile color) instead of `accent.mid` for better contrast on dark backgrounds
- Add `fontWeight: 600` and remove the `cc` opacity suffix — use the full color
- Keep card name on line 2 at current muted style

### In `CompletedMarkerRow` (line 358)
- Make the product name a separate visual element before the card name
- Use the product's light accent color at full opacity instead of `${DRIFTWOOD}88`
- Increase font weight to 500

### Fallback for missing product name
- If `getProductName` returns empty string, show nothing (no blank space) — the card name alone is still useful

### No other changes
- Data layer, filter chips, hooks — untouched
- `getProductName` helper logic stays the same

