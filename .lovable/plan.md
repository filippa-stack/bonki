# Vårt Vi completion screen — align with Midnight Ink session

Extends the in-flight Portal + Session redesign (Part 2) to cover the completion screen rendered after the last question. Visual-only; no logic changes.

## Scope

- **File**: `src/pages/CardView.tsx`, the `cardViewMode === 'completion'` branch for Still Us starting at line 1785 (the kids completion branch above it at line 1338 is untouched).
- **Gate**: existing `isStillUs` / Still Us completion branch — kids completion screen is not affected.
- **Components**: `SimpleTakeaway` is reused as-is; only its surrounding chrome changes.

## Visual changes

### 1. Background — Midnight Ink

Replace the current `EMBER_NIGHT` (#1A0806, sourced from `product?.backgroundColor`) on the outer `motion.div` (line 1805) with `MIDNIGHT_INK` (#1A1A2E), matching the in-session background set by Part 2. Continuity from final question → completion → no perceptible transition.

### 2. Headline + check badge

Lines 1814–1867:
- Check badge circle (line 1819): keep saffron tint but rebalance against Midnight Ink — `backgroundColor: 'rgba(233, 200, 144, 0.12)'`, glyph color stays `#D4A03A` / `SAFFRON_FLAME`.
- `<h2>` headline (line 1837): change `color: DEEP_SAFFRON` → `color: LANTERN_GLOW` (#F5E8CC, already aliased as `EMBER_GLOW` in this scope), full opacity. Serif size unchanged. This matches the portal/product-home title register.
- Subheadline `<p>` for `su-mock-0` (line 1853): keep DRIFTWOOD at 0.6 — reads correctly on Midnight Ink, no change.

### 3. Takeaway nudge + input

Lines 1869–1903:
- "VALFRITT" eyebrow (line 1877): unchanged, already on rgba driftwood.
- "Något ni vill minnas?" (line 1889): change to italic serif — `fontFamily: 'var(--font-serif)'`, `fontStyle: 'italic'`, `color: 'rgba(245, 232, 204, 0.75)'` (LANTERN_GLOW @ 0.75).
- `<SimpleTakeaway>` (line 1900): wrap in a div with the lantern glow so the cream input field sits on a warm halo against Midnight Ink:
  ```
  boxShadow: '0 0 40px rgba(233, 200, 144, 0.08), 0 8px 32px rgba(0,0,0,0.15)'
  borderRadius: 14px
  ```
  Internal SimpleTakeaway styling (cream surface, save indicator) stays as-is. The component already renders "✓ Sparat i era samtal" copy — no edit needed.

### 4. Gör exercise collapsible

Lines 1906–1966: tints already reference DEEP_SAFFRON / DRIFTWOOD on translucent backgrounds. Keep as-is — reads correctly on Midnight Ink.

### 5. Primary CTA "Nästa samtal"

There are three CTA branches in this completion view, all need the same warm-gold pill treatment:

- **su-mock-0 purchased branch** (lines 2117–2140)
- **all_complete branch** "Till Ert utrymme" (lines 2190–2213)
- **Default branch** (lines 2246–2269)

Replace each primary button's styling with:
```
height: 56px
minWidth: 200px / maxWidth: 280px
borderRadius: 28px
backgroundColor: color-mix(in srgb, #E9C890 28%, rgba(255,255,255,0.06))
border: 1px solid color-mix(in srgb, #E9C890 50%, transparent)
color: #F5E8CC (LANTERN_GLOW)
fontFamily: var(--font-display)
fontSize: 16px
fontWeight: 600
```
(Where `#E9C890` is WARM_GOLD as used in Part 2's session CTA.)

Föregående chevron buttons that flank the CTA stay unchanged — already DRIFTWOOD @ 0.7, reads on Midnight Ink.

### 6. Secondary text link "Till Vårt Vi" / "Tillbaka"

Lines 2066–2084, 2142–2157, 2273–onward: change to portal-sequence-nav register:
```
fontFamily: var(--font-display)
fontSize: 14px
color: rgba(245, 232, 204, 0.65)  // LANTERN_GLOW @ 0.65
no chrome, centered, marginTop: 20px
```

### 7. Free-card purchase branch (su-mock-0, not purchased)

Lines 1976–2085: this is the inline paywall after the free card. Apply the same primary-pill treatment to "Lås upp Vårt Vi" (currently a flat `#E85D2C` rectangular button at line 2020) — match the warm-gold pill. Price line and "Säker betalning" microcopy stay DRIFTWOOD @ low opacity, which reads on Midnight Ink. The Android-native fallback box can keep its current neutral surface.

## Out of scope

- Kids completion branch (line 1338) — untouched.
- Save logic (`couple_takeaways`, `complete_couple_session_step`) — untouched.
- Routing via `postCompletionNav` — untouched.
- The local constants `EMBER_NIGHT`, `BARK`, `DEEP_SAFFRON`, `EMBER_GLOW` declared at lines 1787–1792: leave declarations in place and just stop using `EMBER_NIGHT` as the background. Avoids unrelated diff churn.

## Verification (390×844)

- Finish a Still Us session → completion renders on Midnight Ink with no background flash.
- Headline reads in LANTERN_GLOW serif; check badge has saffron tint that doesn't fight the background.
- Takeaway field sits on a visible warm halo; "✓ Sparat i era samtal" still appears.
- Primary CTA is a warm-gold pill matching the in-session "Fortsätt" pill from Part 2.
- Secondary "Till Vårt Vi" / "Tillbaka" links match portal sequence-nav typography.
- Free-card purchase branch (route to `su-mock-0` while not purchased) shows pill-styled "Lås upp Vårt Vi".
- Kids completion (e.g. complete a Jag med Andra card) is visually unchanged.
