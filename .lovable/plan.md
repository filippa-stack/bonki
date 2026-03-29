

## Journal Page Polish — 10/10 Design

### Changes

**1. Product-colored accents via `productTileColors`**

Replace `getProductColor()` (lines 182-184) which returns only saffron variants. Instead, look up `productTileColors[productId]` from `palette.ts` and use `tileMid` as the accent. Fallback to `DEEP_SAFFRON` for unknown products.

This means each reflection card gets the color of its source product — teal for Jag i Mig, pink for Jag med Andra, cobalt for Still Us, etc.

**2. Replace left border with a subtle top-edge color bar + elevated card surface**

Instead of `borderLeft: 3px solid`, each `NoteEntryCard` gets:
- A thin (2px) horizontal color bar at the very top of the card, using the product's `tileMid` at 40% opacity — like a colored bookmark tab
- Slightly lighter card surface (`#2E3142` instead of `DEEP_DUSK`) to create more lift against the midnight background
- Remove the `borderLeft` entirely

This is more editorial and magazine-like — the color signals product origin without the heavy sidebar feel.

**3. Takeaway label: "Ni bar med er"**

Instead of "Ert takeaway" or "Reflektion efter samtalet", takeaway entries (id starts with `takeaway-`) get:
- Label: **"Ni bar med er"** in small caps, using the product's `tileMid` color at 70% opacity
- A subtle background tint: product `tileDeep` at 8% opacity behind the entire card
- This distinguishes takeaways from step reflections without using gold or English loanwords

For non-takeaway entries where `questionText` is null, suppress the "— Reflektion efter samtalet" fallback entirely (show nothing).

**4. Fix metadata wrapping**

Change the metadata row (lines 273-287) to use `flex-wrap: wrap` so on narrow viewports the date drops to a second line cleanly instead of overflowing.

**5. Normalize dates within month groups**

Inside a month group, always use `formatRelativeDate` (short: "idag", "fredag", "14 mar") instead of `formatFullDate` (which can produce "24 februari 2026"). The month header already provides that context.

### Files changed

| File | Change |
|---|---|
| `src/pages/Journal.tsx` | All changes above — import `productTileColors`, update `getProductColor`, restyle `NoteEntryCard`, takeaway label, metadata wrap, date format |

### Not touched
- Data fetching, filter logic, session state
- AnimatePresence, theme hooks, protected ref patterns
- No database changes

