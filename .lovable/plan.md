# Kids Portal — Editorial Redesign

Single-file restructure of `src/pages/KidsCardPortal.tsx`. Replaces the current illustration-dominant tile with an editorial layout (eyebrow + serif title + italic subtitle + framing paragraph + KidsTileFrame preview + small-caps time + CTA + text-only sequence nav). Vårt Vi (Still Us) branch in this file stays byte-identical to current production.

## Scope

**Edit:** `src/pages/KidsCardPortal.tsx` (kids branch only)

**Reuse (no changes):** `KidsTileFrame`, `getCalmInterior`, `productDarkText`, `useProductTheme`, `useProductAccess`, `useKidsProductProgress`, `PaywallBottomSheet`, `PortalBrowseSheet`, swipe + portalPhase animation logic, routing.

**Add:** A `productAccentColor` map (in `src/lib/palette.ts`) keyed by product id, with the per-product CTA accent values from the spec.

## Layout (top → bottom)

```
[‹ back]                              [account ⊙]
                MINA KÄNSLOR                          ← eyebrow
                    Glad                              ← serif 28
              Vad gör dig glad?                       ← italic serif 14
   <framing paragraph if present, font-display 15>
              ┌──────────────┐
              │ KidsTileFrame│  75% vw, 3:4
              │  with title  │
              └──────────────┘
                CA 5–8 MIN                            ← if present
                  ✓ Klart                             ← if completed
   ┌─────────────────────────┐
   │      Starta samtal      │                       ← glassy pill
   └─────────────────────────┘
   ‹ Föregående    3 AV 21    Nästa ›
```

## Element details

1. **Top bar** — `ChevronLeft` (left, LANTERN_GLOW @ 0.65, 44×44 hit area) and a 32×32 thin-bordered circle with `User` icon (right). Account icon routes to `/settings` (or whatever the existing account route is — confirm during impl, fall back to no-op if no account route exists in this app yet).
2. **Eyebrow** — `category.title` uppercased, `var(--font-body)` 11/600, letter-spacing 0.10em, LANTERN_GLOW @ 0.55, centered.
3. **Title** — `card.title`, `var(--font-serif)` 28/500, line-height 1.1, LANTERN_GLOW.
4. **Italic serif subtitle** — `card.subtitle`, `var(--font-serif)` italic 14/400, LANTERN_GLOW @ 0.85.
5. **Framing paragraph** — `card.description` (existing field, see Edge case 2 below). `var(--font-display)` 15/400, line-height 1.55, LANTERN_GLOW @ 0.85, max-width 320, centered. Section omitted entirely when absent.
6. **Card preview tile** — `KidsTileFrame` at width `75vw` (capped at e.g. 320px on wider phones), 3:4 aspect, `frame={product.tileLight}`, `interior={getCalmInterior(product.id, product.tileLight)}`, `darkText={productDarkText[product.id]}`, `title={card.title}`, `stripFraction={0.20}`. Illustration (existing `useCardImage`) rendered as child with `width:100%; height:100%; object-fit:contain`. Non-interactive.
7. **Time estimate** — `estimateMinutes(...)` already in file, uppercased, small-caps style. Hide if absent.
8. **Completion indicator** — `✓ Klart`, `var(--font-serif)` italic 13, SAFFRON_FLAME. Only when `allTimeSet.has(card.id)`.
9. **CTA** — width 100% (max 420), height 56, radius 28. Bg `color-mix(in srgb, ${productAccentColor} 40%, rgba(255,255,255,0.06))`, border `color-mix(in srgb, ${productAccentColor} 60%, transparent)`. Label: `Starta samtal` / `Fortsätt samtal` (when `activeSet.has(card.id)`) / `Gör om samtalet` (when `allTimeSet.has(card.id)` and not active). Locked-state label `Lås upp alla N samtal` preserved.
10. **Sequence nav** — three-column grid, text-only `‹ Föregående` / `N AV M` / `Nästa ›`. Disabled opacity 0.35 on first/last.

## productAccentColor map (new in palette.ts)

```ts
export const productAccentColor: Record<string, string> = {
  jag_i_mig:        '#F2BC97',
  jag_med_andra:    '#E59FCF',
  jag_i_varlden:    '#D8E145',
  vardagskort:      '#A8E5C0',
  syskonkort:       '#E0BFEA',
  sexualitetskort:  '#CFA08D',
};
```

## Preserved behavior

- `portalPhase` state machine, zoom-into-illustration animation, swipe drag/threshold, slide direction variants. The animated element wraps the **card preview tile** (not the whole layout) — same as today, just with `KidsTileFrame` swapped in for the inline illustration block.
- Paywall intercept (`startSession` checks `productIsPurchased`).
- `useProductTheme`, `usePageBackground`, browse sheet, paywall sheet — unchanged.
- Vårt Vi: `isStillUs` branch (overlays, transform/filter values) untouched. Current implementation already uses `isStillUs` checks for the animation; the editorial layout is applied only to the kids (non-Still Us) render path. **However:** Still Us currently renders through this same component. Confirm during impl whether Still Us hits a different portal route — if it does, this file is kids-only and no branching needed; if not, gate the new editorial layout behind `!isStillUs`.

## Edge cases (flagged)

1. **`productAccentColor` missing** — added to `palette.ts` per above.
2. **No dedicated `framingCopy` field on `Card`** — `Card` type has `subtitle` and `description`. Plan uses `card.subtitle` for the italic prompt line and `card.description` for the framing paragraph. **Most cards today only set `subtitle`** (e.g., `jim-glad`'s subtitle is "Vad som ger energi och glädje — och hur vi delar det", and there's no `description` or separate question line). This means out of the box: the italic line will show the existing subtitle, and the framing paragraph will be empty for almost every card. **Decision needed:** ship with empty framing paragraph (data layer fills in over time) OR repurpose `subtitle` as the framing paragraph and use `card.questionHook` (existing field) as the italic question. Recommendation: ship with `subtitle → italic`, `description → framing` so layout supports the spec; surface the data gap to the user and let content fill in `description` per card.
3. **Account icon route** — no obvious account/settings route referenced in this file today. Will use the same target as `KontoIcon` elsewhere in the app (likely `/settings` or `/konto`); confirm during impl.
4. **Still Us shares this file** — current code uses `isStillUs` flags. Will gate the new editorial layout behind `!isStillUs` so Still Us continues rendering exactly as today.

## Verification (390×844, /?devState=browse)

Visit one card portal per kids product (`jim-glad`, `jma-*`, `jiv-*`, `vk-*`, `sk-*`, `nki-*`):
- Atmospheric bg fills viewport
- Eyebrow / serif title / italic subtitle render correctly
- Framing paragraph appears only when `description` is present
- KidsTileFrame preview shows correct frame + calm interior + hairline + title strip
- CTA label flips correctly across not-started / active / completed states
- Sequence nav disables on first/last
- Swipe still navigates between cards; tap on the tile still triggers `startSession`; portal-zoom animation still plays
- Vårt Vi card portal renders byte-identical to current production
