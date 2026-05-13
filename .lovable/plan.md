# Eyebrow brightness + per-hue dark text on light tiles (v2)

Two surgical passes. No layout, no copy, no business logic.

## Task 4 — Brighten eyebrow/section labels (Option A)

Add palette token `TEXT_EYEBROW = 'hsl(35, 45%, 90%)'` (warm off-white, ≈ `#F1E8D8`). Use full opacity in place of the muted lantern variants. If QA shows it reads neutral-white, fall back to `rgba(255,255,255,0.75)` and report.

### Apply to

- `src/components/ProductLibrary.tsx`
  - `LibraryHeader` "Samtal för hela familjen" (line ~97) → `TEXT_EYEBROW`, drop `0.55`.
  - `SectionEyebrow` ("FÖR ER SOM PAR", "FÖR BARN · FÖR FAMILJEN") (line ~115) → `TEXT_EYEBROW`, drop `0.45`.
- `src/components/NextActionBanner.tsx` — `labelColor` ("FORTSÄTT" eyebrow on resume banner, lines 56/78) → `TEXT_EYEBROW`.

### Visual verification before exempting paywall eyebrows

Open the preview at the Vårt Vi paywall and one kids paywall (e.g. Jag i Mig) using the existing `?devState=` flow. Check the small-caps eyebrows in:

- `src/components/ProductPaywall.tsx` — "Utvecklat av psykolog" trust eyebrow (~line 358) and the per-question preview label (~line 437).
- `src/components/ProductIntro.tsx` — equivalent trust/preview eyebrows (~line 405, ~line 480).
- `src/components/PaywallBottomSheet.tsx` — any small-caps eyebrows (audit; current file uses opacity-tinted lantern in trust block).

If they read washed out against the tinted panel, swap them to `TEXT_EYEBROW` too. Report which were swapped.

### Leave unchanged

Bottom tab inactive items, "Åldrarna är en vägledning…" body line, all H1 titles + product names + paywall sticky meta.

## Task 5 — Per-hue dark text on light tiles

Update `productDarkText` in `src/lib/palette.ts` to deep-saturated darker shades of each tile's hue. Vardag tuned per clarification:

```
jag_i_mig:        '#5B2814'  // hsl(15, 63%, 22%)  deep burnt sienna
jag_med_andra:    '#511F39'  // hsl(330, 45%, 22%) deep plum
jag_i_varlden:    '#363D14'  // hsl(75, 50%, 16%)  deep olive
vardagskort:      '#175C3D'  // hsl(150, 55%, 20%) deep forest (NOT #0D4730 — preserves hue cohesion)
syskonkort:       '#3D2451'  // hsl(280, 40%, 22%) deep violet
sexualitetskort:  '#5A2515'  // hsl(10, 60%, 22%)  deep rust
still_us:         '#0A1628'  // unchanged
```

If Vardag QA shows insufficient contrast against the mint tile, deepen toward hsl(150, 60%, 17%) ≈ `#11503A` and report.

Final hex per tile after visual QA will be reported in the deliverable.

### Consumer adjustments

- `src/components/KidsTileFrame.tsx`
  - Subtitle (line ~213) — keep `darkText` color, opacity stays `0.85`.
  - Meta row (line ~230) — opacity from `0.7` → `0.65` (micro-text exception, approved).
  - Title — full opacity, no change.

All other consumers (`ProductCardTile`, `LibraryResumeCard`, `KidsCardPortal`) read `productDarkText` directly and inherit the new values automatically.

### Leave unchanged

Tile background colors, illustrations, dimensions, padding, shadows, borders, italic rules from Task 2, Vårt Vi dark blue tile (`still_us` retains `#0A1628`).

## Deliverable

- `tsc` clean.
- Modified files list.
- Per-tile QA report with final hex values (especially Vardag).
- Paywall eyebrow audit result: which (if any) of ProductPaywall / ProductIntro / PaywallBottomSheet eyebrows were swapped to `TEXT_EYEBROW`.
- Confirm Option A held, or report fallback to Option B.
