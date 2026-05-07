# Batch C — Library Editorial Redesign (revised)

## Scope

Redesign `ProductLibrary.tsx`: editorial header, locked kids order, distinct Vårt Vi marquee composition, 2-column kids grid with always-visible age meta in title strip footer. Vårt Vi is visually re-housed (medallion marquee), not stretched.

## Changes — `src/components/ProductLibrary.tsx`

### 1. Editorial library header

Above the resume card, add a centered header block:

- Eyebrow: `SAMTAL FÖR HELA FAMILJEN` — `var(--font-body)`, 10px, weight 600, `letter-spacing: 0.15em`, uppercase, color `rgba(253,246,227,0.45)`, `marginBottom: 6px`.
- Title: `Biblioteket` — `var(--font-display)` (Fraunces), 28px, weight 500, `letter-spacing: -0.005em`, color `#FDF6E3`, `fontVariationSettings: "'opsz' 28"`.
- Wrapping div: `text-align: center`, `marginTop: 0`, `marginBottom: 20px`, sits inside the existing `paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)'` container (move that padding to the header wrapper, drop from resume card).

### 2. Section labels (small-caps eyebrows)

Replace the existing "Ni som par" and "Barn & Familj" labels:

- Couples section: `FÖR PAR`
- Kids section: `FÖR BARN · FÖR FAMILJEN`

Both keep the existing eyebrow style (13px, weight 700, `letter-spacing: 2px`, uppercase, `#FDF6E3` @ 0.55, mushroom-tinted divider above).

### 3. Vårt Vi marquee — horizontal medallion composition

Remove the Vårt Vi `PastelTile`. Inline a `StillUsMarquee` block under the FÖR PAR header:

```text
┌─────────────────────────────────────────────────┐
│  ⬤  medallion  Vårt Vi                          │
│   (110px)      tagline (italic serif 13px)      │
│                3 av 21 · pill / "Du har provat" │
└─────────────────────────────────────────────────┘
```

- Container: full-width button, `display: flex`, `alignItems: center`, `gap: 16`, `padding: 16`, `borderRadius: 18`, `background: rgba(15,15,15,0.55)`, `backdropFilter: 'blur(22px)'`, `border: 1px solid rgba(255,255,255,0.10)`, subtle inset shadow.
- Medallion (left, fixed 110×110): `borderRadius: 9999`, `background: PRODUCT_ACCENT.still_us` (`#6495ED`), `flexShrink: 0`, `overflow: hidden`, illustration `illustrationStillUs` rendered absolutely inset 6px, `objectFit: contain`.
- Right column (`flex: 1`, `min-width: 0`):
  - Title `Vårt Vi` — Fraunces 22px/500, `#FDF6E3`, `letter-spacing: -0.005em`, `margin: 0`.
  - Tagline (`TAGLINES.still_us`) — Inter 12px, `rgba(253,246,227,0.72)`, `lineHeight: 1.35`, `marginTop: 4`.
  - Progress pill — same glass treatment as kids tiles, `marginTop: 10`, content per state (`{n} av {total}` / `Du har provat` with logo / `{total} samtal`).
- Tap → `navigate('/product/still-us')`.

### 4. Kids grid (2-column)

Convert kids `flex column gap:28` to `display: grid; gridTemplateColumns: '1fr 1fr'; gap: 12px`. Tile aspect stays at the existing `1 / 1.05`.

Keep order locked: `[jagIMig, jagMedAndra, vardag, syskon, jagIVarlden, sexualitet]` filtered through `isProductHiddenOnPlatform`. Drop the activity-based reorder. Update `defaultKidsOrder` to alias the same array so the existing nudge logic still works.

### 5. Age-guidance disclaimer

Directly under the `FÖR BARN · FÖR FAMILJEN` eyebrow, before the grid:

> Åldrarna är en vägledning. Ni känner ert barn bäst.

Style: `font-display` (Fraunces), italic, 12px, weight 400, color `LANTERN_GLOW` (`#FDF6E3`) at opacity 0.55, `lineHeight: 1.5`, centered, `marginTop: 4px`, `marginBottom: 18px`.

### 6. Tile metadata — title strip footer (always visible)

Modify `PastelTile` so the count + age-label live in the title strip footer (under the title/tagline block), not the pill. Add an always-visible small-caps row:

- New prop: `ageLabel?: string` (sourced from `product.ageLabel`).
- New row inside the title block, after the tagline:

```text
8 AV 21 · FRÅN 3 ÅR     (uppercase small-caps)
```

Style: `var(--font-body)`, 9px, weight 600, `letter-spacing: 0.08em`, uppercase, color `rgba(255,255,255,0.55)` (or `#5A3A1F` @ 0.55 when `darkTextOnTile`), `marginTop: 8`. Format:

- Purchased: `{completedCount} AV {totalCards} · {ageLabel}` (omit ` · ` segment if `ageLabel` missing).
- Unstarted/tasted: `{totalCards} SAMTAL · {ageLabel}`.

The bottom-left glass pill is removed (its info now lives in the strip). The "Du har provat" state collapses to a small `BonkiLogoMark` glyph at the right of the same footer row, color matching the small-caps text — confirms tasted state without redundant pill.

## What does NOT change

- `KidsTileFrame`, `ProductCardTile`, `productTileVariants` (Batch B work).
- Tile colors, accent map, illustrations, background gradients/scrims.
- Resume card component, "Prova X" / "Återuppta" nudges.
- Vårt Vi tagline text and navigation target.

## Verification (390×844)

After edits, confirm at `/library`:

1. Header: small-caps `SAMTAL FÖR HELA FAMILJEN` over centered serif `Biblioteket`.
2. Section labels read `FÖR PAR` and `FÖR BARN · FÖR FAMILJEN`.
3. Vårt Vi marquee: 110px cobalt circular medallion left, title/tagline/pill right, taps to `/product/still-us`.
4. Disclaimer line: italic serif Fraunces, locked copy.
5. Kids grid: 2 columns, 12 px gap, locked order JIM → JMA → Vardag → Syskon → JIV → (N&I unless iOS native).
6. Each kids tile shows the small-caps footer row with progress + age label (always visible, not state-gated).
7. No pill on kids tiles; "Du har provat" indicated by inline logo glyph in the footer row.
