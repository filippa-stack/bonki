## Library editorial polish — disclaimer alignment + resume banner redesign

Two scoped changes. No functional regressions; the resume card's external API stays unchanged.

---

### 1. Disclaimer left-alignment

**File:** `src/components/ProductLibrary.tsx` (lines 582–594)

In the disclaimer `<p>` under the "För barn · För familjen" eyebrow:
- `textAlign: 'center'` → `textAlign: 'left'`
- `padding: '0 4px'` (matches `SectionEyebrow`'s left edge)
- `margin: '4px 0 18px'` → `margin: '8px 4px 16px'` (per spec: 8px above, 16px below; align with eyebrow's 4px horizontal padding via the explicit padding above)
- All other styles unchanged: italic Fraunces, 12px, `LANTERN_GLOW` @ 0.55, `lineHeight: 1.5`

---

### 2. Resume banner redesign (LibraryResumeCard)

**File:** `src/components/LibraryResumeCard.tsx`

Replace the inner JSX of the returned `<button>` with the new editorial composition. Keep all data-fetching, props, navigation, realtime subscription, and dev-mock logic exactly as-is. Component's external interface stays identical.

**Eyebrow above banner**

Wrap the returned `<button>` in a `<div>` and prepend a small-caps "FORTSÄTT" label:
- Font: `var(--font-body)`, 9px, weight 600, `letterSpacing: '0.14em'`, uppercase
- Color: `LANTERN_GLOW` @ 0.45
- Margin: 0 0 8px, padding: `0 4px` (matches the banner's content edge once container padding is accounted for)

**Banner container styling (replace current button styles)**

```text
display: flex
alignItems: stretch
gap: 14px
width: 100%
padding: 14px 16px
borderRadius: 14px
background: color-mix(in srgb, {accent} 12%, transparent)
border: 1px solid color-mix(in srgb, {accent} 20%, transparent)
cursor: pointer
textAlign: left
WebkitTapHighlightColor: transparent
```

Where `{accent}` is `PRODUCT_ACCENT[display.productId]` (already computed in the component as `accent`). Drop the inset shadow / dark `#2A2D3A` background / outer ring.

**Left zone — 56px medallion**

```text
flex: 0 0 56px
width: 56px; height: 56px
borderRadius: 50%
background: {accent}                   // product frame color
display: flex; alignItems: center; justifyContent: center
overflow: hidden
```

Inner inset (70% size = ~40px circle):
- `width: 70%; height: 70%; borderRadius: 50%`
- `background: getCalmInterior(productId, accent)` — for `still_us`, hardcode `#5A85D5` so it matches the marquee's darker cornflower.
- Inside the inner circle: an `<img>` for the product illustration at `width: 100%; height: 100%; objectFit: contain; objectPosition: center; pointerEvents: none`. Use the same per-product illustrations imported in `ProductLibrary.tsx` (`illustration-still-us-tile`, `illustration-jag-i-mig`, etc.) — add a small `ILLUSTRATIONS` map at module scope in `LibraryResumeCard.tsx` mirroring the one in `ProductLibrary.tsx`.

This re-uses `getCalmInterior` from `@/lib/productTileVariants` — add the import.

**Middle zone — text**

```text
flex: 1
display: flex; flexDirection: column; justifyContent: center; gap: 3px
minWidth: 0
```

Line 1 (card title — primary):
- `fontFamily: 'var(--font-display)'`, 16px, weight 500
- color: `LANTERN_GLOW`
- `lineHeight: 1.1`
- truncate: `overflow: hidden; textOverflow: ellipsis; whiteSpace: nowrap`
- Content: `display.cardTitle`

Line 2 (context):
- `fontFamily: 'var(--font-display)'`, `fontStyle: 'italic'`, 11px, weight 400
- color: `LANTERN_GLOW` @ 0.65
- `lineHeight: 1.3`
- truncate same as above
- Content: `${display.productName} · ${display.stepLabel}` where `stepLabel` already comes through as e.g. "Pausad vid Fråga 3 av 6" — keep that exact string (no copy changes).

**Right zone — chevron**

Replace the current `<ChevronRight>` with:
```text
flexShrink: 0
display: flex; alignItems: center; justifyContent: center
padding: 0 4px
color: {accent}
```

Use the existing `ChevronRight` lucide icon at `size={18}` with `strokeWidth={1.5}`, `color={accent}`, full opacity. (Avoids adding new imports.)

**What is removed**

- The 8px accent dot
- The dark `#2A2D3A` background
- The inset shadow + outer ring
- The current single-line title + tiny secondary line layout

**What is kept**

- All `useEffect` hooks, demo/dev mock logic, realtime subscription, debounce, fetch logic
- Props (`activeTab`, `global`, `forceMock`)
- Navigation: `navigate(\`/card/${display.cardId}\`)`
- The `accent` / `accentRgba` derivation (we'll still use `accent`; `accentRgba` becomes unused — remove it to keep the file clean)
- The early `if (!display) return null` guard

---

### Verification (390×844, `/?devState=browse` and library)

- Disclaimer "Åldrarna är en vägledning…" left-aligned, sharing left edge with "FÖR BARN · FÖR FAMILJEN"
- "FORTSÄTT" eyebrow visible above the resume banner
- Banner background and border tinted to the resumed product's frame color (warm coral when JIM, cornflower when Vårt Vi, etc.)
- 56px medallion: outer = frame, inner 70% circle = calm interior (or `#5A85D5` for Vårt Vi), product illustration centered inside
- Card title in serif 16px, italic serif context line below
- Chevron in product accent color on the right
- Tap still routes to `/card/{cardId}` — no functional regression
