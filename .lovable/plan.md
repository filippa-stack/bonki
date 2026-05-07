# BATCH 2 — JIM color propagation (final, approved)

## (a) Manifest token updates

**`src/data/products/jag-i-mig.ts`** (lines 517–524):
- `accentColor` → `hsl(41, 78%, 48%)`
- `accentColorMuted` → `hsl(41, 70%, 88%)`
- `secondaryAccent` → `hsl(41, 78%, 48%)`
- `tileMid` → `#D9A012`
- `tileDeep` → `#9A6B0A`

(`backgroundColor #115D57`, `ctaButtonColor #F5B82E`, `tileLight #F5B82E`, `darkTextOnTile true` unchanged.)

**`src/lib/palette.ts`** mirror in `productTileColors.jag_i_mig`:
- `tileMid` → `#D9A012`
- `tileDeep` → `#9A6B0A`

## (b) `darkTextOnTile` propagation

Dark-text token: `#5A3A1F` (matches established `ProductLibrary.tsx` value).

1. **`src/components/ProductCardTile.tsx`** — accept `darkText?: boolean`; swap title color `#FFFFFF` → `#5A3A1F` and weaken textShadow when true.
2. **`src/components/KidsProductHome.tsx`** — `CategoryTile` reads `product.darkTextOnTile`. When true: title (288), layer-number (271), progress count (318) → `#5A3A1F`; bottom scrim (247) → light-wash gradient (`rgba(255,255,255,0.30 → 0)`); progress bar fill (309) → `#5A3A1F` (instead of SAFFRON_FLAME for the active state). Pass `darkText={product.darkTextOnTile}` into `<ProductCardTile>` (line 735).
3. **`src/components/NextConversationCard.tsx`** — gate purely on `product.darkTextOnTile`. When true: eyebrow → `rgba(90,58,31,0.75)`, title → `#5A3A1F`, category → `rgba(90,58,31,0.65)`, all `textShadow` → `none`.

No edits to `KidsCardPortal` portal title (sits on dark surround), `ResumeBanner`, `UnifiedResumeBanner`, or `LibraryResumeCard` — text in all four cases sits on dark backgrounds, not on the product tile color.

## (c) CardView accent + (d) paywall

`accentColor`/`secondaryAccent` updates propagate automatically into:
- `CardView.tsx` session glow / gradients / accent ring
- `KidsCardPortal.tsx` portal theme
- `ProductHome.tsx` shell theme
- `ProductIntro` accent
- Completion ceremony (inherits CardView accents)
- **Paywall** — `Paywall.tsx` and `PaywallFullScreen.tsx` read `product.accentColor` / `product.ctaButtonColor` for header glow, CTA, and sample-question pills. The manifest update flows through. After applying, I'll inspect the JIM paywall and flag any hardcoded teal — if any surface still renders teal, that's a follow-up patch logged in the verification step (not blocking this batch).

## Verification (after apply)

Capture screenshots of:
- JIM library tile (unchanged)
- JIM product home (deep teal bg + marigold tiles, dark text)
- JIM portal (marigold inner frame, dark teal surround, white title)
- JIM CardView session (amber glow)
- NextConversationCard (amber bg, dark text)
- ResumeBanner (marigold bloom on dark)
- JIM paywall (marigold accents — flag stale teal if found)

## Out of scope
- `backgroundColor #115D57` deep teal — kept by design.
