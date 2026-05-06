## AdultCardPortal layout v2

Single-file change: `src/pages/AdultCardPortal.tsx`. `stillUsPortalCopy.ts` already exposes `getPortalCopy(cardId) → { subtitle, preparation }` and is imported.

### Changes

1. **Scroll + sticky bar shell.** The current full-height flex column splits into:
   - Scroll region: `overflow-y: auto`, safe-area top padding, `padding-bottom: calc(112px + env(safe-area-inset-bottom))` to reserve room for the sticky bar.
   - Sticky CTA bar: `position: fixed; left/right/bottom: 0`, full width, with `padding-bottom: env(safe-area-inset-bottom)`.

2. **Header zone unchanged.** Eyebrow (category title), card title, subtitle (preferring `getPortalCopy(card.id)?.subtitle`, falling back to `card.subtitle`).

3. **Preparation paragraph.** Lifted out of the header into its own block between subtitle and card. `margin: 36px auto`, max-width 520px, sans 14px / line-height 1.55, opacity ~0.72, left-aligned. Renders only when `product.slug === 'still-us'` and `getPortalCopy(card.id)?.preparation` exists.

4. **Card container — purely visual.** Remove the title-repeat zone (lines 350–369). Illustration zone expands to fill (`flex: 1 1 auto` instead of `0 0 65%`), keeping the saffron accent line as the closing visual element. Completion checkmark overlay and tap-to-start behavior unchanged. Aspect ratio 3/4 preserved.

5. **Action zone trimmed.** Inside the scroll region keep only:
   - `✓ Klart` italic mark when `isCompleted`
   - prev/next text nav with "n av N"
   Remove the time-estimate block ("CA n–n MIN", lines 375–385) and drop the now-unused `getPromptCount` helper. The CTA button moves to the sticky bar.

6. **Sticky CTA bar.**
   - Backdrop: `linear-gradient(to top, ${DEEP_DUSK_BG} 0%, color-mix(in srgb, ${DEEP_DUSK_BG} 92%, transparent) 60%, transparent 100%)` + `backdropFilter: blur(12px)`. Same color as page bg → bar dissolves into the page, no darker band.
   - Inner: `padding: 16px 20px calc(16px + env(safe-area-inset-bottom))`.
   - Button: same `ctaBg` / `ctaBorder` / `LANTERN_GLOW`, 56px height, max-width 420px, centered. `ctaLabel` logic unchanged ("Gör om samtalet" when completed, else "Starta samtal").
   - z-index above scroll region, below `PaywallBottomSheet` / `KontoSheet`.

### State handling

No state-machine changes. Both unstarted and completed states render the same layout; only `✓ Klart`, the card-corner checkmark, and the CTA label differ. Paywall flow, KontoSheet, ProductHomeBackButton, theme/background hooks, dev/demo bypass, progress loading guard — all unchanged.

### Fallback safety

`getPortalCopy` returns `undefined` for unknown ids; both subtitle override and preparation block guard on the optional value. Non-still-us products and still-us cards without an entry render without error and simply omit the preparation block.

### Verification

- `/product/still-us/portal/su-mock-riktningen?card=su-mock-14` (completed): preparation visible above card, no time estimate, `✓ Klart` above prev/next, sticky "Gör om samtalet" pinned to bottom, gradient fades cleanly into page bg.
- An unstarted card in same category: same layout, no `✓ Klart`, CTA reads "Starta samtal".
- 375×667 viewport: preparation + card reachable by scroll, CTA stays pinned, safe-area respected.
- Card without a `stillUsPortalCopy` entry: page renders, preparation block omitted, no console errors.
