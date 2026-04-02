

## Fix Product Subtitle + Tile Label Visibility

### Issue 1: Product subtitle should be merged, not a separate line

Currently there's a tagline `<p>` ("När känslor får ord.") AND a separate description `<p>` below it ("21 samtal om känslor och att förstå sig själv"). The user wants a single line that reads:

**"{N} samtal om {tagline}"** — e.g. "21 samtal om när känslor får ord."

**Fix in `src/components/KidsProductHome.tsx`**:
- Replace the tagline `<p>` text (line 616) from `{product.tagline}` to `{product.cards.length} samtal om {product.tagline.toLowerCase().replace(/\.$/, '')}` (lowercase, strip trailing period, then add period at end)
- Remove the separate `PRODUCT_DESCRIPTIONS` block (lines 619–632) entirely
- Remove the `PRODUCT_DESCRIPTIONS` constant (lines ~93–101) since it's no longer needed

### Issue 2: "5 samtal om" tile label barely visible

The tile label uses `color: 'rgba(255,255,255,0.7)'` at `fontSize: '11px'` — against the dark scrim this should be visible, but 11px at 0.7 opacity is too faint in practice.

**Fix in `CategoryTile` within `KidsProductHome.tsx`** (line ~285–295):
- Increase opacity from `0.7` to `0.85`
- Increase font size from `11px` to `12px`
- Add stronger text-shadow: `'0 1px 3px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.5)'`

**Same fix in `src/components/CategoryTileGrid.tsx`** for the matching "samtal om" label.

### Unchanged
- Tile layout, images, tap behavior, animations, routes, progress format, renamed category titles

