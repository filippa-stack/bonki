Apply 6 surgical edits to `src/components/ProductLibrary.tsx` only. No other files touched. No imports added or removed. NO COPY CHANGES — every visible string stays exactly as it currently is.

## Edits

**1. `LibraryHeader`** — wrapper `marginBottom: 32`; h1 `letterSpacing: '0'`; subtitle `fontSize: 11`, `letterSpacing: '0.10em'`. Text content unchanged.

**2. `SectionEyebrow`** — replace function body with a single `<p>`: body font, 10/600, letter 0.12em, uppercase, color `rgba(253,246,227,0.45)`, margin `0 0 10px`, padding `0 4px`. Drop divider div + paddingTop wrapper. `label` prop and all callsite text unchanged.

**3. `StillUsMarquee`** — replace entire function body with the spec'd JSX:
- Solid `#6495ED` background, `padding: 16`, `borderRadius: 14`, `minHeight: 97` (no aspectRatio).
- Left: two nested concentric circle divs. Outer: 75px square (`flex: '0 0 75px', aspectRatio: '1 / 1'`), `borderRadius: '50%'`, `background: '#5A85D5'`, flex-centered. Inner: `width: '70%', height: '70%'`, `borderRadius: '50%'`, `background: 'rgba(15, 30, 80, 0.18)'`, flex-centered, contains the illustration at `width: '90%', height: '90%', objectFit: 'contain'`.
- Right column: flex column, justify-center, gap 4. Serif "Vårt Vi" 22/500 (`var(--font-display)`, color `onColorText`, lineHeight 1.05, letterSpacing -0.005em). Italic `{TAGLINES.still_us}` 13 (display font italic, opacity 0.85, lineHeight 1.35). Pill row with `marginTop: 8`: `{completedCount} av {totalCards}` pill (bg `rgba(255,255,255,0.18)`, radius 999, padding `4px 12px`, fontSize 11, weight 600) + `{totalCards} samtal` small-caps (opacity 0.55, fontSize 10, letterSpacing 0.08em, uppercase, weight 600).
- `onColorText = '#F5E8CC'`. Remove `tasted` const. Use existing `TAGLINES.still_us` — no hardcoded copy. Keep signature/props.

**4. `LibraryKidsTile`** (anchor by content, not line number):
- Find the line that calls `getCalmInterior` with the product id and frame as arguments. Replace it with a conditional `color-mix`: when the product id equals `'jag_i_varlden'` use `` `color-mix(in srgb, ${frame} 72%, #FFF8DC)` ``; otherwise use `` `color-mix(in srgb, ${frame} 75%, white)` ``. Leave the `getCalmInterior` import in place even though it is no longer called.
- Inner plate div (the absolutely-positioned div with `backgroundColor: interior` and `borderRadius: 12`): `top: 14, left: 14, right: 14, bottom: '30%'` → `top: 9, left: 9, right: 9, bottom: '20%'`.
- Hairline div (`aria-hidden="true"`, `height: 1`, `backgroundColor: darkText`): `left: 14, right: 14, bottom: '30%'` → `left: 9, right: 9, bottom: '20%'`.
- Title strip div (the absolutely-positioned wrapper containing the product name `<span>`): `height: '30%', padding: '12px 14px'` → `height: '20%', padding: '8px 9px'`.
- Illustration `<img>` inside the inner plate: `width: '85%', height: '85%'` → `width: '92%', height: '92%'`.
- Typography and all copy unchanged.

**5. ProductLibrary return JSX** — STRUCTURAL DELETIONS ONLY:
- Delete the entire `untriedProduct` nudge IIFE block ("Prova X" button).
- Delete the entire `lastSlug` nudge IIFE block (lastProduct button).
- Keep `<LibraryResumeCard global />` and wrapping div exactly as-is.
- Keep ALL SectionEyebrow labels unchanged.
- Keep the italic "Åldrarna är en vägledning..." `<p>` exactly as-is.

## Final vertical order
1. KontoIcon
2. LibraryHeader
3. LibraryResumeCard (preserved)
4. SectionEyebrow "För er som par"
5. Vårt Vi solid cornflower banner
6. SectionEyebrow "För barn · För familjen"
7. "Åldrarna är en vägledning..." italic subtitle (preserved)
8. 2-col grid of 6 kids tiles
9. Bottom safe-area pad

## Verification
Screenshot `/?devState=browse` at 390×844 and confirm:
- No "Prova" or lastProduct nudges
- LibraryResumeCard still present below header
- "Åldrarna är en vägledning..." subtitle still present above grid
- All eyebrow labels unchanged
- Vårt Vi banner is flat solid `#6495ED`, ~97px tall, 75px concentric circle on left with visible inner darker disc
- Kids tiles: 9px insets, lighter monochrome plates, illustrations ~92% of plate, 20% title strip