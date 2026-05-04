# Product home mock — iteration 2

Single file changed: `src/components/ProductHomeMock.tsx`. Live `ProductHome.tsx` and all other surfaces untouched.

## Changes

### 1. Remove atmospheric tint
- Delete the absolutely-positioned gradient overlay (`tintGradient` div) at the top of the page.
- Drop the `tintGradient` constant. Page background remains solid `#1A1A2E` (MIDNIGHT_INK). Title and subtitle sit on stable midnight ink.

### 2. Source real categories + cards from live product data
- Replace the hardcoded `SPECS` map's `cards: [{ title, total }]` shape with data sourced from `getProductById(productId)` in `@/data/products`.
- For each product, derive an ordered structure:
  ```text
  sections: Array<{
    categoryId: string;
    categoryTitle: string;        // e.g. "Mina känslor"
    cards: Array<{ id, title }>;  // ordered as in the manifest
  }>
  ```
  Built by grouping `product.cards` by `categoryId`, preserving the order in `product.categories`.
- Keep a small local `MOCK_META` map for the per-product values not on the manifest:
  - `subtitle` (e.g. "21 samtal om känslor som får ord.")
  - `progressColor` (see §4)
- Resolve `productName` from `product.name` (or fall back to existing copy for `still_us` if the manifest name differs).
- If `getProductById` returns nothing, keep the existing "Okänt produkt-id" fallback.

### 3. Flatten card list with category dividers
- Replace the current 2-column grid block with a vertical stack of sections. Each section renders:
  1. A category divider (typography only, not a button)
  2. A 2-column grid of that category's cards
- Divider styling:
  - `font-family: var(--font-sans)` (Inter), `font-size: 11px`, `font-weight: 600`, `letter-spacing: 0.2em`, `text-transform: uppercase`, `color: rgba(255,255,255,0.45)`
  - `padding: 24px 0 12px 4px`
  - Render as a `<div>` (no click handler, no chevron, no background)
- Card composition unchanged: DEEP_DUSK surface, aspect `1 / 1.15`, title-top + illustration-middle (cycled `PLACEHOLDER_POOL[globalIndex % pool.length]`) + progress-bottom.
- Tapping a card still navigates to `/library-mock`.

### 4. Product-color progress bars
- Add `MOCK_META.progressColor` per product:
  - `jag_i_mig`: `#5BC9BC`
  - `jag_med_andra`: `#E27BAC`
  - `jag_i_varlden`: `#D5DC4F`
  - `vardagskort`: `#7FCEAB`
  - `syskonkort`: `#C4A5D6`
  - `still_us`: `#8898AE`
  - (`sexualitetskort` not in scope — fall back to `#5BC9BC` if reached)
- Progress bar:
  - Track: `height: 3px`, `borderRadius: 2px`, `background: rgba(255,255,255,0.08)`
  - Fill: `width: {pct}%`, `background: progressColor` (no opacity wrapper, full saturation)
- Per-card "total" comes from the card's prompt count (length of the `opening` section's `prompts`, falling back to 1 if not present), so progress percentages remain meaningful.
- Caption text below the bar unchanged: `{done}/{total} samtal`.

### 5. Mock progress state
- Update `buildProgress` to take the flat ordered list of cards (across all categories) and return one completion count per card, preserving the same three semantic states:
  - `fresh`: all zeros (no product color visible anywhere)
  - `progress`: first card complete, second card ~40%, rest zero
  - `mostly`: all cards complete except the last, which is ~60%
- Resume banner logic:
  - `isResume = state === 'progress'` (unchanged)
  - `resumeCard` = first card in the flat list when `fresh`/`mostly`, second card when `progress`
  - Resume copy uses `resumeCard.title` and the card's total prompt count

### 6. Untouched
- Header bar (back arrow + "Biblioteket"), title + subtitle block, KontoIcon, KontoSheet, MOCK badge, dev panel, bottom-padding for nav, page background color.

## Verification (manual, after implementation)
- `/product-home-mock/jag_i_mig` renders on solid midnight ink with no gradient at top.
- Cards appear in a single vertical scroll, grouped under uppercase dividers matching the live manifest (e.g. `MINA KÄNSLOR`, `STARKA KÄNSLOR`, `STORA KÄNSLOR`, `ATT VARA JAG`).
- "Just purchased" → no product color visible.
- "In progress" on `jag_i_mig` → vibrant teal `#5BC9BC` progress fills.
- Switching to `jag_med_andra` → rose `#E27BAC`; `still_us` → slate `#8898AE`.
- Tapping a divider does nothing; tapping a card goes to `/library-mock`.
