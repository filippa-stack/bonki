

## Intro page polish — single coherent design pass

Four targeted edits to `src/components/ProductIntro.tsx`. No other files touched.

### Fix 1 — Strengthen the preview question card

In the `PREVIEW_QUESTION[productId]` block, replace the cream-tint container styles with a dark overlay so the card reads as a distinct object on every product background:

- `marginTop`: `28px` → `32px`
- `padding`: `18px 20px` → `24px 24px`
- `backgroundColor`: `rgba(253, 246, 227, 0.06)` → `rgba(11, 16, 38, 0.35)`
- `border`: `1px solid rgba(253, 246, 227, 0.10)` → `1px solid rgba(253, 246, 227, 0.20)`
- `borderRadius` stays `14px`.

### Fix 2 — Product-specific preview kicker

Add a computed value alongside the existing `ctaLabel`:

```ts
const previewLabel = `En fråga ur ${product?.name ?? 'samtalen'}`;
```

Replace the hardcoded `"En fråga ur samtalen"` inside the kicker `<div>` with `{previewLabel}`. Still Us renders as "EN FRÅGA UR VÅRT VI" because `product.name` already resolves to "Vårt Vi".

### Fix 3 — Trim and correct the meta block

In the meta block below the preview card:

- **Remove** the `{cardCount} samtal · {categoryCount} kategorier` `<p>` (the first paragraph in that block).
- **Update** the credibility line:
  - From: `Utvecklat tillsammans med psykolog · 29 års klinisk erfarenhet`
  - To:   `Utvecklat av psykologer · 29 års klinisk erfarenhet`

(Note: current file already shows `29 års` — credibility copy still gets the "av psykologer" tightening regardless.)

Result: two centered lines remain — price line, then the psychologist credibility line.

### Fix 4 — Simplify CTA label

Replace `ctaLabel`:

```ts
const ctaLabel = priceSek !== null
  ? `Köp · ${priceSek} kr`
  : 'Köp';
```

Product name lives in the heading and kicker; no need to repeat it in the button.

### Untouched

- `PREVIEW_QUESTION` map and all 7 questions
- Headings, taglines, body text, "Inte just nu" skip link, back button
- Illustration zone (creature image, position, opacity, fade)
- Telemetry: `trackPixelEvent('InitiateCheckout', …)` and `intro_cta_clicked_${productId}` insert
- Navigation target `/buy?product=${productId}`
- `BuyPage.tsx`, `ProductHome.tsx`, protected session files, design tokens

### Verification

For each of the 7 products (`/?devState=browse` then open each intro):

1. Preview card visibly framed on every background (verify Vårt Vi navy + Syskon purple).
2. Kicker reads "EN FRÅGA UR {PRODUCT NAME}" — including "EN FRÅGA UR VÅRT VI".
3. Meta block has exactly two lines (price line, then `Utvecklat av psykologer · 29 års klinisk erfarenhet`); no `samtal · kategorier` line.
4. CTA reads `Köp · 195 kr` (or `Köp · 249 kr` on Vårt Vi).
5. Tapping CTA still navigates to `/buy?product=…` and fires both telemetry events.
6. "Inte just nu" and back button still present and functional.

### Rollback

Single-file revert of `src/components/ProductIntro.tsx`.

