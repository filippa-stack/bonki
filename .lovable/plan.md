
## Fix top-corner icon contrast on product home pages

### Problem
Both the back arrow (top-left) and the profile/account icon (top-right) on product home pages are nearly invisible. They default to dark text tokens (`var(--text-primary)` / `var(--color-text-primary)`) which resolve to dark ink — invisible against the dark teal/green/cobalt product backgrounds (Jag i Mig `#115D57`, Jag i Världen `#2B3D2B`, Vårt Vi cobalt, etc.).

The kids product homes (`JagIMigProductHome`, `JagIVarldenProductHome`, etc.) already pass an explicit cream color `#FDF6E3` to `ProductHomeBackButton` — but `KontoIcon` is rendered from the parent `ProductHome.tsx` shell with no color override, and the generic non-kids `ProductHome.tsx` branch also doesn't pass a color to its own back button.

### Fix
Change the **default fallback color** in both icon components from the dark text token to cream (`#FDF6E3` — the same Lantern Glow used elsewhere on dark surfaces) and bump opacity slightly for legibility.

### Files

**Modify:**
- `src/components/KontoIcon.tsx` — change fallback `color` from `var(--color-text-primary)` to `#FDF6E3`. Keep the `color` prop override so future light-bg surfaces can still pass dark.
- `src/components/ProductHomeBackButton.tsx` — change fallback `color` from `var(--text-primary)` to `#FDF6E3`. Bump opacity from `0.6` → `0.75` to match the cream text-link pattern used elsewhere on dark surfaces.

**Untouched:**
- `ProductHome.tsx` — kids variants already pass `color="#FDF6E3"` explicitly; that stays. Generic non-kids branch will now inherit the cream fallback automatically.
- All kids product home wrappers (`JagIMigProductHome`, `JagIVarldenProductHome`, etc.) — they already pass `#FDF6E3` to the back button, so behavior is unchanged for them. The `KontoIcon` they render via the parent shell will pick up the new cream fallback.

### Verification
1. Navigate to `/product/jag-i-mig` — back arrow (left) and profile icon (right) both visible as cream-colored icons against the dark teal background.
2. Repeat for `/product/jag-i-varlden`, `/product/vart-vi`, `/product/jag-med-andra` — both icons visible on every product home.
3. Confirm no regression on any light-background surface that consumes either component (search confirms only product homes use them).

### Rollback
Two-line revert in each component. No DB, routing, or layout changes.
