

## Unify paywall design — `ProductPaywall` matches `ProductIntro`

### Goal

Rewrite `src/components/ProductPaywall.tsx` so every product (including Vårt Vi) renders a single fullscreen paywall that visually mirrors `ProductIntro`. Delete the Still Us bottom-sheet branch. Drop card-level personalization props (the call site in CardView is unreachable dead code).

### Files

**Modify (single file):**
- `src/components/ProductPaywall.tsx` — full rewrite to one fullscreen layout. Drop `cardId` and `currentCardTitle` from the props interface (loose typing — CardView's dead-code call site can keep passing them; they'll be ignored).

**Untouched:** `ProductIntro.tsx`, `ProductHome.tsx`, `CardView.tsx`, `BuyPage.tsx`, `productIntros.ts`, `productPreviewQuestions.ts`.

### New layout (mirrors `ProductIntro` 1:1)

Fullscreen `position: fixed; inset: 0`, `backgroundColor = product.backgroundColor ?? MIDNIGHT_INK`:

1. **Atmospheric creature backdrop** — same `PRODUCT_ILLUSTRATION` map and focal points as `ProductIntro` (top 42%, opacity 0.5, `brightness(1.15) saturate(0.95)`, bottom fade-into-bg gradient).
2. **Back arrow** top-left, safe-area aware → `navigate(-1)`.
3. **Heading** `Välkommen till\n{product.name}` — `font-serif`, 28px, centered.
4. **Tagline** `product.tagline` — cream, opacity 0.6.
5. **Body paragraphs** — joined from `productIntros[productId].slides[*].body`, split on `\n\n`.
6. **Framed preview-question card** — `marginTop:32`, `padding:24`, `borderRadius:14`, `bg:rgba(11,16,38,0.35)`, `border:1px solid rgba(253,246,227,0.20)`. Kicker: `En fråga ur {product.name}` (uppercased via CSS). Quote: `PREVIEW_QUESTION[productId]`.
7. **Two-line meta** — `{priceSek} kr · Engångsköp · Tillgång för alltid` + `Utvecklat av psykologer · 29 års klinisk erfarenhet`.
8. **CTA button** `Köp · {priceSek} kr` (or `Köp` while loading) — `productTileColors[productId].tileLight ?? BONKI_ORANGE` background, `MIDNIGHT_INK` text. Click runs the existing `create-checkout` flow (no `returnCard` param).
9. **Trust line** `Säker betalning · Ingen prenumeration`.
10. **Escape link** `Utforska andra produkter` — cream underlined text-link → `/`.

### Removed

- Entire `if (isStillUs) { return <BottomSheet…> }` block (~150 lines: drag handle, swipe-to-dismiss, overlay).
- `AnimatePresence` wrapper.
- `cardId`, `currentCardTitle` props.
- `useCardImage` import.
- `returnCard` query parameter on `successUrl`.

### Preserved

- `onAccessGranted` fires on `already_purchased`.
- Demo/`isDemoParam` mount-effect bypass.
- Hidden 3-second long-press dev bypass on the price line (demo mode only).
- 503/error states + CTA loading state.

### Verification

1. App builds, TS clean.
2. Vårt Vi paywall (the broken case): fullscreen, not a bottom sheet — visually identical template to the kids paywalls.
3. All 7 products render the same template (only copy/color/illustration vary).
4. Owned-product tap → CardView still loads normally (confirms its dead-code ProductPaywall call doesn't crash even though props no longer exist).
5. CTA → Stripe checkout (no `returnCard` query).
6. Escape link → `/`; back arrow → previous screen.
7. First-visit intro vs subsequent-visit paywall branch in `ProductHome` still works.

### Rollback

Single-file `git revert` of `src/components/ProductPaywall.tsx`. No DB, edge-function, or routing changes.

